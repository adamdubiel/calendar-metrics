import { Event } from "./event";
import { extractEvents } from "./gcalendar-extractor";
import { EventsProvider, EventsFilter } from "./events-provider";
import { DayOfWeek, OfficeHours, PeriodStats } from "./period-stats";

export { run, extractAndPresent, Config };

class GCalendarEventsProvider implements EventsProvider {
    extractEvents(calendarName: string, from: Date, to: Date, filter: EventsFilter): Event[] {
        return extractEvents(calendarName, from, to, filter);
    }
}

class Config {
    constructor(
        readonly calendarName: string,
        readonly startDate: Date,
        readonly endDate: Date,
        readonly filters: string[],
        readonly officeHoursStart: number,
        readonly officeHoursEnd: number,
        readonly workDays: DayOfWeek[]
    ) {};
}

function run(config: Config) {
    let eventsProvider = new GCalendarEventsProvider();
    extractAndPresent(eventsProvider, config);
}

function extractAndPresent(provider: EventsProvider, config: Config): void {
    let events = provider.extractEvents(config.calendarName, config.startDate, config.endDate, new EventsFilter(config.filters));
    
    debugPrintEvents(events);

    let periodStats = calculateOccupancy(events, new OfficeHours(config.officeHoursStart, config.officeHoursEnd, config.workDays));

    debugPrintDays(periodStats);
}

function calculateOccupancy(events: Event[], officeHours: OfficeHours): PeriodStats {
    let periodStats = new PeriodStats(officeHours);
    periodStats.recordEvents(events);

    return periodStats;
}

function debugPrintEvents(events: Event[]): void {
    events.forEach(event => {
        console.log(`Event details: name: ${event.title}, from ${event.from} to ${event.to}`)        
    });
}

function debugPrintDays(stats: PeriodStats): void {
    let occupancy = stats.occupancy();

    console.log('==== PERIOD STATS ====');
    console.log(`Total occupancy: ${occupancy.total}`);
    occupancy.days.forEach(day => {
        console.log(`Day: ${day.date} Occupancy: ${day.occupancy} Number Of Events: ${day.numberOfEvents}`);
    });
}