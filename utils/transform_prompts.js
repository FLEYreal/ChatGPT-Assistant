function transformPrompts(role, prompts) {

    // Transformation
    const result = prompts.filter(i => {

        if (i.length > 0) {
            return {
                role: role,
                content: i
            }
        }
    })

    // Return result
    return result
}

module.exports = {
    transformPrompts: transformPrompts
}