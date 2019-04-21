import { DayOfWeek } from "./period-stats";
import { run, Config } from "./calendar-metrics"

/** EXECUTION PARAMETERS **/

const calendarName = 'adam.dubiel@allegro.pl';

const startDate = date(2019, 4, 15);
const endDate = date(2019, 4, 20);

const officeHoursStart = 8;
const officeHoursEnd = 17;

const filters = [
    "^Stay at"
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
        filters,
        officeHoursStart,
        officeHoursEnd,
        workDays
    ));
}