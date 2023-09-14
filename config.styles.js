export default {
    // Width and Height of the Chat interface
    // PX - are pixels, you can also use % intead of "px"
    width: "100%",
    height: "100svh",

    // Background of the page
    background_color: "#353541",

    // Fonts of the page, they're listed, if the 1st font isn't found, it's applying second and so on
    font_family:
        "Söhne ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji",

    // Settings for the header
    header: {
        // Settings for the color
        color: {
            // Settings for color of the backround of the header
            background: "#3F414E",

            // Settings for color of the font of the header
            font: "#D1D1D1",
        },

        // Shadow settings, if you don't know CSS, use box-shadow CSS generators
        shadow: "rgba(0, 0, 0, 0.2) 0px 4px 24px 0px",

        // If it's true - hides the header from the page entirely
        hide: false,
    },

    // Settings for the messages of GPT & User
    messages: {
        user: {
            // Settings for the color
            color: {
                // Settings for color of the backround of the user message
                background: "", // It's page background by default, it can stay empty

                // Settings for color of the font of the user message
                font: "#ececf1",
            },
        },
        gpt: {
            // Settings for the color
            color: {
                // Settings for color of the backround of the gpt message
                background: "#444653",

                // Settings for color of the font of the gpt message
                font: "#d1d5db",
            },
        },
    },

    // Styles for input to send prompt to chatGPT
    input: {
        // Settings for the color
        color: {
            // Settings for color of the backround of the input
            background: "#3F414E",

            // Settings for color of the font of the input
            font: "#999999",
        },

        // Shadow settings, if you don't know CSS, use box-shadow CSS generators
        shadow: "0px 0px 24px 3px rgba(0, 0, 0, 0.15)",

        // Rounding in pixels (px)
        rounding: "12px",
    },

    // Settings of the buttons in action bar (buttons above input)
    buttons: {
        // Settings for the color
        color: {
            // Settings for color of the backround of the buttons
            background: "#353541",

            // Do default hover effect works (when your mouse is on the button, it lights up)
            hoverEffect: true,

            // Settings for color of the font of the buttons
            font: "#d9d9e3",

            // Settings for color of the border of the buttons
            border: "1px solid rgba(86, 88, 105)",
        },

        // Rounding in pixels (px)
        rounding: "5px",

        // The source of the icon to display relatively "public" folder!
        restartButtonIconUrl: '/icons/restart_icon.svg',
        stopButtonIconUrl: '/icons/stop_icon.svg',

        // Defines either icons displayed
        displayIcons: true
    }
};
