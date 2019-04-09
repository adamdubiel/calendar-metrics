import { calculateOccupancy, debugPrintDays } from "../src/calendar-metrics";
import { Event, EventType } from "../src/event";
import { DayOfWeek, OfficeHours } from "../src/period-stats";
import { e } from "./event.test";

const workDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

test('real case', () => {
    let events = [
        e('Tłumaczenie/ internacjonalizacja allegro.pl - plan działania', '2019-04-01T09:00', '2019-04-01T09:30'),
        e('Uzupełnienie KPI Allegro', '2019-04-01T09:00', '2019-04-01T09:30'),
        e('Pogadanie', '2019-04-01T09:30', '2019-04-01T10:00'),
        e('spotkanie', '2019-04-01T11:30', '2019-04-01T12:00'),
        e('Status ZPT Managers', '2019-04-01T12:00', '2019-04-01T13:00'),
        e('Skylab Checkpoint', '2019-04-01T13:00', '2019-04-01T14:00'),
        e('KOC reborn', '2019-04-01T14:30', '2019-04-01T15:00'),
        e('F2F', '2019-04-01T15:30', '2019-04-01T16:00'),
        e('Efektywnośc procesu rekrutacji', '2019-04-01T16:00', '2019-04-01T16:40'),
        e('Archeo', '2019-04-02T09:45', '2019-04-02T10:00'),
        e('Offsite Liderów', '2019-04-02T13:30', '2019-04-02T14:00'),
        e('Wstęp do slotu', '2019-04-02T14:00', '2019-04-02T14:30'),
        e('Wymagania biz dla CP', '2019-04-02T14:30', '2019-04-02T15:00'),
        e('Interview', '2019-04-03T08:00', '2019-04-03T09:00'),
        e('HC', '2019-04-03T09:15', '2019-04-03T10:00'),
        e('Skylab Demo', '2019-04-03T10:00', '2019-04-03T11:00'),
        e('Allegro & Google', '2019-04-03T11:00', '2019-04-03T12:00'),
        e('Podsumowanie Q1', '2019-04-03T13:00', '2019-04-03T14:00'),
        e('Planning Eden', '2019-04-03T13:00', '2019-04-03T13:30'),
        e('Planning Helix', '2019-04-03T13:30', '2019-04-03T14:30'),
        e('Prezka Offsite', '2019-04-03T15:00', '2019-04-03T16:00'),
        e('Spotkanie Liderów v11', '2019-04-04T00:00', '2019-04-05T23:59'),
        e('Archeo', '2019-04-04T09:45', '2019-04-04T10:15'),
        e('Onboarding Tech Day 1', '2019-04-04T10:00', '2019-04-04T17:00'),
        e('Lunch', '2019-04-04T13:00', '2019-04-04T13:30'),
        e('Onboarding Tech Day 2', '2019-04-05T08:30', '2019-04-05T14:30')
    ];

    let occupancy = calculateOccupancy(events, new OfficeHours(8, 17, workDays));

    debugPrintDays(occupancy);
});
