// CONFIG OF THIS PROJECT
// SET UP THE PROJECT THE WAY YOU NEED TO!

export default {
    // Locations where GPT will work
    locations: {
        // In console
        console: true,

        // With API, lets you access chat in browser or add it to your existing website
        api: false,

        // Discord bot
        discord: false,

        // Telegram bot
        telegram: false,
    },

    // Version of chatGPT
    gpt_version: "gpt-3.5-turbo",

    // Name for user
    user_name: "", // Default Value is "User"

    // Short name for user to use it on profile picture (example)
    short_user_name: "", // Default Value is "User"

    // Name for chatGPT
    gpt_name: "", // Default Value is "ChatGPT <version>"

    // Short name for chatGPT to use it on profile picture (example)
    short_gpt_name: "", // Default Value is "GPT"

    // Max amount of tokens per message
    max_tokens: 200,

    // Type what you need chatGPT to know and what chatGPT needs to do
    instructions: [
        // The list of the messages, by comma
        "",
        "",
        "",
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
    contact_email: "undefined.email@example.com",

    // Do delete entire conversation's database after each reload
    reload_history_cleanup: false
};
