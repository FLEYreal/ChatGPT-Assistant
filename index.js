// Configs
require('dotenv').config()
const config = require('./config')

console.log('[INFO] : Setting up...')

// Console application
const { consoleApplication } = require('./console')
consoleApplication(config.locations.console)

// API routes
require('./api')

// Discord bot
require('./discord')

// Telegram bot
require('./telegram')