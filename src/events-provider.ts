import { Event } from "./event";

export { EventsProvider, EventsFilter };

interface EventsProvider {
    extractEvents(calendarName: string, from: Date, to: Date, filter: EventsFilter): Event[]
}

class EventsFilter {
    constructor(
        readonly regexps: string[]
    ) {}

    matches(title: string): boolean {
        for (let r of this.regexps) {
            if (title.match(r) != null) {
                return true;
            }
        }

        return false;
    }
}