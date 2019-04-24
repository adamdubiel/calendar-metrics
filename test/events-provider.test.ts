import { EventsFilter } from "../src/events-provider";

describe('isBlacklisted', () => {
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

describe('isWhitelisted', () => {
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