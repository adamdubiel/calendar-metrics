import { Event, EventType } from "./event";

export { extractEvents };

function extractEvents(calendarName: string, startDate: Date, endDate: Date): Event[] {
    let calendar = CalendarApp.getCalendarById(calendarName);
    console.log(`The calendar is named "${calendar.getName()}".`);
    
    let gevents = calendar.getEvents(startDate, endDate);
   
    console.log(`Returned ${gevents.length} events`);
    
    let events: Event[] = [];
    gevents.forEach(e => {
        let myStatus = e.getMyStatus();
        if (myStatus ==  CalendarApp.GuestStatus.YES || myStatus == CalendarApp.GuestStatus.OWNER) {

            let from: Date, to: Date;
            if (e.isAllDayEvent()) {
                from = e.getAllDayStartDate();
                to = transformAllDayEventEndDate(e.getAllDayEndDate());
            } else {
                from = e.getStartTime();
                to = e.getEndTime();
            }

            events.push(new Event(e.getTitle(), from, to, EventType.REGULAR));
        }
    });

    return events;
}

function transformAllDayEventEndDate(date: Date): Date {
    let transformed = new Date(date);
    transformed.setHours(23);
    transformed.setMinutes(59);
    transformed.setSeconds(59);

    return transformed;
}