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

function consoleApplication(activate) {

    if (!activate) {
        console.log('[OFF] : Console Application')
    } else {
        console.log('[ON] : Console Application')

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
                model: 'gpt-3.5-turbo',
                messages: history
            })

            // Send response in console
            console.log('\nChatGPT >', response.choices[0].message.content)

            // Continue a conversation
            userInterface.prompt()
        })
    }
}

module.exports = {
    consoleApplication: consoleApplication
}