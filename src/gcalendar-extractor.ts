import { Event, EventType } from "./event";

export { extractEvents };

function extractEvents(calendarName: string, startDate: Date, endDate: Date): Event[] {
    let calendar = CalendarApp.getCalendarById(calendarName);
    console.log(`The calendar is named "${calendar.getName()}".`);
    
    let gevents = calendar.getEvents(startDate, endDate);
   
    console.log(`Returned ${gevents.length} events`);
    
    let events: Event[] = [];
    gevents.forEach(e => {
        events.push(new Event(e.getTitle(), e.getStartTime(), e.getEndTime(), EventType.REGULAR));
    });

    return events;
}