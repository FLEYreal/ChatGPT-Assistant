// Configs
require('dotenv').config()

// OpenAI
const OpenAIApi = require('openai')

// Basics
const express = require('express')
const app = express()

function apiApplication(config) {

    // Checks if it's off in config
    if(!config.locations.api) {
        return;
    }
    else if(config.locations.console) {
        console.log('[\u001b[1;31mERROR\u001b[0m] : API cannot work when Console Application is on!')
        return;
    }
    else {
        app.listen(process.env.API_PORT | 3000, () => {
            console.log('[\u001b[1;36mINFO\u001b[0m] : API Server is ON')
        })
    }

}

module.exports = {
    apiApplication
}