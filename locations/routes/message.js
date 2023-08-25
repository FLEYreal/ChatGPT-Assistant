// Configs
require('dotenv').config();
const config = require('../../config');

// Basics
const express = require('express');
const router = express.Router();

// OpenAI
const OpenAIApi = require('openai');
const openAI = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
});

// Create message and send it in response
router.post('/create', async (req, res) => {
    try {
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/message/create" worked')

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

module.exports = router