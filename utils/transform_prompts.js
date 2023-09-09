function transformPrompts(role, prompts) {

    const filteredPrompts = prompts.filter(i => i.length > 0)

    // Transformation
    const result = filteredPrompts.map(i => {
            return {
                role: role,
                content: i
            }
    })

    // Return result
    return result
}

// Transforms chatGPT's response content from array to string, 
// used to send history to openAI API that doesn't accept arrays in content
function transformResponse(prompt) {

    // Get transformed result
    const result = prompt.map(i => {
        if(i.role === 'assistant') {

            // Create string from every piece of array
            let content = ''
            for(let x = 0; x < i.content.length; x++) {
                content += i.content[x]
            }

            // Return without array
            return {
                role: i.role,
                content: content
            }
        } 
        else return i
    })

    // Return transformed result
    return result;

}

module.exports = {
    transformPrompts: transformPrompts,
    transformResponse: transformResponse
}