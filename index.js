import dotenv from "dotenv";

import config from "./config.js";

// Utils for checking
import { check } from "./utils/check.js";

import { apiApplication } from "./locations/api.js";
import { consoleApplication } from "./locations/console_app.js";
import { discordBot } from "./locations/discord.js";

// Configs
dotenv.config();

async function main() {
    // Important checks of script,
    await check();

    // Config

    // Display logs to console
    await import ("./utils/display_logs.js");

    // API routes
    apiApplication(config);

    // Discord bot
    discordBot(config);

    // Telegram bot
    await import ("./locations/telegram.js");

    // Console application
    consoleApplication(config);
}

// Main function
main();
