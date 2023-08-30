// Basics
const fs = require('fs');

// Config
const config = require('../config')

// Function that checks file's existence
function check_file() {

}

// Function that checks that everything important for script is working properly
function check() {

    // CHECK IMPORTANT FILES

    fs.access('config.js', fs.constants.F_OK, error => {
        if (error) {

            // Log that file doesn't exists
            console.error('[\u001b[1;31mERROR\u001b[0m] : file \"config.js\" doesn\'t exists!\nThis file is important to properly setup script, without it, the script won\'t work at all!');

            // Stop code's completion
            process.exit(1)
        }
    });

    fs.access('config.styles.js', fs.constants.F_OK, error => {
        if (error) {

            // This param error is only important if user will be using interface
            if (config.locations.api) {
                // Log that file doesn't exists
                console.error('[\u001b[1;31mERROR\u001b[0m] : file \"config.styles.js\" doesn\'t exist!\nThis file is important to properly setup styles, without it, interface of the chat will be broken!\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com');

                // Stop code's completion
                process.exit(1)
            }
            else console.log('[\u001b[1;33mWARN\u001b[0m] : file \"config.styles.js\" doesn\'t exist!\nThis file is important for API!\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com');
        }
    });

    fs.access('config.language.js', fs.constants.F_OK, error => {
        if (error) {

            // Log that file doesn't exists
            console.error('[\u001b[1;31mERROR\u001b[0m] : file \"config.language.js\" doesn\'t exist!\nThis file contains all text of this script, even errors, excluding this one!\nWithout this file - all text will be empty or cause errors\nIf you lost the file, you a can resore it by either downloading copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com');

            // Stop code's completion
            process.exit(1)
        }
    });

    fs.access('conversations.db', fs.constants.F_OK, error => {
        if (error) {

            // Log that file doesn't exists
            console.error('[\u001b[1;31mERROR\u001b[0m] : file \"conversations.db\" doesn\'t exist!\nThis file contains is Database\nWithout it script won\'t work at all!\nIf you lost the file, you a can resore it by either downloading copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com');

            // Stop code's completion
            process.exit(1)
        }
    });

    fs.access('interfaces/chat_interface.ejs', fs.constants.F_OK, error => {
        if (error) {

            // This param error is only important if user will be using interface
            if (config.locations.api) {
                // Log that file doesn't exists
                console.error('[\u001b[1;31mERROR\u001b[0m] : file \"interfaces/chat_interface.ejs\" doesn\'t exist!\nThis file is interface for chat itself!\nWithout it, you won\'t be able to use chat interface at all!\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com');

                // Stop code's completion
                process.exit(1)
            }
            else console.log('[\u001b[1;33mWARN\u001b[0m] : file \"interfaces/chat_interface.ejs\" doesn\'t exist!\nThis file is important for API!\nIf you lost the file, you can resore it by either downloading a copy from our official sources (StormShop) or contacting us personally: borisov.nikit.off@gmail.com');
        }
    });
}

// Export everything needed
module.exports = {
    check: check,
    check_file: check_file
}