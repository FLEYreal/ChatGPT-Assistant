// Configs
require('dotenv').config()

// OpenAI
const OpenAIApi = require('openai')

// Basics
const readline = require('readline')

// Initializing openai class
const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
})

function consoleApplication(config) {

    // Checks if it's off in config
    if (!config.locations.console) {
        return;
    } else {

        // Creating console interface
        const userInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\nUser > '
        })

        // Start a conversation
        userInterface.prompt();

        // A Conversation History
        const history = [];

        // Event works when message from console is sent
        userInterface.on('line', async (line) => {

            // Save line to conversation history
            history.push({ role: 'user', content: line })

            // Get a response from ChatGPT
            const response = await openAi.chat.completions.create({
                model: config.gpt_version,
                messages: history,
                max_tokens: config.max_tokens
            })

            // Send response in console
            console.log('\n\u001b[1;32mChatGPT >', response.choices[0].message.content, '\u001b[0m')

            // Continue a conversation
            userInterface.prompt()
        })
    }
}

module.exports = {
    consoleApplication: consoleApplication
}