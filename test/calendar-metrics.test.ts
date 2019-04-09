import { dateToKey, calculateOccupancy, OfficeHours, DayOfWeek, debugPrintDays } from "../src/calendar-metrics";
import { Event, EventType } from "../src/event";

const workDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

test('formatting date to YYYY-MM-DD string key', () => {
    let date = new Date("2019-04-05");

    let key = dateToKey(date);

    expect(key).toBe('2019-04-05');
});

test('calculating occupation in basic case', () => {
    // 9:00 - 10:00, 10:30 - 11:00, 15:00 - 16:00
    // 2.5 hours of occupancy 
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-01T10:30:00.000Z'),  new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR),
        new Event('event #3', new Date('2019-04-01T15:00:00.000Z'),  new Date('2019-04-01T16:00:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays)).occupancy();

    expect(occupancy.days).toHaveLength(1);
    expect(occupancy.total).toBeCloseTo(2.5 / (17- 8));

    let day = occupancy.days[0];

    expect(day.occupancy).toBeCloseTo(2.5 / (17 - 8));
    expect(day.numberOfEvents).toBe(3);
});

test('calculating occupation of fully overlapping events', () => {
    // 9:00 - 10:00, 09:00 - 09:30
    // 1 hour of occupancy 
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T09:30:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays)).occupancy();

    expect(occupancy.days).toHaveLength(1);
    expect(occupancy.total).toBeCloseTo(1 / (17- 8));

    let day = occupancy.days[0];

    expect(day.date).toBe('2019-04-01');
    expect(day.occupancy).toBeCloseTo(1 / (17 - 8));
    expect(day.numberOfEvents).toBe(2);
});

test('calculating occupation of partially overlapping events', () => {
    // 9:00 - 10:00, 09:30 - 11:00
    // 2 hours of occupancy 
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays)).occupancy();

    expect(occupancy.days).toHaveLength(1);
    expect(occupancy.total).toBeCloseTo(2 / (17- 8));

    let day = occupancy.days[0];

    expect(day.occupancy).toBeCloseTo(2 / (17 - 8));
    expect(day.numberOfEvents).toBe(2);
});

test('calculating occupation of multiple days', () => {
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-02T10:30:00.000Z'),  new Date('2019-04-02T11:00:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays)).occupancy();
    
    expect(occupancy.total).toBeCloseTo(1.5 / (2*(17 - 8)));
    expect(occupancy.days).toHaveLength(2);
});

test('skip free days when calculating occupation', () => {
    let events = [
        new Event('Friday', new Date('2019-04-05T10:30:00.000Z'),  new Date('2019-04-05T11:00:00.000Z'), EventType.REGULAR),
        new Event('Saturday', new Date('2019-04-06T10:30:00.000Z'),  new Date('2019-04-06T11:00:00.000Z'), EventType.REGULAR),
        new Event('Sunday', new Date('2019-04-07T10:30:00.000Z'),  new Date('2019-04-07T11:00:00.000Z'), EventType.REGULAR),
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays)).occupancy();

    expect(occupancy.days).toHaveLength(1);
});

test('calculate occupation for multi-day events', () => {
    let events = [
        new Event('event #1', new Date('2019-04-01T00:00:00.000Z'),  new Date('2019-04-02T23:59:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays)).occupancy();
    
    expect(occupancy.days).toHaveLength(2);
    expect(occupancy.days[0].occupancy).toBeCloseTo(1);
    expect(occupancy.days[1].occupancy).toBeCloseTo(1);
    expect(occupancy.total).toBeCloseTo(1);
});

test('real case', () => {
    let events = [
        new Event(
            'Tłumaczenie/ internacjonalizacja allegro.pl - plan działania',
            new Date('2019-04-01T09:00:00.000Z'),
            new Date('2019-04-01T09:30:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Uzupełnienie KPI Allegro',
            new Date('2019-04-01T09:00:00.000Z'),
            new Date('2019-04-01T09:30:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Pogadanie',
            new Date('2019-04-01T09:30:00.000Z'),
            new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'spotkanie',
            new Date('2019-04-01T11:30:00.000Z'),
            new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Status ZPT Managers',
            new Date('2019-04-01T12:00:00.000Z'),
            new Date('2019-04-01T13:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Skylab Checkpoint',
            new Date('2019-04-01T13:00:00.000Z'),
            new Date('2019-04-01T14:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'KOC reborn',
            new Date('2019-04-01T14:30:00.000Z'),
            new Date('2019-04-01T15:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'F2F',
            new Date('2019-04-01T15:30:00.000Z'),
            new Date('2019-04-01T16:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Efektywnośc procesu rekrutacji',
            new Date('2019-04-01T16:00:00.000Z'),
            new Date('2019-04-01T16:40:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Archeo',
            new Date('2019-04-02T09:45:00.000Z'),
            new Date('2019-04-02T10:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Offsite Liderów',
            new Date('2019-04-02T13:30:00.000Z'),
            new Date('2019-04-02T14:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Wstęp do slotu',
            new Date('2019-04-02T14:00:00.000Z'),
            new Date('2019-04-02T14:30:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Wymagania biz dla CP',
            new Date('2019-04-02T14:30:00.000Z'),
            new Date('2019-04-02T15:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Interview',
            new Date('2019-04-03T08:00:00.000Z'),
            new Date('2019-04-03T09:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'HC',
            new Date('2019-04-03T09:15:00.000Z'),
            new Date('2019-04-03T10:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Skylab Demo',
            new Date('2019-04-03T10:00:00.000Z'),
            new Date('2019-04-03T11:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Allegro & Google',
            new Date('2019-04-03T11:00:00.000Z'),
            new Date('2019-04-03T12:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Podsumowanie Q1',
            new Date('2019-04-03T13:00:00.000Z'),
            new Date('2019-04-03T14:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Planning Eden',
            new Date('2019-04-03T13:00:00.000Z'),
            new Date('2019-04-03T13:30:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Planning Helix',
            new Date('2019-04-03T13:30:00.000Z'),
            new Date('2019-04-03T14:30:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Prezka Offsite',
            new Date('2019-04-03T15:00:00.000Z'),
            new Date('2019-04-03T16:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Spotkanie Liderów v11',
            new Date('2019-04-04T00:00:00.000Z'),
            new Date('2019-04-05T23:59:59.000Z'), EventType.REGULAR
        ),
        new Event(
            'Archeo',
            new Date('2019-04-04T09:45:00.000Z'),
            new Date('2019-04-04T10:15:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Onboarding Tech Day 1',
            new Date('2019-04-04T10:00:00.000Z'),
            new Date('2019-04-04T17:00:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Lunch',
            new Date('2019-04-04T13:00:00.000Z'),
            new Date('2019-04-04T13:30:00.000Z'), EventType.REGULAR
        ),
        new Event(
            'Onboarding Tech Day 2',
            new Date('2019-04-05T08:30:00.000Z'),
            new Date('2019-04-05T14:30:00.000Z'), EventType.REGULAR
        ),
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays));

    debugPrintDays(occupancy);
});
