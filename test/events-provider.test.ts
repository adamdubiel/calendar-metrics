import { EventsFilter } from "../src/events-provider";

describe('matcher', () => {
    test('returns true when any of regexps match', () => {
        let matcher = new EventsFilter([
            "^Some", "[1-9]$"
        ]);

        let matches = matcher.matches("Some title");

        expect(matches).toBe(true);
    });

    test('returns false when none of regexps match', () => {
        let matcher = new EventsFilter([
            "^Other", "[1-9]$"
        ]);

        let matches = matcher.matches("Some title");

        expect(matches).toBe(true);
    });
});