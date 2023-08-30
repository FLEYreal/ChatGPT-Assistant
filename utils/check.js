// Basics
const fs = require('fs').promises;

// Function to check file existence
async function check_file(source = 'config.js', message = 'This file is important for the script!') {
    try {
        await fs.access(source, fs.constants.F_OK);
    } catch (error) {
        // Log that the file doesn't exist
        console.error(`\n[\u001b[1;31mERROR\u001b[0m]: \u001b[1;33mFile \"${source}\" doesn't exist!\n         ${message}\n         If you lost the file, you can restore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com\u001b[0m\n`);

        // Stop code execution
        process.exit(1);
    }
}

// Function to check API file existence
async function check_api_file(config, source = 'config.js', message = 'This file is important for the script!') {
    try {
        await fs.access(source, fs.constants.F_OK);
    } catch (error) {
        // This error parameter is only important if the user will be using the interface
        if (config.locations.api) {
            // Log that the file doesn't exist
            console.error(`\n[\u001b[1;31mERROR\u001b[0m]: \u001b[1;33mFile \"${source}\" doesn't exist!\n         ${message}\n         If you lost the file, you can restore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com\u001b[0m\n`);

            // Stop code execution
            process.exit(1);
        } else {
            console.log(`\n[\u001b[1;33mWARN\u001b[0m]: \u001b[1;33mFile \"${source}\" doesn't exist!\n         This file is important for API!\n         If you lost the file, you can restore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com\u001b[0m\n`);
        }
    }
}


// Function that checks that everything important for script is working properly
async function check() {

    // Check files important for the entire script
    await check_file('.env', 'This file is sort of second \"config.js\" but for private data, which can\'t be exposed!\n         Without this file you won\'t be able to interact with chatGPT or to properly interact with API from interface')
    await check_file('config.js', 'This file is important to properly setup script, without it, the script won\'t work at all!')
    await check_file('config.language.js', 'This file contains all text of this script, even errors, excluding this one!\n         Without this file - all text will be empty or cause errors!')
    await check_file('conversations.db', 'This file contains is Database\n         Without it script won\'t work at all!')

    // Config
    const config = require('../config')

    // Check files important to api
    await check_api_file(config, 'config.styles.js', 'This file is important to properly setup styles, without it, interface of the chat will be broken!')
    await check_api_file(config, 'interfaces/chat_interface.ejs', 'This file is interface for chat itself!\n         Without it, you won\'t be able to use chat interface at all!')
    await check_api_file(config, 'public/chat_interface.css', 'This file is responsible for the most unconfigurable styling!\n         Without it, interface will be broken!')
    await check_api_file(config, 'locations/api.js', 'This file is the center of API. Without this file, nothing will be working')
    await check_api_file(config, 'locations/routes/chat.js', 'All routes related to chat won\'t work without this file.')
    await check_api_file(config, 'locations/routes/config.js', 'All routes related to configs won\'t work without this file.')

    // Check all locations except API
    await check_file('locations/console_app.js', 'This file is a center of console application.\n         Console application will no longer work until file is back!')
    await check_file('locations/discord.js', 'This file is a center of discord bot.\n         Discord Bot will no longer work until file is back!')
    await check_file('locations/telegram.js', 'This file is a center of telegram bot.\n         Telegrm Bot will no longer work until file is back!')

    // Check all important Utils
    await check_file('utils/transform_prompts.js', 'This file transforms prompts to chatGPT to proper look!\n         Without this file, any interaction with chatGPT will no longer work!')

    // Check of important properties of config
    if (config && !config.locations) {
        console.error(`[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"locations" doesn\'t exist in config file!\n         It defines in what locations GPT will be working!\u001b[0m\n`)
        process.exit(1)
    }

    else if (config && !config.gpt_version) {
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"gpt_version" doesn\'t exist in config file!\n         It defiens what version of chatGPT to use\n         See more about GPT versions here: https://platform.openai.com/docs/models!\u001b[0m\n`);
        process.exit(1)
    }

    else if (config && !config.max_tokens) {
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"max_tokens" doesn\'t exist in config file!\n         It defines the limits amount of tokens per chatGPT message!\u001b[0m\n`);
        process.exit(1)
    }

    else if (config && !config.instructions) {
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"instructions" doesn\'t exist in config file!\n         It give chatGPT instructions on what to say and what to do!\u001b[0m\n`);
        process.exit(1)
    }

    else if (config && !config.delete_restarted_conversations) {
        console.log(config)
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"delete_restarted_conversations" doesn\'t exist in config file!\n         It defines either to delete restarted (by button) conversation or not!\u001b[0m\n`);
        process.exit(1)
    }

    else if (config && !config.contact_email) {
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"contact_email" doesn\'t exist in config file!\n         It defines a public email people will see to contact you!\u001b[0m\n`);
        process.exit(1)
    }

    else if (config && config.locations.discord && !config.discord) {
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"discord" doesn\'t exist in config file!\n         It defines all important params related to discord bot!\u001b[0m\n`);
        process.exit(1)
    }

    else if (config && config.locations.telegram && !config.telegram) {
        console.error(`\n[\u001b[1;31mERROR\u001b[0m] : \u001b[1;33m"telegram" doesn\'t exist in config file!\n         It defines all important params related to telegram bot!\u001b[0m\n`);
        process.exit(1)
    }

}

// Export everything needed
module.exports = {
    check: check,
    check_file: check_file,
    check_api_file: check_api_file
}