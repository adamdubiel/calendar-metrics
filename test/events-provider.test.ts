import { EventsFilter } from "../src/events-provider";

describe('matcher', () => {
    test('returns true when regexp matches', () => {
        let matcher = new EventsFilter([
            "^Some"
        ]);

        let matches = matcher.matches("Some title");

        expect(matches).toBe(true);
    });

    test('returns true when any of regexp matches', () => {
        let matcher = new EventsFilter([
            "[1-9].*", "^Some"
        ]);

        let matches = matcher.matches("Some title");

        expect(matches).toBe(true);
    });

    test('returns false when none of regexps match', () => {
        let matcher = new EventsFilter([
            "^Other", "[1-9].*"
        ]);

        let matches = matcher.matches("Some title");

        expect(matches).toBe(false);
    });
});