// Configs
require('dotenv').config()

// OpenAI
const OpenAIApi = require('openai')
const openAI = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
})

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

        // Middlewares
        app.use(express.json())

        // API Routes
        app.post('/chat', async (req, res) => {
            try {
                const response = await openAI.chat.completions.create({
                    model: config.gpt_version,
                    messages: [{
                        role: 'user',
                        content: req.body.prompt || req.body.message
                    }],
                    max_tokens: config.max_tokens
                })

                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat" worked')

                return res.status(200).json({
                    response: response.choices[0].message.content
                })

            } catch(error) {
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                res.status(500).json({error: error})
            }
        })

        app.listen(process.env.API_PORT | 3000, () => {
            console.log('[\u001b[1;36mINFO\u001b[0m] : API Server is ON')
        })
    }

}

module.exports = {
    apiApplication
}