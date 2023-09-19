import { logging } from "./logging.js";

import config from "../config.js";

function transformPrompts(role, prompts) {
    const filteredPrompts = prompts.filter((prompt) => prompt.length > 0);

    // Transformation
    return filteredPrompts.map((prompt) => {
        return { role: role, content: prompt };
    });
}

const systemPrompt = [...transformPrompts("system", config.instructions)];

function transformHistory(history) {
    const _i = history.indexOf(systemPrompt);

    if (_i === -1) history.push(summarizePrompt, message);
    else history.push(message);

    logging.info(history);
    return history;
}

export { transformPrompts };
