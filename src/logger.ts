export { Logger, log };

interface Logger {
    info(msg: string): void;
    debug(msg: string): void;
}

class ConsoleLogger implements Logger {

    private readonly debugEnabled: boolean;
    private readonly infoEnabled: boolean;

    constructor(activeLevels: string[]) {
        this.debugEnabled = activeLevels.indexOf("DEBUG") >= 0;
        this.infoEnabled = activeLevels.indexOf("INFO") >= 0;
    };

    info(msg: string): void {
        if (this.infoEnabled) {
            console.log(msg);
        }
    }
    
    debug(msg: string): void {
        if (this.debugEnabled) {
            console.log(msg);
        }
    }
}

const logger = new ConsoleLogger(["INFO", "DEBUG"]);

function log(): Logger {
    return logger;
}