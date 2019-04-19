import { Event } from "./event";
import { extractEvents } from "./gcalendar-extractor";
import { EventsProvider, EventsFilter } from "./events-provider";
import { DayOfWeek, OfficeHours, PeriodStats } from "./period-stats";

export { run, extractAndPresent };


/** EXECUTION PARAMETERS **/

const calendarName = 'adam.dubiel@allegro.pl';

const startDate = date(2019, 4, 15);
const endDate = date(2019, 4, 19);

const officeHourStart = 8;
const officeHourEnd = 17;

const filters = [
    "^Stay at"
];

const workDays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY
];

/** EOF EXECUTION PARAMETERS **/

function date(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
}

class GCalendarEventsProvider implements EventsProvider {
    extractEvents(calendarName: string, from: Date, to: Date, filter: EventsFilter): Event[] {
        return extractEvents(calendarName, from, to, filter);
    }
}

function run() {
    let eventsProvider = new GCalendarEventsProvider();
    extractAndPresent(eventsProvider);
}

function extractAndPresent(provider: EventsProvider): void {
    let events = provider.extractEvents(calendarName, startDate, endDate, new EventsFilter(filters));
    
    debugPrintEvents(events);

    let periodStats = calculateOccupancy(events, new OfficeHours(officeHourStart, officeHourEnd, workDays));

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