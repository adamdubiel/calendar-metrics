import { Event, EventType, Overlap, EventDifference } from "../src/event";

describe('calculateDifferenceInMillis', () => {
    test('returns duration of this event if there is no overlap', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T08:00:00.000Z'), new Date('2019-04-01T09:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T10:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.NONE);
        expect(diff.differenceInMillis).toBe(1 * 60 * 60 * 1000);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns duration of this event if there is no overlap and #2 starts when #1 ends', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T08:00:00.000Z'), new Date('2019-04-01T09:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR);

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.NONE);
        expect(diff.differenceInMillis).toBe(1 * 60 * 60 * 1000);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns difference between end times if there is overlap', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T08:00:00.000Z'), new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.PARTIAL);
        expect(diff.differenceInMillis).toBe(1 * 60 * 60 * 1000);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns 0 when there is full overlap', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T08:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.FULL);
        expect(diff.differenceInMillis).toBe(0);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns 0 when there is full overlap and both start at the same time', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR);

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.FULL);
        expect(diff.differenceInMillis).toBe(0);
        expect(diff.endsBefore).toBe(false);
    });
});

describe('overlapsWith', () => {
    test('returns no overlap between events when there is none', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T11:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.NONE);
    });

    test('returns no overlap between events when #2 stats at time of #1 end', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T10:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.NONE);
    });

    test('returns full overlap between events when #1 includes #2', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T10:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.FULL);
    });

    test('returns full overlap between events when #1 includes #2 and they start at the same time', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.FULL);
    });

    test('returns full overlap between events when #2 includes #1 and they start at the same time', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.PARTIAL);
    });

    test('returns partial_earilier overlap between events when #1 started before #2', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T10:00:00.000Z'), new Date('2019-04-01T12:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.PARTIAL);
    });

    test('returns partial_later overlap between events when #1 started at the same time as #2', () => {
        let event1 = new Event('event #1', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T10:00:00.000Z'), EventType.REGULAR);
        let event2 = new Event('event #2', new Date('2019-04-01T09:00:00.000Z'), new Date('2019-04-01T11:00:00.000Z'), EventType.REGULAR);

        expect(event1.overlapsWith(event2)).toBe(Overlap.PARTIAL);
    });
});