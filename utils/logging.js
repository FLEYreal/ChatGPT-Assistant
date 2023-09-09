'use strict';

const chalk = require('chalk');

class Logging {
    static info(message) {
        console.log(`[${chalk.bold.cyan('INFO')}] : ${message}`);
    }

    static error(message) {
        console.error(`[${chalk.bold.red('ERROR')}] : ${message}`);
    }
};

module.exports = {
    logging: Logging
};
