import { extractAndPresent, Config } from "../src/calendar-metrics";
import { EventsProvider, EventsRepository, RawEvent, EventsFilter } from "../src/events-provider";
import { DayOfWeek } from "../src/period-stats";
import { changeTimezone } from "../src/gcalendar-repository";

class StaticEventsRepository implements EventsRepository {
    extractEvents(calendarName: string, from: Date, to: Date): RawEvent[] {
        let events: RawEvent[] = [];
        rawEvents.forEach(e => {
            events.push(
                new RawEvent(
                    e.title,
                    changeTimezone(new Date(e.from)),
                    changeTimezone(new Date(e.to)),
                    e.numberOfGuests,
                    e.attending,
                    e.organiser
                )
            );
        });

        return events;
    }
}

test('real events dump', () => { 
    let filter = new EventsFilter(blacklistFilters, whitelistFilters);
    let eventsProvider = new EventsProvider(new StaticEventsRepository(), filter);

    extractAndPresent(
        eventsProvider,
        new Config('a', new Date('2019-01-15T00:00:00.000Z'), new Date('2019-02-28T00:00:00.000Z'), [], [], 8, 17, workDays)
    );
});

const blacklistFilters = [
    "^Stay at", "^Flight to"
];

const whitelistFilters = [
    "is out of office till"
];

const workDays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY
];

const rawEvents: any[] = JSON.parse(`[]`);