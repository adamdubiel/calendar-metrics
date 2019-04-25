# CalendarMetrics

Simple Google Apps Script that reads data from Google Calendar for defined dates and
creates statistics about % of time spent on meetings.

## Features

* [x] read events from any calendar within specified dates
* [x] show occupancy for each day (% of working hours in meetings)
    * [x] support overlapping events
    * [x] support multi-day events
    * [x] count only acknowledged events
* [x] filter only weekdays
* [x] show occupancy for the whole week
* [x] ignore events without guests
* [x] add ability to filter out events based on regexes
* [x] add ability to whitelist events based on regexes
* [ ] show all days, not only those with events
  * [ ] count period occupancy using only work days
* [ ] basic configuration
  * [ ] how to pass on confguration?
  * [ ] configure calendar
  * [ ] configure time range
* [ ] meeting types histogram
  * [ ] configure categories by meeting title
  * [ ] special category: recurriing events
* [ ] aggregate multiple calendars
* spreadsheets output
  * [ ] dump data to spreadsheet
  * [ ] detect existing dates
  * [ ] create new sheet per quarter (?)

## Gotchas

Only events when calendar owner is marked as Organiser are not counted.
You can be the owner of the event, but not an organiser. If so, you count
as a guest.

Being organiser and being an owner is indistinguishible on API level.

## How to run for development

* install [clasp](https://github.com/google/clasp)
* open [GSuite Developer Hub](https://script.google.com/home/projects/)
* select & open project
* `clasp push`
* run function

### Test

```
npm test
```
