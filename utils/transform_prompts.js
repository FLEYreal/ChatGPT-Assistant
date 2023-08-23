function transformPrompts(role, prompts) {
    
    // Transformation
    const result = prompts.map(i => {
        return {
            role: role,
            prompts: i
        }
    })

    // Return result
    return result
}

module.exports = {
    transformPrompts: transformPrompts
}