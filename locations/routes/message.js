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

        const response = await openAI.chat.completions.create({
            model: config.gpt_version,
            messages: JSON.parse(req.body.history),
            max_tokens: config.max_tokens,
            stream: true
        }, { responseType: 'stream' })

        const stream = response.data;

        stream.on('data', (chunk) => {
            const payloads = chunk.toString().split("\n\n");

            for (const payload of payloads) {
                if (payload.includes('[DONE]')) return;
                if (payload.startsWith("data:")) {
                    const data = JSON.parse(payload.replace("data: ", ""));
                    try {
                        const chunk = data.choices[0].delta?.content;
                        if (chunk) {
                            console.log(chunk);
                        }
                    } catch (error) {
                        console.log(`console.error('[\u001b[1;31mERROR\u001b[0m] : Error with JSON.parse and' ${payload}.\n${error}`);
                    }
                }
            }
        })

        stream.on('end', () => {
            setTimeout(() => {
                console.log('\n[\u001b[1;36mINFO\u001b[0m] : Stream done');
                return res.send({ message: 'Stream done' });
            }, 10);
        })

        stream.on('error', (error) => {
            console.log(err);
            return res.send(err);
        })

    } catch (error) {
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        res.status(500).json({ error: error })
    }
})

module.exports = router