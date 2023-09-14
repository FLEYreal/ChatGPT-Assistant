// Config
import dotenv from 'dotenv';
dotenv.config();

// Utils
import { logging } from "./logging.js";

// Basics
import fs from "fs";

// Function to check file existence
async function check_file(
    source = "config.js",
    message = "This file is important for the script!",
) {
    try {
        await fs.promises.access(source, fs.constants.F_OK);
    } catch (error) {
        // Log that the file doesn't exist
        logging.exitWithError(
            `File \"${source}\" doesn't exist!\n         ${message}\n         If you lost the file, you can restore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com\n`,
        );
    }
}

// Function to check API file existence
async function check_api_file(
    config,
    source = "config.js",
    message = "This file is important for the script!",
) {
    try {
        await fs.promises.access(source, fs.constants.F_OK);
    } catch (error) {
        // This error parameter is only important if the user will be using the interface
        if (config.locations.api) {
            // Log that the file doesn't exist
            logging.exitWithError(
                `File \"${source}\" doesn't exist!\n         ${message}\n         If you lost the file, you can restore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com\n`,
            );
        } else {
            logging.warn(
                `File \"${source}\" doesn't exist!\n         This file is important for API!\n         If you lost the file, you can restore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com\n`,
            );
        }
    }
}

// Function that checks all important variables for interface
function check_interface_variables(variables, locale) {
    try {

        if (!locale) {
            logging.error('No locale defined!')
            return {
                error: {
                    code: 400,
                    display: 'No locale defined!',
                }
            }
        } else if (!variables) {
            logging.error('No variables to check!')
            return {
                error: {
                    code: 400,
                    display: locale.errors.no_vars,
                }
            }
        }

        if (!variables.history) {
            logging.error('History is not defined on "/chat/interface"');
            return {
                error: {
                    code: 404,
                    display: locale.errors.history_not_defined,
                },
            };
        } else if (!variables.config_style) {
            logging.error('Style Config is not defined on "/chat/interface"');
            return {
                error: {
                    code: 404,
                    display: locale.errors.config_style_not_defined,
                },
            };
        } else if (!variables.display_gpt_name) {
            logging.log('Display GPT Name is not defined on "/chat/interface"');
            return {
                error: {
                    code: 404,
                    display: locale.errors.display_gpt_name_not_defined,
                },
            };
        } else if (!process.env.API_IP) {
            logging.error('API\'s IP is not defined in ".env" file on "/chat/interface"');
            return {
                error: {
                    code: 404,
                    display: locale.errors.api_ip_not_defined,
                },
            };
        } else if (!process.env.API_PORT) {
            logging.error('API\'s PORT is not defined in ".env" file on "/chat/interface"');
            return {
                error: {
                    code: 404,
                    display: locale.errors.api_port_not_defined,
                },
            };
        } else if (
            variables.config.user_name ||
            variables.config.short_user_name ||
            variables.config.gpt_name ||
            variables.config.short_gpt_name
        ) {
            logging.warn("Custom names aren't defined in config!");
        }

        return {
            success: true
        }

    } catch (err) {

        logging.error(err)
        return {
            error: {
                code: 500,
                display: locale.errors.unexpected_error,
                message: err
            }
        }

    }
}

// Function that checks that everything important for script is working properly
async function check() {
    // Check files important for the entire script
    await check_file(
        ".env",
        "This file is sort of second \"config.js\" but for private data, which can't be exposed!\n         Without this file you won't be able to interact with chatGPT or to properly interact with API from interface",
    );
    await check_file(
        "config.js",
        "This file is important to properly setup script, without it, the script won't work at all!",
    );
    await check_file(
        "config.language.js",
        "This file contains all text of this script, even errors, excluding this one!\n         Without this file - all text will be empty or cause errors!",
    );
    await check_file(
        "conversations.db",
        "This file contains is Database\n         Without it script won't work at all!",
    );

    // Config
    const config = (await import("../config.js")).default;

    // Check files important to api
    await check_api_file(
        config,
        "config.styles.js",
        "This file is important to properly setup styles, without it, interface of the chat will be broken!",
    );
    await check_api_file(
        config,
        "interfaces/chat_interface.ejs",
        "This file is interface for chat itself!\n         Without it, you won't be able to use chat interface at all!",
    );
    await check_api_file(
        config,
        "public/chat_interface.css",
        "This file is responsible for the most unconfigurable styling!\n         Without it, interface will be broken!",
    );
    await check_api_file(
        config,
        "locations/api.js",
        "This file is the center of API. Without this file, nothing will be working",
    );
    await check_api_file(
        config,
        "locations/routes/chat.js",
        "All routes related to chat won't work without this file.",
    );
    await check_api_file(
        config,
        "locations/routes/config.js",
        "All routes related to configs won't work without this file.",
    );

    // Check all locations except API
    await check_file(
        "locations/console_app.js",
        "This file is a center of console application.\n         Console application will no longer work until file is back!",
    );
    await check_file(
        "locations/discord.js",
        "This file is a center of discord bot.\n         Discord Bot will no longer work until file is back!",
    );
    await check_file(
        "locations/telegram.js",
        "This file is a center of telegram bot.\n         Telegrm Bot will no longer work until file is back!",
    );

    // Check all important Utils
    await check_file(
        "utils/transform_prompts.js",
        "This file transforms prompts to chatGPT to proper look!\n         Without this file, any interaction with chatGPT will no longer work!",
    );

    // Check of important properties of config
    if (config) {
        if (!config.locations)
            logging.exitWithError(
                `"locations" doesn't exist in config file!\n         It defines in what locations GPT will be working!\n`,
            );
        if (!config.gpt_version)
            logging.exitWithError(
                `"gpt_version" doesn't exist in config file!\n         It defiens what version of chatGPT to use\n         See more about GPT versions here: https://platform.openai.com/docs/models!\n`,
            );
        if (!config.max_tokens)
            logging.exitWithError(
                `"max_tokens" doesn\'t exist in config file!\n         It defines the limits amount of tokens per chatGPT message!\n`,
            );
        if (!config.instructions)
            logging.exitWithError(
                `"instructions" doesn\'t exist in config file!\n         It gives chatGPT instructions on what to say and what to do!\n`,
            );
        if (!config.delete_restarted_conversations)
            logging.exitWithError(
                `"delete_restarted_conversations" doesn\'t exist in config file!\n         It defines either to delete restarted (by button) conversation or not!\n`,
            );
        if (!config.contact_email)
            logging.exitWithError(
                `"contact_email" doesn\'t exist in config file!\n         It defines a public email people will see to contact you!\n`,
            );
        if (config.locations.discord && !config.discord)
            logging.exitWithError(
                `"discord" doesn\'t exist in config file!\n         It defines all important params related to discord bot!\n`,
            );
        if (config.locations.telegram && !config.telegram)
            logging.exitWithError(
                `"telegram" doesn\'t exist in config file!\n         It defines all important params related to telegram bot!\n`,
            );
    }
}

// Export everything needed
export { check, check_file, check_api_file, check_interface_variables };
