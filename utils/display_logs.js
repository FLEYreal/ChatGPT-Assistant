"use strict";

// Configs
require("dotenv").config();
const config = require("../config");
const { logging } = require("./logging");

if (config.display_startup_logs) {
    // Display console logs
    if (config.display_info_logs) logging.info("Setting up...");

    console.table({
        "GPT-Version": config.gpt_version,
        "Max-Tokens": config.max_tokens,
    });

    // Display location status from config
    if (!config.locations.console) logging.off("Console Application");
    else logging.on("Console Application");

    if (!config.locations.api) logging.off("API");
    else logging.on("API");

    if (!config.locations.discord) logging.off("Discord Bot");
    else logging.on("Discord Bot");

    if (!config.locations.telegram) logging.off("Telegram Bot");
    else logging.on("Telegram Bot");
}
