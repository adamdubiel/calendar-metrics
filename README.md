# CalendarMetrics

## How to run

* install [clasp](https://github.com/google/clasp)
* open [GSuite Developer Hub](https://script.google.com/home/projects/)
* select & open project
* `clasp push`
* run function

## Features

* [x] read events from any calendar within specified dates
* [x] show occupancy for each day (% of working hours in meetings)
    * [x] support overlapping events
    * [x] support multi-day events
    * [x] count only acknowledged events
* [x] filter only weekdays
* [x] show occupancy for the whole week
* [ ] ignore events without guests
* [x] add ability to filter out events based on regexes
* [ ] basic configuration
  * [ ] how to pass on confguration?
  * [ ] configure calendar
  * [ ] configure time range

## TODO

* [x] check all-day events behaviour
* [ ] check number of guests (do I count as a guest)