import { EventsFilter, EventsRepository, RawEvent, EventsProvider } from "../src/events-provider";

class StaticEventsRepository implements EventsRepository {
    constructor(
        readonly events: RawEvent[]
    ) {};

    extractEvents(calendarName: string, from: Date, to: Date): RawEvent[] {
        return this.events;
    }
}

const dummyDate = new Date();

function re(title: string) {
    return new RawEvent(title, new Date(), new Date(), 2, true, true);
}

function ree(title: string, numberOfGuests: number, attending: boolean, organiser: boolean) {
    return new RawEvent(title, new Date(), new Date(), numberOfGuests, attending, organiser);
}

describe('provider', () => {
    test('does not return blacklisted events', () => {
        let filter = new EventsFilter(['.*'], []);
        let repository = new StaticEventsRepository([
            re('event #1'), re('event #2')
        ]);
        let provider = new EventsProvider(repository, filter);

        let events = provider.extractEvents('c', dummyDate, dummyDate);

        expect(events).toHaveLength(0);
    });

    test('always returns whitelisted events and has precedence over blackist', () => {
        let filter = new EventsFilter(['.*'], ['1$']);
        let repository = new StaticEventsRepository([
            re('event #1'), re('event #2')
        ]);
        let provider = new EventsProvider(repository, filter);

        let events = provider.extractEvents('c', dummyDate, dummyDate);

        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('event #1');
    });

    test('returns only events where I am attending', () => {
        let filter = new EventsFilter([], []);
        let repository = new StaticEventsRepository([
            ree('event attending', 1, true, false), ree('event owner', 1, false, true), ree('event other', 1, false, false)
        ]);
        let provider = new EventsProvider(repository, filter);

        let events = provider.extractEvents('c', dummyDate, dummyDate);

        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('event attending');
    });

    test('does not return events I am organising with no other guests', () => {
        let filter = new EventsFilter([], []);
        let repository = new StaticEventsRepository([
            ree('event solo', 0, true, true), ree('event with guests', 1, true, true)
        ]);
        let provider = new EventsProvider(repository, filter);

        let events = provider.extractEvents('c', dummyDate, dummyDate);

        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('event with guests');
    });

    test('returns whitelisted event even if not attending', () => {
        let filter = new EventsFilter([], ['whitelisted$']);
        let repository = new StaticEventsRepository([
            ree('event solo', 0, true, true), ree('event solo whitelisted', 0, true, true)
        ]);
        let provider = new EventsProvider(repository, filter);

        let events = provider.extractEvents('c', dummyDate, dummyDate);

        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('event solo whitelisted');
    });

    test('returns whitelisted event even if I am organising with no other guests', () => {
        let filter = new EventsFilter([], ['whitelisted$']);
        let repository = new StaticEventsRepository([
            ree('event solo', 0, true, true), ree('event solo whitelisted', 0, true, true)
        ]);
        let provider = new EventsProvider(repository, filter);

        let events = provider.extractEvents('c', dummyDate, dummyDate);

        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('event solo whitelisted');
    });
});

describe('isBlacklisted filter', () => {
    test('returns true when regexp matches', () => {
        let filter = new EventsFilter([
            "^Some"
        ], []);

        let matches = filter.isBlacklisted("Some title");

        expect(matches).toBe(true);
    });

    test('returns true when any of regexp matches', () => {
        let filter = new EventsFilter([
            "[1-9].*", "^Some"
        ], []);

        let matches = filter.isBlacklisted("Some title");

        expect(matches).toBe(true);
    });

    test('returns false when none of regexps match', () => {
        let filter = new EventsFilter([
            "^Other", "[1-9].*"
        ], []);

        let matches = filter.isBlacklisted("Some title");

        expect(matches).toBe(false);
    });
});

describe('isWhitelisted filter', () => {
    test('returns true when regexp matches', () => {
        let filter = new EventsFilter([], [
            "is out of office till"
        ]);

        let matches = filter.isWhitelisted("Adam is out of office till 2019-01-01");

        expect(matches).toBe(true);
    });

    test('returns true when any of regexp matches', () => {
        let filter = new EventsFilter([], [
            "[1-9].*", "is out of office"
        ]);

        let matches = filter.isWhitelisted("Adam is out of office");

        expect(matches).toBe(true);
    });

    test('returns false when none of regexps match', () => {
        let filter = new EventsFilter([], [
            "^Stay", "[1-9].*"
        ]);

        let matches = filter.isWhitelisted("Adam is out of office");

        expect(matches).toBe(false);
    });
});