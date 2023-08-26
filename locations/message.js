
// Configs
require('dotenv').config();
const config = require('../config');

// Basics
const express = require('express');
const router = express.Router();

// OpenAI
const OpenAIApi = require('openai');
const openAI = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
});

// Create message and send it in response
router.post('/create/static', async (req, res) => {
    try {
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/message/create/static" worked')

        const response = await openAI.chat.completions.create({
            model: config.gpt_version,
            messages: JSON.parse(req.body.history),
            max_tokens: config.max_tokens
        })

        return res.status(200).json({
            response: response.choices[0].message.content
        })

    } catch (error) {
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        res.status(500).json({ error: error })
    }
})

router.post('/create/stream', async (req, res) => {
    try {
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/message/create/stream" worked')
        
        const stream = await openAI.chat.completions.create({
            model: config.gpt_version,
            messages: [{role: 'user', content: 'What year is this?'}],//JSON.parse(req.body.history),
            max_tokens: config.max_tokens,
            stream: true
        })

        let gpt_response = '';

        for await (const part of stream) {
            const chunk = part.choices[0].delta.content || "";
            gpt_response += chunk // accumulate
            console.log('result: ', gpt_response)

            const endIndex = gpt_response.indexOf('}');
            if (endIndex !== -1) {
                const startIndex = gpt_response.indexOf('{');

                const jsonObject = gpt_response.slice(startIndex, endIndex + 1); // Extract the JSON object
                gpt_response = gpt_response.slice(endIndex + 1); // Remove the extracted JSON object from the accumulated data
                try {
                    const parsedObject = JSON.parse(jsonObject);
                    console.log(parsedObject); // Handle the parsed JSON object here
                    res.write(jsonObject);

                    // Make an API call
                } catch (err) {
                    console.error('Error while parsing JSON:', err);
                }
            }
        }

        } catch (error) {
            console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
            res.status(500).json({ error: error })
        }
})

module.exports = router