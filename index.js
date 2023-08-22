require('dotenv').config()

const OpenAIApi = require('openai')

const readline = require('readline')

// Initializing openai class
const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
})

// Creating console interface
const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Start a conversation
userInterface.prompt();

// Event works when message from console is sent
userInterface.on('line', async (line) => {

    // Get a response from ChatGPT
    const response = await openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'user',
            content: line
        }]
    })

    // Send response in console
    console.log('ChatGPT >', response.choices[0].message.content, '\n')

    // Continue a conversation
    userInterface.prompt()
})