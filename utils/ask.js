// Configs
require('dotenv').config()
const config = require('../config')
const config_lang = require('../config.language')

// Utils
const decoder = new TextDecoder();

// Function to get full GPT response instantly
async function getGPTResponse(history, lang) {

}

// Function to get GPT response bit by bit in real time
async function getStreamingGPTResponse(history, controller, lang = 'en', onChunk) {

    // Entire gpt response
    let gpt_response = '';

    // Make a POST request to the OpenAI API to get chat completions
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            messages: history,
            temperature: 0.1,
            model: config.gpt_version,
            max_tokens: config.max_tokens,
            stream: true,
        }),

        // Use the AbortController's signal to allow aborting the request
        signal: controller.signal,
    })
        .catch(err => {
            console.error('[\u001b[1;31mERROR\u001b[0m] :', err)
            return {
                error: err
            }
        });
    
    if(response.error) return {
        error: {
            code: 404,
            display: config_lang[lang].errors.failed_to_load_chunk,
            data: error
        }
    }

    // When chunk of the response gotten
    for await (const chunk of response.body) {
        const decodedChunk = decoder.decode(chunk);

        // Clean up the data
        const lines = decodedChunk
            .split("\n")
            .map((line) => line.replace("data: ", ""))
            .filter((line) => line.length > 0)
            .filter((line) => line !== "[DONE]")
            .map((line) => JSON.parse(line));

        // Defined line wrapping and change to correct "code" to then define it on frontend and replace with <br>
        if (
            lines 
            && lines[0]
            && lines[0].choices
            && lines[0].choices[0] 
            && new RegExp(/\n/).test(lines[0].choices[0].delta.content)) {

            let result = lines[0].choices[0].delta.content.replace(/\n/g, '[BACK-SLASH-N]')
            lines[0].choices[0].delta.content = result;

        }

        // Destructuring!
        for (const line of lines) {
            const {
                choices: [
                    {
                        delta: { content },
                    },
                ],
            } = line;

            if (content) {
                gpt_response += content;
                onChunk(content, null, false)
            }
        }
    }

    onChunk(null, gpt_response, true)
    return {
        chunk: null,
        response: gpt_response,
        isDone: true
    }
}

module.exports = {
    getGPTResponse,
    getStreamingGPTResponse
}