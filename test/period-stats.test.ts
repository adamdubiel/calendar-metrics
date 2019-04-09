import { Event, EventType } from "../src/event";
import { dateToKey, OfficeHours, DayOfWeek, PeriodStats } from "../src/period-stats";

test('formatting date to YYYY-MM-DD string key', () => {
    let date = new Date("2019-04-05");

    let key = dateToKey(date);

    expect(key).toBe('2019-04-05');
});

const workDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

function periodStats(events: Event[]): PeriodStats {
    let periodStats = new PeriodStats(new OfficeHours(8, 17, workDays));
    periodStats.recordEvents(events);
    return periodStats;
}

test('calculating occupation in basic case', () => {
    // 9:00 - 10:00, 10:30 - 11:00, 15:00 - 16:00
    // 2.5 hours of occupancy 
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-01T10:30:00.000Z'),  new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR),
        new Event('event #3', new Date('2019-04-01T15:00:00.000Z'),  new Date('2019-04-01T16:00:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = periodStats(events).occupancy();

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

    let occupancy = periodStats(events).occupancy();

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

    let occupancy = periodStats(events).occupancy();

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

    let occupancy = periodStats(events).occupancy();
    
    expect(occupancy.total).toBeCloseTo(1.5 / (2*(17 - 8)));
    expect(occupancy.days).toHaveLength(2);
});

test('skip free days when calculating occupation', () => {
    let events = [
        new Event('Friday', new Date('2019-04-05T10:30:00.000Z'),  new Date('2019-04-05T11:00:00.000Z'), EventType.REGULAR),
        new Event('Saturday', new Date('2019-04-06T10:30:00.000Z'),  new Date('2019-04-06T11:00:00.000Z'), EventType.REGULAR),
        new Event('Sunday', new Date('2019-04-07T10:30:00.000Z'),  new Date('2019-04-07T11:00:00.000Z'), EventType.REGULAR),
    ];

    let occupancy = periodStats(events).occupancy();

    expect(occupancy.days).toHaveLength(1);
});

test('calculate occupation for multi-day events', () => {
    let events = [
        new Event('event #1', new Date('2019-04-01T00:00:00.000Z'),  new Date('2019-04-02T23:59:00.000Z'), EventType.REGULAR)
    ];

    let occupancy = periodStats(events).occupancy();
    
    expect(occupancy.days).toHaveLength(2);
    expect(occupancy.days[0].occupancy).toBeCloseTo(1);
    expect(occupancy.days[1].occupancy).toBeCloseTo(1);
    expect(occupancy.total).toBeCloseTo(1);
});
