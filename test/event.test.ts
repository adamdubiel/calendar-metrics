import { Event, EventType, Overlap, EventDifference } from "../src/event";

export function e(name: string, from: string, to: string): Event {
    return new Event(name, date(from), date(to), EventType.REGULAR);
}

function date(date: string): Date {
    return new Date(`${date}:00.000Z`);
}

describe('calculateDifferenceInMillis', () => {
    test('returns duration of other event if there is no overlap', () => {
        let event1 = e('#1', '2019-04-01T08:00', '2019-04-01T09:00');
        let event2 = e('#2', '2019-04-01T10:00', '2019-04-01T11:30');

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.NONE);
        expect(diff.differenceInMillis).toBe(1.5 * 60 * 60 * 1000);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns duration of other event if there is no overlap and #2 starts when #1 ends', () => {
        let event1 = e('#1', '2019-04-01T08:00', '2019-04-01T09:00');
        let event2 = e('#2', '2019-04-01T09:00', '2019-04-01T13:00');

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.NONE);
        expect(diff.differenceInMillis).toBe(4 * 60 * 60 * 1000);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns difference between end times if there is overlap', () => {
        let event1 = e('#1', '2019-04-01T08:00', '2019-04-01T10:00');
        let event2 = e('#2', '2019-04-01T09:00', '2019-04-01T11:00');

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.PARTIAL);
        expect(diff.differenceInMillis).toBe(1 * 60 * 60 * 1000);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns 0 when there is full overlap', () => {
        let event1 = e('#1', '2019-04-01T08:00', '2019-04-01T12:00');
        let event2 = e('#2', '2019-04-01T09:00', '2019-04-01T12:00');

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.FULL);
        expect(diff.differenceInMillis).toBe(0);
        expect(diff.endsBefore).toBe(true);
    });

    test('returns 0 when there is full overlap and both start at the same time', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T11:00');
        let event2 = e('#2', '2019-04-01T09:00', '2019-04-01T10:00');

        let diff = event1.calculateDifference(event2);

        expect(diff.overlap).toBe(Overlap.FULL);
        expect(diff.differenceInMillis).toBe(0);
        expect(diff.endsBefore).toBe(false);
    });
});

describe('overlapsWith', () => {
    test('returns no overlap between events when there is none', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T10:00');
        let event2 = e('#2', '2019-04-01T11:00', '2019-04-01T12:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.NONE);
    });

    test('returns no overlap between events when #2 stats at time of #1 end', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T10:00');
        let event2 = e('#2', '2019-04-01T10:00', '2019-04-01T11:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.NONE);
    });

    test('returns full overlap between events when #1 includes #2', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T12:00');
        let event2 = e('#2', '2019-04-01T10:00', '2019-04-01T11:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.FULL);
    });

    test('returns full overlap between events when #1 includes #2 and they start at the same time', () => {
        let event1 = e('event #1', '2019-04-01T09:00', '2019-04-01T12:00');
        let event2 = e('event #2', '2019-04-01T09:00', '2019-04-01T11:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.FULL);
    });

    test('returns full overlap between events when #2 includes #1 and they start at the same time', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T11:00');
        let event2 = e('#2', '2019-04-01T09:00', '2019-04-01T12:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.PARTIAL);
    });

    test('returns partial_earilier overlap between events when #1 started before #2', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T11:00');
        let event2 = e('#2', '2019-04-01T10:00', '2019-04-01T12:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.PARTIAL);
    });

    test('returns partial_later overlap between events when #1 started at the same time as #2', () => {
        let event1 = e('#1', '2019-04-01T09:00', '2019-04-01T10:00');
        let event2 = e('#2', '2019-04-01T09:00', '2019-04-01T11:00');

        expect(event1.overlapsWith(event2)).toBe(Overlap.PARTIAL);
    });
});

describe('isMultiDay', () => {
    test('returns false when event starts and ends on same day', () => {
        let event = e('#0', '2019-04-01T09:00', '2019-04-01T10:00');

        expect(event.isMultiDay()).toBe(false);
    });

    test('returns false when event ends on different day', () => {
        let event = e('#0', '2019-04-01T09:00', '2019-04-02T10:00');
        
        expect(event.isMultiDay()).toBe(true);
    });

    test('returns false when event ends on different month', () => {
        let event = e('#0', '2019-03-31T09:00', '2019-04-01T10:00');
        
        expect(event.isMultiDay()).toBe(true);
    });

    test('returns false when event ends on different year', () => {
        let event = e('#0', '2019-12-31T09:00', '2020-01-01T10:00');
        
        expect(event.isMultiDay()).toBe(true);
    });
});