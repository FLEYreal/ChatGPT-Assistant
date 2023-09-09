'use strict';

const chalk = require('chalk');

class Logging {
    static info(message) {
        console.log(`[${chalk.bold.cyan('INFO')}] : ${message}`);
    }

    static error(message) {
        console.log(`[${chalk.bold.red('ERROR')}] : ${message}`);
    }
};

module.exports = {
    logging: Logging
};
