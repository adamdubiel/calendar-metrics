import { dateToKey, calculateOccupancy, OfficeHours } from "../src/calendar-metrics";
import { Event, EventType } from "../src/event";

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

    let days = calculateOccupancy(events, new OfficeHours(8, 17));
    let day = days['2019-04-01'];

    expect(day.occupiedPercent()).toBeCloseTo(2.5 / (17 - 8));
    expect(day.numberOfEvents).toBe(3);
});

test('calculating occupation of fully overlapping events', () => {
    // 9:00 - 10:00, 09:00 - 09:30
    // 1 hour of occupancy 
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T09:30:00.000Z'), EventType.REGULAR)
    ];

    let days = calculateOccupancy(events, new OfficeHours(8, 17));
    let day = days['2019-04-01'];

    expect(day.occupiedPercent()).toBeCloseTo(1 / (17 - 8));
    expect(day.numberOfEvents).toBe(2);
});

test('calculating occupation of partially overlapping events', () => {
    // 9:00 - 10:00, 09:30 - 11:00
    // 2 hours of occupancy 
    let events = [
        new Event('event #1', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR),
        new Event('event #2', new Date('2019-04-01T09:00:00.000Z'),  new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR)
    ];

    let days = calculateOccupancy(events, new OfficeHours(8, 17));
    let day = days['2019-04-01'];

    expect(day.occupiedPercent()).toBeCloseTo(2 / (17 - 8));
    expect(day.numberOfEvents).toBe(2);
});