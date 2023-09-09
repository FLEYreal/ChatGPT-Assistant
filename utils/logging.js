'use strict';

const chalk = require('chalk');

class Logging {
    static on(message='') {
        console.log(`[${chalk.bold.green('ON')}] : ${message}`);
    }

    static off(message='') {
        console.log(`[${chalk.bold.red('OFF')}] : ${message}`);
    }

    static info(message='') {
        console.log(`[${chalk.bold.cyan('INFO')}] : ${message}`);
    }

    static error(message='') {
        console.error(`[${chalk.bold.red('ERROR')}] : ${message}`);
    }

    static warn(message='') {
        console.warn(`[${chalk.bold.yellow('WARN')}] : ${chalk.bold.yellow(message)}`);
    }

    static exitWithError(message='', exitCode=1) {
        console.error(`[${chalk.bold.red('ERROR')}] : ${chalk.bold.yellow(message)}`)
        process.exit(exitCode)
    }
};

module.exports = {
    logging: Logging
};
