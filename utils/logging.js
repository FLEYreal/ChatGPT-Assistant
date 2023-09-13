"use strict";

const chalk = require("chalk");

const transformMessage = (message) =>
    typeof message === "object" && message !== null
        ? JSON.stringify(message)
        : message;

class Logging {
    static on(message = "", ...args) {
        console.log(
            `[${chalk.bold.green("ON")}] : ${transformMessage(message)}`,
            ...args,
        );
    }

    static off(message = "", ...args) {
        console.log(
            `[${chalk.bold.red("OFF")}] : ${transformMessage(message)}`,
            ...args,
        );
    }

    static info(message = "", ...args) {
        console.log(
            `[${chalk.bold.cyan("INFO")}] : ${transformMessage(message)}`,
            ...args,
        );
    }

    static error(message = "", ...args) {
        console.error(
            `[${chalk.bold.red("ERROR")}] : ${transformMessage(message)}`,
            ...args,
        );
    }

    static warn(message = "", ...args) {
        console.warn(
            `[${chalk.bold.yellow("WARN")}] : ${chalk.bold.yellow(
                transformMessage(message),
            )}`,
            ...args,
        );
    }

    static exitWithError(message = "", exitCode = 1, ...args) {
        console.error(
            `[${chalk.bold.red("ERROR")}] : ${chalk.bold.yellow(
                transformMessage(message),
            )}`,
            ...args,
        );
        process.exit(exitCode);
    }
}

module.exports = {
    logging: Logging,
};
