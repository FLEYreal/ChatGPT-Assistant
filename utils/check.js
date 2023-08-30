// Basics
const fs = require('fs');

// Config
const config = require('../config')

// Function that checks file's existence
function check_file(source = 'config.js', message = 'This file is important for the script!') {

    // Check if file exists
    fs.access(source, fs.constants.F_OK, error => {
        if (error) {

            // Log that file doesn't exists
            console.error(`[\u001b[1;31mERROR\u001b[0m] : file \"${source}\" doesn\'t exists!\n${message}\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com`);

            // Stop code's completion
            process.exit(1)
        } else return true;
    });

}

function check_api_file(source = 'config.js', message = 'This file is important for the script!') {

    // Check if file exists
    fs.access(source, fs.constants.F_OK, error => {
        if (error) {

            // This param error is only important if user will be using interface
            if (config.locations.api) {
                // Log that file doesn't exists
                console.error(`[\u001b[1;31mERROR\u001b[0m] : file \"${source}\" doesn\'t exist!\n${message}\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com`);

                // Stop code's completion
                process.exit(1)
            }
            else console.log(`[\u001b[1;33mWARN\u001b[0m] : file \"${source}\" doesn\'t exist!\nThis file is important for API!\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com`);
        }
    });
}

// Function that checks that everything important for script is working properly
function check() {

    // Check files important to api
    check_api_file('config.styles.js', 'This file is important to properly setup styles, without it, interface of the chat will be broken!')
    check_api_file('interfaces/chat_interface.ejs', 'This file is interface for chat itself!\nWithout it, you won\'t be able to use chat interface at all!')
    check_api_file('public/chat_interface.css', 'This file is responsible for the most unconfigurable styling!\nWithout it, interface will be broken!')
    check_api_file('locations/api.js', 'This file is the center of API. Without this file, nothing will be working')
    check_api_file('locations/routes/chat.js', 'All routes related to chat won\'t work without this file.')
    check_api_file('locations/routes/config.js', 'All routes related to configs won\'t work without this file.')

    // Check files important for the entire script
    check_file('config.js', 'This file is important to properly setup script, without it, the script won\'t work at all!')
    check_file('config.language.js', 'This file contains all text of this script, even errors, excluding this one!\nWithout this file - all text will be empty or cause errors!')
    check_file('conversations.db', 'This file contains is Database\nWithout it script won\'t work at all!')
    check_file('.env', 'This file is sort of second \"config.js\" but for private data, which can\'t be exposed!\nWithout this file you won\'t be able to interact with chatGPT or to properly interact with API from interface')
    
    // Check all locations except API
    if(config && config.locations.console) check_file('locations/console_app.js', 'This file is a center of console application.\nConsole application will no longer work until file is back!')
    if(config && config.locations.console) check_file('locations/discord.js', 'This file is a center of discord bot.\nDiscord Bot will no longer work until file is back!')
    if(config && config.locations.console) check_file('locations/telegram.js', 'This file is a center of telegram bot.\nTelegrm Bot will no longer work until file is back!')

    // Check all important Utils
    check_file('utils/transform_prompts.js', 'This file transforms prompts to chatGPT to proper look!\nWithout this file, any interaction with chatGPT will no longer work!')

    // Check of important properties of config
    if(!config.locations) console.error(`[\u001b[1;31mERROR\u001b[0m] : "locations" doesn\'t exist in config file!\nIt defines in what locations GPT will be working!`)
    
    else if(!config.gpt_version) console.error(`[\u001b[1;31mERROR\u001b[0m] : "gpt_version" doesn\'t exist in config file!\nIt defiens what version of chatGPT to use\nSee more about GPT versions here: https://platform.openai.com/docs/models!`);
    
    else if(!config.max_tokens) console.error(`[\u001b[1;31mERROR\u001b[0m] : "max_tokens" doesn\'t exist in config file!\nIt defines the limits amount of tokens per chatGPT message!`);
    
    else if(!config.instructions) console.error(`[\u001b[1;31mERROR\u001b[0m] : "instructions" doesn\'t exist in config file!\nIt give chatGPT instructions on what to say and what to do!`);
    
    else if(config.locations.discord && !config.discord) console.error(`[\u001b[1;31mERROR\u001b[0m] : "discord" doesn\'t exist in config file!\nIt defines all important params related to discord bot!`);
    
    else if(config.locations.telegram && !config.telegram) console.error(`[\u001b[1;31mERROR\u001b[0m] : "telegram" doesn\'t exist in config file!\nIt defines all important params related to telegram bot!`);

    else if(config.delete_restarted_conversations) console.error(`[\u001b[1;31mERROR\u001b[0m] : "delete_restarted_conversations" doesn\'t exist in config file!\nIt defines either to delete restarted (by button) conversation or not!`);

    else if(config.contact_email) console.error(`[\u001b[1;31mERROR\u001b[0m] : "contact_email" doesn\'t exist in config file!\nIt defines a public email people will see to contact you!`);

}

// Export everything needed
module.exports = {
    check: check,
    check_file: check_file
}