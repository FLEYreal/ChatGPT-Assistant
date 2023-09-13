"use strict";

const { logging } = require("./logging");

function transformPrompts(role, prompts) {
    const filteredPrompts = prompts.filter((i) => i.length > 0);

    // Transformation
    const result = filteredPrompts.map((i) => {
        return {
            role: role,
            content: i,
        };
    });

    // Return result
    return result;
}

function transformHistory(history) {
    logging.info(history);
    return history;
}

module.exports = {
    transformPrompts,
    transformHistory,
};
