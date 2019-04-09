
export enum EventType { REGULAR, OUT_OF_OFFICE };

export enum Overlap { NONE, PARTIAL, FULL };

export class EventDifference {
    constructor(
        readonly differenceInMillis: number,
        readonly overlap: Overlap,
        readonly endsBefore: boolean
    ) {};
}

export class Event {
    constructor(
        readonly title: string,
        readonly from: Date,
        readonly to: Date,
        readonly type: EventType
    ) {}

    isMultiDay(): boolean {
        return this.from.getFullYear() != this.to.getFullYear()
            || this.from.getMonth() != this.to.getMonth()
            || this.from.getDay() != this.to.getDay();
    }

    endsBefore(other: Event): boolean {
        return this.to.valueOf() <= other.to.valueOf();
    }

    durationInMillis(): number {
        return this.to.valueOf() - this.from.valueOf();
    }

    /**
     * This method assumes that otther has started AFTER this event.
     * @param other other event which started later
     */
    calculateDifference(other: Event): EventDifference {
        let overlap = this.overlapsWith(other);
        let differenceInMillis: number;

        switch(overlap) {
            case Overlap.NONE: {
                differenceInMillis = this.durationInMillis();
                break;
            }
            case Overlap.FULL: {
                differenceInMillis = 0;
                break;
            }
            case Overlap.PARTIAL: {
                differenceInMillis = other.to.valueOf() - this.to.valueOf();
                break;
            }
            default: {
                throw "WTF";
            }
        }

        return new EventDifference(differenceInMillis, overlap, this.endsBefore(other));
    }

    /**
     * This always STARTS EARLIER.
     * @param other 
     */
    overlapsWith(other: Event): Overlap {
        let timeFrom = this.from.valueOf();
        let timeTo = this.to.valueOf();
        let otherTimeFrom = other.from.valueOf();
        let otherTimeTo = other.to.valueOf();

        if (timeFrom > otherTimeFrom) {
            throw "Other event starts before this! To calculate overlap events need to be ordered by start time!"
        }

        // --- F -- OF -- OT -- T --->
        // --- F -- OF ----- OT T --->
        // --- F OF -------- OT T --->
        // --- F OF ----- OT -- T --->
        if (timeFrom <= otherTimeFrom && otherTimeTo <= timeTo && otherTimeFrom < timeTo) {
            return Overlap.FULL;
        }

        // --- F -- OF -- T -- OT --->
        // --- F OF ----- T -- OT --->
        if (timeFrom <= otherTimeFrom && timeTo < otherTimeTo && otherTimeFrom < timeTo) {
            return Overlap.PARTIAL;
        }

        // no overlap
        // --- F -- T -- OF -- OT --->
        // --- F -- T OF ----- OT --->
        return Overlap.NONE;
    }
}