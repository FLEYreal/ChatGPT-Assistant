module.exports = {

    // Width and Height of the Chat interface
    // PX - are pixels, you can also use % intead of "px"
    width: '100%',
    height: '100svh',

    // Background of the page
    background_color: '#353541',

    // Fonts of the page, they're listed, if the 1st font isn't found, it's applying second and so on
    font_family: 'Söhne ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',

    // Settings for the header
    header: {

        // Settings for the color
        color: {
            // Settings for color of the backround of the header
            background: '#3F414E',

            // Settings for color of the font of the header
            font: '#D1D1D1'
        },

        // Shadow settings, if you don't know CSS, use box-shadow CSS generators
        shadow: 'rgba(0, 0, 0, 0.2) 0px 4px 24px 0px',

        // If it's true - hides the header from the page entirely
        hide: false
    },

    // Settings for the messages of GPT & User
    messages: {

        user: {

            // Settings for the color
            color: {
                // Settings for color of the backround of the user message
                background: '',

                // Settings for color of the font of the user message
                font: ''
            }
        },
        gpt: {

            // Settings for the color
            color: {
                // Settings for color of the backround of the gpt message
                background: '',

                // Settings for color of the font of the gpt message
                font: ''
            }
        }
    },
    input: {

        // Settings for the color
        color: {
            // Settings for color of the backround of the input
            background: '',

            // Settings for color of the font of the input
            font: ''
        },

        // Shadow settings, if you don't know CSS, use box-shadow CSS generators
        shadow: '',

        // Rounding in pixels (px)
        rounding: ''
    },

    // Settings of the buttons in action bar (buttons above input)
    buttons: {

        // Settings for the color
        color: {
            // Settings for color of the backround of the buttons
            background: '',

            // Settings for color of the font of the buttons
            font: '',

            // Settings for color of the border of the buttons
            border: ''
        },

        // Rounding in pixels (px)
        rounding: ''
    },

    // Settings for error wrapper that appears when error happened
    error: {

        // Settings for the color
        color: {
            // Settings for color of the backround of the error wrapper
            background: '',

            // Settings for color of the font of the error wrapper
            font: '',

            // Settings for color of the border of the error wrapper
            border: ''
        },

        // Rounding in pixels (px)
        rounding: ''
    }
}