"use strict";

const chalk = require("chalk");

class Logging {
    static on(message = "", ...args) {
        console.log(`[${chalk.bold.green("ON")}] : ${message}`, ...args);
    }

    static off(message = "", ...args) {
        console.log(`[${chalk.bold.red("OFF")}] : ${message}`, ...args);
    }

    static info(message = "", ...args) {
        console.log(`[${chalk.bold.cyan("INFO")}] : ${message}`, ...args);
    }

    static error(message = "", ...args) {
        console.error(`[${chalk.bold.red("ERROR")}] : ${message}`, ...args);
    }

    static warn(message = "", ...args) {
        console.warn(
            `[${chalk.bold.yellow("WARN")}] : ${chalk.bold.yellow(message)}`,
            ...args,
        );
    }

    static exitWithError(message = "", exitCode = 1, ...args) {
        console.error(
            `[${chalk.bold.red("ERROR")}] : ${chalk.bold.yellow(message)}`,
            ...args,
        );
        process.exit(exitCode);
    }
}

module.exports = {
    logging: Logging,
};
