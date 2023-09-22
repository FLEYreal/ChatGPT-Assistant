import dotenv from "dotenv";
import readline from "readline";

import { getGPTResponse } from "../utils/ask.js";
import { transformPrompts } from "../utils/transform_prompts.js";

dotenv.config();

function consoleApplication(config) {
    // Checks if it's off in config
    if (!config.locations.console) {
        return;
    } else {
        // A Conversation History
        let history = [];

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
            const response = await getGPTResponse(history);

            // Send response in console
            console.log(
                `\n\u001b[1;32m${config.gpt_name || "ChatGPT"} >`,
                response,
                "\u001b[0m",
            );

            // Continue a conversation
            userInterface.prompt();
        });
    }
}

export { consoleApplication };
