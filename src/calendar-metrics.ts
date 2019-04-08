import "./gcalendar-extractor"
import { Event, Overlap } from "./event";
import { extractEvents } from "./gcalendar-extractor";

export { run, dateToKey, calculateOccupancy, OfficeHours };

const calendarName = 'adam.dubiel@allegro.pl';

const startDate = date(2019, 4, 1);
const endDate = date(2019, 4, 4);

class OfficeHours {
    constructor(
        readonly from: number,
        readonly to: number
    ) {}
}

class DayStats {
    readonly date: string;
    readonly totalMillis: number;
    occupiedMillis: number = 0;
    numberOfEvents: number = 0;
    private lastRecordedEvent: Event;

    constructor(theDate: string, officeHours: OfficeHours) {
        this.date = theDate;
        this.totalMillis = (officeHours.to - officeHours.from) * 60 * 60 * 1000;
    }

    recordEvent(event: Event): void {
        this.numberOfEvents++;

        if (this.lastRecordedEvent) {
            let diff = this.lastRecordedEvent.calculateDifference(event);
            this.occupiedMillis += diff.differenceInMillis;
            if (diff.endsBefore) {
                this.lastRecordedEvent = event;
            }
        } else {
            this.occupiedMillis += event.durationInMillis();
            this.lastRecordedEvent = event;
        }
    }

    occupiedPercent(): number {
        return this.occupiedMillis / this.totalMillis;
    }
}

function run() {
    let events = extractEvents(calendarName, startDate, endDate);
    
    debugPrintEvents(events);

    let days = calculateOccupancy(events, new OfficeHours(8, 17));

    debugPrintDays(days);
}

function calculateOccupancy(events: Event[], officeHours: OfficeHours): {[date: string]: DayStats} {
    let days: {[date: string]: DayStats} = {};

    events.forEach(event => {
        let dateKey = dateToKey(event.from);
        let dayStats = days[dateKey];

        if(!dayStats) {
            dayStats = new DayStats(dateKey, officeHours);
            days[dateKey] = dayStats;
        }
        dayStats.recordEvent(event);
    });

    return days;
}

function dateToKey(date: Date): string {
    return date.toISOString().replace(/T.*/, '');
}

function debugPrintEvents(events: Event[]): void {
    events.forEach(event => {
        console.log(`Event details: name: ${event.title}, from ${event.from} to ${event.to}`)        
    });
}

function debugPrintDays(days: {[date: string]: DayStats}): void {
    for (let key in days) {
        let day = days[key];
        console.log(`Day: ${day.date} ${day.numberOfEvents} ${day.occupiedPercent()}`);
     }
}

function date(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
}