import { DayOfWeek } from "./period-stats";
import { run, Config } from "./calendar-metrics"
import { dumpEvents } from "./gcalendar-repository";

/** EXECUTION PARAMETERS **/

const calendarName = 'adam.dubiel@allegro.pl';

const startDate = date(2019, 1, 15);
const endDate = date(2019, 2, 28);

const timezone = "Europe/Warsaw";

const officeHoursStart = 8;
const officeHoursEnd = 17;

const blacklistFilters = [
    "^Stay at", "^Flight to"
];

const whitelistFilters = [
    "is out of office till"
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

function runZEntrypoint() {
    run(new Config(
        calendarName,
        startDate,
        endDate,
        blacklistFilters,
        whitelistFilters,
        officeHoursStart,
        officeHoursEnd,
        workDays
    ));
}

function runDumpEvents() {
    dumpEvents(calendarName, startDate, endDate);
}
