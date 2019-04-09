import { Event } from "./event";
import { extractEvents } from "./gcalendar-extractor";
import { DayOfWeek, OfficeHours, PeriodStats } from "./period-stats";

export { run, calculateOccupancy, debugPrintDays };

const calendarName = 'adam.dubiel@allegro.pl';

const startDate = date(2019, 4, 1);
const endDate = date(2019, 4, 6);
const workDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

function run() {
    let events = extractEvents(calendarName, startDate, endDate);
    
    debugPrintEvents(events);

    let periodStats = calculateOccupancy(events, new OfficeHours(8, 17, workDays));

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

function date(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
}