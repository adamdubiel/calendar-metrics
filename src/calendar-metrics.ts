import { Event } from "./event";
import { GCalendarEventsRepository } from "./gcalendar-repository";
import { EventsProvider, EventsFilter } from "./events-provider";
import { DayOfWeek, OfficeHours, PeriodStats } from "./period-stats";
import { log } from "./logger";

export { run, extractAndPresent, Config };

class Config {
    constructor(
        readonly calendarName: string,
        readonly startDate: Date,
        readonly endDate: Date,
        readonly blacklistFilters: string[],
        readonly whitelistFilters: string[], 
        readonly officeHoursStart: number,
        readonly officeHoursEnd: number,
        readonly workDays: DayOfWeek[]
    ) {};
}

function run(config: Config) {
    let repository = new GCalendarEventsRepository();
    let filter = new EventsFilter(config.blacklistFilters, config.whitelistFilters);
    let provider = new EventsProvider(repository, filter);
    extractAndPresent(provider, config);
}

function extractAndPresent(provider: EventsProvider, config: Config): void {
    let events = provider.extractEvents(
        config.calendarName,
        config.startDate,
        config.endDate,
    );
    
    debugPrintEvents(events);

    let officeHours = new OfficeHours(config.officeHoursStart, config.officeHoursEnd, config.workDays);
    let periodStats = calculateOccupancy(config.startDate, config.endDate, events, officeHours);

    debugPrintDays(periodStats);
}

function calculateOccupancy(from: Date, to: Date, events: Event[], officeHours: OfficeHours): PeriodStats {
    let periodStats = new PeriodStats(officeHours);
    periodStats.recordEvents(from, to, events);

    return periodStats;
}

function debugPrintEvents(events: Event[]): void {
    events.forEach(event => {
        log().debug(`PrintEvents | ${event}`);
    });
}

function debugPrintDays(stats: PeriodStats): void {
    let occupancy = stats.occupancy();

    log().debug('PrintStats | ==== PERIOD STATS ====');
    log().debug(`PrintStats | occupancy | ${percent(occupancy.total)}% | minutes: ${occupancy.totalMillis / 1000 / 60}, numberOfEvents: ${occupancy.numberOfEvents}`);
    occupancy.days.forEach(day => {
        log().debug(`PrintStats | day: ${day.date} | ${percent(day.occupancy)}% | minutes: ${day.millis / 1000 / 60}, numberOfEvents: ${day.numberOfEvents}`);
    });
    log().debug('PrintStats | ==== DONE ====');
}

function percent(n: number) {
    return (n * 100).toFixed(1);
}