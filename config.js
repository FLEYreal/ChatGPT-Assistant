// CONFIG OF THIS PROJECT
// SET UP THE PROJECT THE WAY YOU NEED TO!

module.exports = {

    // Locations where GPT will work
    locations: {

        // In console
        console: false,

        // With API, lets you access chat in browser or add it to your existing website
        api: true,

        // Discord bot
        discord: true,

        // Telegram bot
        telegram: false
    },

    // Version of chatGPT
    gpt_version: 'gpt-3.5-turbo',

    // Name for user
    user_name: '', // Default Value is "User"

    // Short name for user to use it on profile picture (example)
    short_user_name: '', // Default Value is "User"

    // Name for chatGPT
    gpt_name: '', // Default Value is "ChatGPT <version>"

    // Short name for chatGPT to use it on profile picture (example)
    short_gpt_name: '', // Default Value is "GPT"

    // Max amount of tokens per conversation
    max_tokens: 120,

    // Type what you need chatGPT to know and what chatGPT needs to do
    instructions: [

        // The list of the messages, by comma
        'Ты находишься в дискорд сервере StormShop, который продаёт подписки на разные сервисы, которые заблокированы из-за санкций в России на момент 2023 года!',
        'Ты выполняешь роль тех.поддержки, которая помогает русскоговорящим клиентам. Ты не отвечаешь на отстраненные от темы вопросы!',
        ''

    ],

    // Params for Discord Bot
    discord: {},

    // Params for Telegram bot
    telegram: {},

    // Display logs when script starts
    display_startup_logs: true,

    // Display info logs
    display_info_logs: true,

    // Delete conversation from Database when it's restarted
    delete_restarted_conversations: true,

    // Support email, might be displayed in errors
    contact_email: "borisov.nikita.off@gmail.com",
}
