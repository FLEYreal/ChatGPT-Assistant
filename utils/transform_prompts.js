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

module.exports = {
    transformPrompts,
};
