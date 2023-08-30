// Configs
require('dotenv').config()
const config = require('./config')

// Utils for checking
const { check } = require('./utils/check')

// Important checks of script, you can turn it off but 
// in this case it might cause a lot of troubles with potential errors
if(config && config.important_checks) check()

// If Important checks are off
else if(config && config.important_checks) console.log('[\u001b[1;33mWARN\u001b[0m] : important_check is off in config, aware of potential errors!');

// Every other case indicates that script needs to be checked
else check()

// Display logs to console
require('./utils/display_logs')

// API routes
const { apiApplication } = require('./locations/api')
apiApplication(config)

// Discord bot
require('./locations/discord')

// Telegram bot
require('./locations/telegram')

// Console application
const { consoleApplication } = require('./locations/console_app')
consoleApplication(config)