// Configs
require("dotenv").config();

// Utils for checking
const { check } = require("./utils/check");

async function main() {
    // Important checks of script,
    await check();

    // Config
    const config = require("./config");

    // Display logs to console
    require("./utils/display_logs");

    // API routes
    const { apiApplication } = require("./locations/api");
    apiApplication(config);

    // Discord bot
    const { discordBot } = require("./locations/discord");
    discordBot(config);

    // Telegram bot
    require("./locations/telegram");

    // Console application
    const { consoleApplication } = require("./locations/console_app");
    consoleApplication(config);
}

// Main function
main();
