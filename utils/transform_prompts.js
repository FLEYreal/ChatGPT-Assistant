import config from "../config.js";

function transformPrompts(role, prompts) {
    const filteredPrompts = prompts.filter((prompt) => prompt.length > 0);

    // Transformation
    return filteredPrompts.map((prompt) => {
        return { role: role, content: prompt };
    });
}

const systemPrompt = [...transformPrompts("system", config.instructions)];

function transformHistory(prompt = "") {
    const userPrompt = { role: "user", content: prompt };
    return [...systemPrompt, userPrompt];
}

export { transformHistory, transformPrompts };
