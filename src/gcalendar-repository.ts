import { EventsRepository, RawEvent } from "./events-provider";
import { log } from "./logger";

export { GCalendarEventsRepository };

class GCalendarEventsRepository implements EventsRepository {
    extractEvents(calendarName: string, from: Date, to: Date): RawEvent[] {
        return extractEvents(calendarName, from, to);
    }
}

function extractEvents(calendarName: string, startDate: Date, endDate: Date): RawEvent[] {
    let calendar = CalendarApp.getCalendarById(calendarName);
    log().info(`GCalendar[${calendar.getName()}] | readEvents | from: ${startDate} to: ${endDate}`);
    
    let gevents = calendar.getEvents(startDate, endDate);
   
    log().info(`GCalendar[${calendar.getName()}] | eventsCount | ${gevents.length}`);
    
    let events: RawEvent[] = [];
    gevents.forEach(e => {
        let myStatus = e.getMyStatus();

        let attending = myStatus == CalendarApp.GuestStatus.YES || myStatus == CalendarApp.GuestStatus.OWNER;
        let organising = myStatus == CalendarApp.GuestStatus.OWNER;

        let from: Date, to: Date;
        if (e.isAllDayEvent()) {
            from = e.getAllDayStartDate();
            to = transformAllDayEventEndDate(e.getAllDayEndDate());
        } else {
            from = e.getStartTime();
            to = e.getEndTime();
        }
        
        let event = new RawEvent(e.getTitle(), from ,to, e.getGuestList().length, attending, organising);
        log().debug(`GCalendar[${calendar.getName()}] | rawEvent | ${event}`);
    });

    return events;
}

function transformAllDayEventEndDate(date: Date): Date {
    let transformed = new Date(date);
    transformed.setDate(date.getDate() - 1);
    transformed.setHours(23);
    transformed.setMinutes(59);
    transformed.setSeconds(59);

    return transformed;
}