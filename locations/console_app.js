// Configs
require("dotenv").config();

// OpenAI
const OpenAIApi = require("openai");

// Utils
const { transformPrompts } = require("../utils/transform_prompts");

// Basics
const readline = require("readline");

// Initializing openai class
const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

function consoleApplication(config) {
    // Checks if it's off in config
    if (!config.locations.console) {
        return;
    } else {
        // A Conversation History
        const history = [];

        // Messages from system so GPT understood the context and what it needs to do
        history.push(...transformPrompts("system", config.instructions));

        // Creating console interface
        const userInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `\n${config.user_name || "User"} > `,
        });

        // Start a conversation
        userInterface.prompt();

        // Event works when message from console is sent
        userInterface.on("line", async (line) => {
            // Save line to conversation history
            history.push({ role: "user", content: line });

            // Get a response from ChatGPT
            const response = await openAi.chat.completions.create({
                model: config.gpt_version,
                messages: history,
                max_tokens: config.max_tokens,
            });

            // Send response in console
            console.log(
                `\n\u001b[1;32m${config.gpt_name || "ChatGPT"} >`,
                response.choices[0].message.content,
                "\u001b[0m",
            );

            // Continue a conversation
            userInterface.prompt();
        });
    }
}

module.exports = {
    consoleApplication: consoleApplication,
};
