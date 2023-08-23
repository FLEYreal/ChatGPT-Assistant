// CONFIG OF THIS PROJECT
// SET UP THE PROJECT THE WAY YOU NEED TO!

module.exports = {

    // Locations where GPT will work
    locations: {

        // In console
        console: true,

        // With API, lets you access chat in browser or add it to your existing website
        api: true,

        // Discord bot
        discord: false,

        // Telegram bot
        telegram: false
    },

    // Version of chatGPT
    gpt_version: 'gpt-3.5-turbo',

    // Max amount of tokens per conversation
    max_tokens: 150,

    // Type what you need chatGPT to know and what chatGPT needs to do
    system_prompts: [
        '',
        '',
        ''
    ],

    // Params for Console Application
    console_app: {
        user_name: 'User',
        gpt_name: 'ChatGPT'
    },

    // Params for Discord Bot
    discord: {

        // API token to connect to the bot.
        api_token: ''
    },

    // Params for Telegram bot
    telegram: {

        // API token to connect to the bot
        api_token: ''
    }
}