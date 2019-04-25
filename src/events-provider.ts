import { Event, EventType } from "./event";
import { log } from "./logger";

export { EventsProvider, EventsRepository, RawEvent, EventsFilter };

interface EventsRepository {
    extractEvents(calendarName: string, from: Date, to: Date): RawEvent[]
}

class RawEvent {
    constructor(
        readonly title: string,
        readonly from: Date,
        readonly to: Date,
        readonly numberOfGuests: number,
        readonly attending: boolean,
        readonly organiser: boolean
    ) {};

    asEvent(): Event {
        return new Event(this.title, this. from, this.to, EventType.REGULAR);
    }

    toString(): string {
        return `RawEvent{title: ${this.title}, from: ${this.from}, to: ${this.to},
            numberOfGuests: ${this.numberOfGuests}, attending: ${this.attending}, organiser: ${this.organiser}`;
    }
}

class EventsProvider {

    constructor(
        readonly repository: EventsRepository,
        readonly filter: EventsFilter,
    ) {};

    extractEvents(calendarName: string, from: Date, to: Date): Event[] {
        let rawEvents = this.repository.extractEvents(calendarName, from, to);
        let events: Event[] = [];

        rawEvents.forEach(event => {
            let whitelisted = this.filter.isWhitelisted(event.title);
            if (whitelisted) {
                log().debug(`EventsProvider[${calendarName}] | whitelist | ${event.title}`);
            }

            if (!whitelisted && this.filter.isBlacklisted(event.title)) {
                log().debug(`EventsProvider[${calendarName}] | blacklist | ${event.title}`);
                return;
            }

            let soloMeeting = event.organiser && event.numberOfGuests == 0;

            if (whitelisted || (event.attending && !soloMeeting)) {
                log().debug(`EventsProvider[${calendarName}] | added | ${event.title}`);
                events.push(event.asEvent());
            } else {
                if (!event.attending) {
                    log().debug(`EventsProvider[${calendarName}] | filtered | ${event.title} | !whitelisted && !attending`);
                } else {
                    log().debug(`EventsProvider[${calendarName}] | filtered | ${event.title} | !whitelisted && onlyGuestAndOwner`);
                }
            }
        });
        return events;
    }
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
