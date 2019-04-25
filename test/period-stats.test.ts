import { Event } from "../src/event";
import { dateToKey, OfficeHours, DayOfWeek, PeriodStats } from "../src/period-stats";
import { e } from "./event.test";

test('formatting date to YYYY-MM-DD string key', () => {
    let date = new Date("2019-04-05");

    let key = dateToKey(date);

    expect(key).toBe('2019-04-05');
});

const workDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

function periodStats(from: Date, to: Date, events: Event[]): PeriodStats {
    let periodStats = new PeriodStats(new OfficeHours(8, 17, workDays));
    periodStats.recordEvents(from, to, events);
    return periodStats;
}

test('includes all days without events', () => {
    let events = [];

    let occupancy = periodStats(new Date("2019-04-01"), new Date("2019-04-03"), events).occupancy();

    expect(occupancy.days).toHaveLength(2);
});

test('calculating occupation in basic case', () => {
    // 9:00 - 10:00, 10:30 - 11:00, 15:00 - 16:00
    // 2.5 hours of occupancy 
    let events = [
        e('#1', '2019-04-01T09:00',  '2019-04-01T10:00'),
        e('#2', '2019-04-01T10:30',  '2019-04-01T11:00'),
        e('#3', '2019-04-01T15:00',  '2019-04-01T16:00')
    ];
    let from = new Date("2019-04-01");
    let to = new Date("2019-04-02");

    let occupancy = periodStats(from, to, events).occupancy();

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
        e('#1', '2019-04-01T09:00',  '2019-04-01T10:00'),
        e('#2', '2019-04-01T09:00',  '2019-04-01T09:30')
    ];
    let from = new Date("2019-04-01");
    let to = new Date("2019-04-02");

    let occupancy = periodStats(from, to, events).occupancy();

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
        e('#1', '2019-04-01T09:00',  '2019-04-01T10:00'),
        e('#2', '2019-04-01T09:00',  '2019-04-01T11:00')
    ];
    let from = new Date("2019-04-01");
    let to = new Date("2019-04-02");

    let occupancy = periodStats(from, to, events).occupancy();

    expect(occupancy.days).toHaveLength(1);
    expect(occupancy.total).toBeCloseTo(2 / (17- 8));

    let day = occupancy.days[0];

    expect(day.occupancy).toBeCloseTo(2 / (17 - 8));
    expect(day.numberOfEvents).toBe(2);
});

test('calculating occupation of multiple days', () => {
    let events = [
        e('#1', '2019-04-01T09:00',  '2019-04-01T10:00'),
        e('#2', '2019-04-02T10:30',  '2019-04-02T11:00')
    ];
    let from = new Date("2019-04-01");
    let to = new Date("2019-04-03");

    let occupancy = periodStats(from, to, events).occupancy();
    
    expect(occupancy.total).toBeCloseTo(1.5 / (2*(17 - 8)));
    expect(occupancy.days).toHaveLength(2);
});

test('skip free days when calculating occupation', () => {
    let events = [
        e('Friday', '2019-04-05T10:30',  '2019-04-05T11:00'),
        e('Saturday', '2019-04-06T10:30',  '2019-04-06T11:00'),
        e('Sunday', '2019-04-07T10:30',  '2019-04-07T11:00'),
    ];
    let from = new Date("2019-04-05");
    let to = new Date("2019-04-08");

    let occupancy = periodStats(from, to, events).occupancy();

    expect(occupancy.total).toBeCloseTo(0.5 / (17 - 8));
});

test('calculate occupation for multi-day events', () => {
    let events = [
        e('#1', '2019-04-01T00:00',  '2019-04-02T23:59')
    ];
    let from = new Date("2019-04-01");
    let to = new Date("2019-04-03");

    let occupancy = periodStats(from, to, events).occupancy();
    
    expect(occupancy.days).toHaveLength(2);
    expect(occupancy.days[0].occupancy).toBeCloseTo(1);
    expect(occupancy.days[1].occupancy).toBeCloseTo(1);
    expect(occupancy.total).toBeCloseTo(1);
});

test('calculate occupation for events happening between months', () => {
    let events = [
        e('#1', '2019-01-31T00:00',  '2019-02-14T23:59')
    ];
    let from = new Date("2019-01-31");
    let to = new Date("2019-02-15");

    let occupancy = periodStats(from, to, events).occupancy();
    
    expect(occupancy.days).toHaveLength(15);
    occupancy.days.forEach(d => {
        expect(d.occupancy).toBeCloseTo(1);
    });
    expect(occupancy.total).toBeCloseTo(1);
});