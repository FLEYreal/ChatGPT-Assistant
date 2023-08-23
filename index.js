// Configs
require('dotenv').config()
const config = require('./config')

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