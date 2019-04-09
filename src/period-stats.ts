import { Event } from "./event";

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
    readonly totalMillis: number;
    private occupiedMillis: number = 0;
    numberOfEvents: number = 0;
    private lastRecordedEvent: Event;

    constructor(theDate: string, officeHours: OfficeHours) {
        this.date = theDate;
        this.totalMillis = officeHours.millisInWorkDay();
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

    occupiedTimeMillis(): number {
        return this.capToWorkingDayDuration(this.occupiedMillis);
    }

    occupiedPercent(): number {
        return this.capToWorkingDayDuration(this.occupiedMillis) / this.totalMillis;
    }

    private capToWorkingDayDuration(millis: number): number {
        return millis < this.totalMillis ? millis : this.totalMillis;
    }
}

class PeriodStats {
    private days: {[date: string]: DayStats} = {};
    private numberOfDays = 0;
    private readonly officeHours: OfficeHours;

    constructor(theOfficeHours: OfficeHours){
        this.officeHours = theOfficeHours;
    };

    recordEvents(events: Event[]): void {
        events.forEach(e => { this.recordEvent(e); });
    }

    recordEvent(event: Event): void {
        let events: EventDay[];
        if (event.isMultiDay()) {
            events = this.splitMultiDayEvent(event);
        } else {
            events = [new EventDay(dateToKey(event.from), event)];
        }

        events.forEach(eventDay => {
            if (this.isWorkDay(eventDay.event)) {
                this.recordDayOfEvent(eventDay);
            }
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
            || date1.getMonth() < date1.getMonth()
            || date1.getDate() < date2.getDate();
    }

    private recordDayOfEvent(event: EventDay): void {
        let dateKey = event.date;
        let dayStats = this.days[dateKey];

        if(!dayStats) {
            dayStats = new DayStats(dateKey, this.officeHours);
            this.days[dateKey] = dayStats;
            this.numberOfDays++;
        }
        dayStats.recordEvent(event.event);
    }

    occupancy(): Occupancy {
        let millisInPeriod = this.numberOfDays * this.officeHours.millisInWorkDay();
        let occupiedMillisInPeriod = 0;
        let daysOccupancy: DayOccupancy[] = [];

        for (let date in this.days) {
            let day = this.days[date];
            occupiedMillisInPeriod += day.occupiedTimeMillis();
            daysOccupancy.push(new DayOccupancy(
                date, day.occupiedPercent(), day.numberOfEvents 
            ));
        }

        return new Occupancy(
            occupiedMillisInPeriod / millisInPeriod,
            daysOccupancy
        );
    }

    private isWorkDay(event: Event): boolean {
        return this.officeHours.days.indexOf(event.from.getDay()) >= 0;
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
        readonly occupancy: number,
        readonly numberOfEvents: number
    ){};
}

class Occupancy {
    constructor(
        readonly total: number,
        readonly days: DayOccupancy[]
    ){};
}

function dateToKey(date: Date): string {
    return date.toISOString().replace(/T.*/, '');
}