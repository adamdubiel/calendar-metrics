import { calculateOccupancy, debugPrintDays } from "../src/calendar-metrics";
import { Event, EventType } from "../src/event";
import { DayOfWeek, OfficeHours } from "../src/period-stats";

const workDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

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
