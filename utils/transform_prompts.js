import { logging } from "./logging.js";

import config from "../config.js";
import { use } from "marked";

function transformPrompts(role, prompts) {
    const filteredPrompts = prompts.filter((prompt) => prompt.length > 0);

    // Transformation
    return filteredPrompts.map((prompt) => {
        return { role: role, content: prompt };
    });
}

const systemPrompt = [...transformPrompts("system", config.instructions)];

class FilterPrompts {
    static byRole(role, history) {
        return history.filter((prompt) => prompt.role === role);
    }

    static byUser(history) {
        return FilterPrompts.byRole("user", history);
    }
}

function isDuplicateUserPrompt(history, userPrompt) {
    const seen = new Set();
    let userPromptHistory = FilterPrompts.byUser(history);
    userPromptHistory.push(userPrompt);

    return userPromptHistory.some((_userPrompt) => {
        if (seen.has(_userPrompt.content)) return true;

        seen.add(_userPrompt.content);
        return false;
    });
}

function updateHistory(history = null, prompt = "") {
    if (history === null) history = [];

    const userPrompt = { role: "user", content: prompt };
    const systemPromptIndex = history.indexOf(systemPrompt[0]);

    if (systemPromptIndex === -1) history.push(...systemPrompt);
    if (isDuplicateUserPrompt(history, userPrompt) === false)
        history.push(userPrompt);

    return history;
}

export { transformPrompts, updateHistory };
