import { Event } from "./event";

export { EventsProvider, EventsFilter };

interface EventsProvider {
    extractEvents(calendarName: string, from: Date, to: Date, filter: EventsFilter): Event[]
}

class EventsFilter {
    constructor(
        readonly blacklistRegexps: string[],
        readonly whitelistRegexps: string[]
    ) {}

    isBlacklisted(title: string): boolean {
        return this.matches(title, this.blacklistRegexps);
    }

    isWhitelisted(title: string): boolean {
        return this.matches(title, this.whitelistRegexps);
    }

    private matches(title: string, regexes: string[]): boolean {
        for (let r of regexes) {
            if (title.match(r) != null) {
                return true;
            }
        }

        return false;
    }
}
