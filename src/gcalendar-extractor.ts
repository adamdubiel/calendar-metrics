import { Event, EventType } from "./event";
import { EventsFilter } from "./events-provider";
import { log } from "./logger";

export { extractEvents };

function extractEvents(calendarName: string, startDate: Date, endDate: Date, filter: EventsFilter): Event[] {
    let calendar = CalendarApp.getCalendarById(calendarName);
    log().info(`GCalendar[${calendar.getName()}] | readEvents | from: ${startDate} to: ${endDate}`);
    
    let gevents = calendar.getEvents(startDate, endDate);
   
    log().info(`GCalendar[${calendar.getName()}] | eventsCount | ${gevents.length}`);
    
    let events: Event[] = [];
    gevents.forEach(e => {
        if (filter.isBlacklisted(e.getTitle())) {
            log().debug(`GCalendar[${calendar.getName()}] | filter | ${e.getTitle()}`);
            return;
        }

        let myStatus = e.getMyStatus();

        let attending = myStatus == CalendarApp.GuestStatus.YES || myStatus == CalendarApp.GuestStatus.OWNER;
        let soloMeeting = myStatus == CalendarApp.GuestStatus.OWNER && e.getGuestList().length == 0;

        log().debug(`GCalendar[${calendar.getName()}] | event | ${e.getTitle()} | status: ${myStatus}, guests: ${e.getGuestList().length}, isOwner: ${e.isOwnedByMe()}`);
        log().debug(`GCalendar[${calendar.getName()}] | event | ${e.getTitle()} | onlyGuestAndOwner: ${soloMeeting}, attending: ${attending}`);

        if (attending && !soloMeeting) {
            let from: Date, to: Date;
            if (e.isAllDayEvent()) {
                from = e.getAllDayStartDate();
                to = transformAllDayEventEndDate(e.getAllDayEndDate());
            } else {
                from = e.getStartTime();
                to = e.getEndTime();
            }

            let event = new Event(e.getTitle(), from, to, EventType.REGULAR);
            events.push(event);
            
            log().debug(`GCalendar[${calendar.getName()}] | added | ${event}`);
        } else {
            log().debug(`GCalendar[${calendar.getName()}] | filter | ${e.getTitle()} | attending && !onlyGuestAndOwner: false`);
        }
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