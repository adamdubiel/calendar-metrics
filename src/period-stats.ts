import { Event } from "./event";
import { log } from "./logger";

export { dateToKey, OfficeHours, DayOfWeek, PeriodStats };

enum DayOfWeek { SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY };

class OfficeHours {
    constructor(
        readonly from: number,
        readonly to: number,
        readonly days: DayOfWeek[]
    ) {}

    millisInWorkDay(): number {
        return (this.to - this.from) * 60 * 60 * 1000
    }
}

class DayStats {
    readonly date: string;
    readonly workDay: boolean;
    readonly totalMillis: number;
    private occupiedMillis: number = 0;
    numberOfEvents: number = 0;
    private lastRecordedEvent: Event;

    constructor(theDate: string, theWorkDay: boolean, officeHours: OfficeHours) {
        this.date = theDate;
        this.workDay = theWorkDay;
        this.totalMillis = officeHours.millisInWorkDay();
    }

    recordEvent(event: Event): void {
        log().debug(`DayStats[${this.date}] | record | ${event.title} | ${event}`);
        log().debug(`DayStats[${this.date}] | occupiedMinutesBefore | ${event.title} | ${this.occupiedMillis / 1000 / 60}`);
        log().debug(`DayStats[${this.date}] | durationMinutes | ${event.title} | ${event.durationInMillis() / 1000 / 60}`);
        this.numberOfEvents++;

        if (this.lastRecordedEvent) {
            let diff = this.lastRecordedEvent.calculateDifference(event);
            log().debug(`DayStats[${this.date}] | difference | ${event.title} | ${diff}`);

            this.occupiedMillis += diff.differenceInMillis;
            if (diff.endsBefore) {
                this.lastRecordedEvent = event;
            }
        } else {
            this.occupiedMillis += event.durationInMillis();
            this.lastRecordedEvent = event;
        }

        log().debug(`DayStats[${this.date}] | occupiedMinutesAfter | ${event.title} | ${this.occupiedMillis / 1000 / 60}`);
    }

    occupiedTimeMillis(): number {
        return this.capToWorkingDayDuration(this.occupiedMillis);
    }

    occupiedPercent(): number {
        if (this.totalMillis == 0) {
            return 0;
        }
        return this.capToWorkingDayDuration(this.occupiedMillis) / this.totalMillis;
    }

    private capToWorkingDayDuration(millis: number): number {
        return millis < this.totalMillis ? millis : this.totalMillis;
    }
}

class PeriodStats {
    private days: {[date: string]: DayStats} = {};
    private readonly officeHours: OfficeHours;

    constructor(theOfficeHours: OfficeHours){
        this.officeHours = theOfficeHours;
    };

    recordEvents(from: Date, to: Date, events: Event[]): void {
        this.fillInDayStats(from, to);
        events.forEach(e => { this.recordEvent(e); });
    }

    private fillInDayStats(from: Date, to: Date) {
        let current = new Date(from);
        while (this.isBefore(current, to)) {    
            let dateKey = dateToKey(current);

            this.days[dateKey] = new DayStats(dateKey, this.isWorkDayDate(current), this.officeHours);

            // + 1 day - this actually works with all corner cases 
            current.setDate(current.getDate() + 1);
        }
    }

    private recordEvent(event: Event): void {
        log().debug(`PeriodStats[${event.title}] | record | multiday: ${event.isMultiDay()}`);

        let events: EventDay[];
        if (event.isMultiDay()) {
            events = this.splitMultiDayEvent(event);
            log().debug(`PeriodStats[${event.title}] | splitMultiDay | from: ${event.from}, to: ${event.to} | days: ${events.length}`);
        } else {
            events = [new EventDay(dateToKey(event.from), event)];
        }

        events.forEach(eventDay => {
            this.recordDayOfEvent(eventDay);
        })
    }

    private splitMultiDayEvent(event: Event): EventDay[] {
        let eventDays: EventDay[] = [];

        let currentDate = new Date(event.from);
        while (this.isBefore(currentDate, event.to)) {
            let dateKey = dateToKey(currentDate);
            eventDays.push(new EventDay(dateKey, event));
            // + 1 day - this actually works with all corner cases 
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return eventDays;
    }

    private isBefore(date1: Date, date2: Date): boolean {
        return date1.getFullYear() < date2.getFullYear()
            || date1.getMonth() < date2.getMonth()
            || date1.getDate() < date2.getDate();
    }

    private recordDayOfEvent(event: EventDay): void {
        let dateKey = event.date;
        let dayStats = this.days[dateKey];

        log().debug(`PeriodStats[${event.event.title}] | recordDayOfEvent | dateKey: ${dateKey}`);
        if (dayStats) {
            dayStats.recordEvent(event.event);
        } else {
            log().info(`PeriodStats[${event.event.title}] | recordDayOfEvent | dateKey: ${dateKey} | null DayStats!`)
        }
    }

    occupancy(): Occupancy {
        let numberOfWorkDays = 0;
        let occupiedMillisInPeriod = 0;
        let numberOfEventsInPeriod = 0;
        let daysOccupancy: DayOccupancy[] = [];

        for (let date in this.days) {
            let day = this.days[date];
            if (day.workDay) {
                occupiedMillisInPeriod += day.occupiedTimeMillis();
                numberOfEventsInPeriod += day.numberOfEvents;
                numberOfWorkDays++;
            }

            daysOccupancy.push(new DayOccupancy(
                date, day.workDay, day.occupiedPercent(), day.occupiedTimeMillis(), day.numberOfEvents 
            ));
        }

        let millisInPeriod = numberOfWorkDays * this.officeHours.millisInWorkDay();
        return new Occupancy(
            occupiedMillisInPeriod / millisInPeriod,
            occupiedMillisInPeriod,
            numberOfEventsInPeriod,
            daysOccupancy
        );
    }

    private isWorkDayDate(date: Date): boolean {
        return this.officeHours.days.indexOf(date.getDay()) >= 0;
    }
}

class EventDay {
    constructor(
        readonly date: string,
        readonly event: Event
    ) {};
}

class DayOccupancy {
    constructor(
        readonly date: string,
        readonly isWorkDay: boolean,
        readonly occupancy: number,
        readonly millis: number,
        readonly numberOfEvents: number
    ){};
}

class Occupancy {
    constructor(
        readonly total: number,
        readonly totalMillis: number,
        readonly numberOfEvents: number,
        readonly days: DayOccupancy[]
    ){};
}

function dateToKey(date: Date): string {
    return date.toISOString().replace(/T.*/, '');
}