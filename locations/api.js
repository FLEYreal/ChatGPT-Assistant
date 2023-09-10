const fs = require('fs')

// Configs
require('dotenv').config();
const config_lang = require('../config.language');

// Basics
const path = require('path');
const express = require('express');
const app = express();

// Libraries
const cors = require('cors');
const cookieParser = require('cookie-parser');

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Routes
const chatRoute = require('./routes/chat')
const configRoute = require('./routes/config')

// Database SQLite
const sqlite3 = require('sqlite3').verbose()

// Utils
const axios = require('axios');
const { transformPrompts, transformResponse } = require('../utils/transform_prompts');
const { getStreamingGPTResponse } = require('../utils/ask')

function apiApplication(config) {

    // Checks if it's off in config
    if (!config.locations.api) {
        return;
    }
    else if (config.locations.console) {
        console.log('[\u001b[1;31mERROR\u001b[0m] : API cannot work when Console Application is on!')
        return;
    }
    else {

        // Connect to SQLite
        const db = new sqlite3.Database('./conversations.db', sqlite3.OPEN_READWRITE, (error) => {
            if (error) console.error('[\u001b[1;31mERROR\u001b[0m] :', error.message)
        })

        // Create a table if not exists
        const create_table = 'CREATE TABLE IF NOT EXISTS conversations( id CHAR(36) PRIMARY KEY, history JSON DEFAULT [] )'
        db.run(create_table);

        // Middlewares
        app.use(express.json());
        app.use(cookieParser());
        app.use(cors())
        app.use(express.static('public'));

        // Setup routes
        app.use('/chat', chatRoute)
        app.use('/config', configRoute)

        // Setup EJS template engine
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '..', 'interfaces'));

        // Socket events
        let connections = [];
        io.sockets.on('connection', (socket) => {
            // Display log when user is connected to the interface
            if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : User connected')

            // Add connection to the array
            connections.push(socket)

            // When user disconnected
            socket.on('disconnect', () => {

                // Delete from the array + log to console
                connections.splice(connections.indexOf(socket), 1)
                if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Used disconnected')

            })

            // When prompt to chatGPT is sent
            socket.on('message_sent', async (data) => {

                try {

                    // Get ID and language from data
                    let { lang } = data

                    // If language wasn't found
                    if (!lang) lang = 'en'

                    // If selected language doesn't exist in config.language.js
                    else if (!config_lang[lang]) lang = 'en'

                    // Get object with all translations
                    const locale = config_lang[lang]

                    // create new AbortController
                    const controller = new AbortController();

                    // save controller in the context of conversation
                    socket.controller = controller;

                    // Get all variables
                    let gpt_response = '';
                    let { value, id } = data

                    // If id is undefined
                    if (!id) {
                        console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
                        socket.emit('err', {
                            code: 404,
                            display: locale.errors.id_not_found,
                            data: error
                        })
                    }

                    // Get History of the conversation by ID
                    let history = await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`, {
                        id: id
                    })
                        .then(res => res.data.history)
                        .catch(err => {
                            socket.emit('err', {
                                code: 500,
                                display: locale.errors.failed_to_get_history,
                                data: err
                            })
                        })

                    // Get newHistory, parse past one
                    let parsedHistory = JSON.parse(history)
                    let newHistory = [...transformPrompts('system', config.instructions), ...transformResponse(parsedHistory)]

                    // Push current prompt GPT
                    newHistory.push({
                        role: 'user',
                        content: value
                    })

                    // Make a POST request to the OpenAI API to get chat completions
                    const gpt = getStreamingGPTResponse(
                        // 1ST param is a history of conversation
                        newHistory,

                        // 2ND param is controller that let you to stop generating response if needed
                        controller,

                        // 3RD param is a language, 'ru', 'en' or else
                        lang,

                        // 4TH param is callback function that works as chunk is received
                        async (chunk, response, isDone) => {

                            if (!isDone) {
                                socket.emit('chunk', { content: chunk })
                            }

                            else if (isDone) {
                                gpt_response = response

                                // Notify frontend when message is completed
                                socket.emit('fully_received')

                                // Save a prompt and response to history
                                await axios.put(`${process.env.API_IP}:${process.env.API_PORT}/chat/save-history`, {
                                    id: id,
                                    prompt: value,
                                    gpt_response: gpt_response
                                })
                                    .catch((err) => {
                                        socket.emit('err', {
                                            code: 500,
                                            display: locale.errors.failed_to_save,
                                            data: err
                                        })
                                    })
                            }
                        }
                    )

                    if (gpt.error)
                        socket.emit('err', {
                            ...gpt.error
                        })

                } catch (error) {
                    console.error('[\u001b[1;31mERROR\u001b[0m] : (Might Be just a Request Abort, Nothing to worry)', error)
                }
            })

            // When button to restart conversation is clicked
            socket.on('restart_conversation', async (data) => {

                // Get ID and language from data
                let { lang } = data

                // If language wasn't found
                if (!lang) lang = 'en'

                // If selected language doesn't exist in config.language.js
                else if (!config_lang[lang]) lang = 'en'

                // Get object with all translations
                const locale = config_lang[lang]

                // Delete conversation from DB
                if (config.delete_restarted_conversations) {
                    await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/delete`, {
                        id: data.id,
                    })
                        .then(res => res.data.gpt_response)
                        .catch(error => {
                            socket.emit('err', {
                                code: 500,
                                display: locale.errors.unexpected_error,
                                data: error
                            })
                            console.log('[\u001b[1;31mERROR\u001b[0m] :', error)
                        })
                }
            })

            // Stop generating response of GPT, aborts fetch from "message_sent" event
            socket.on('stop_generating', async (data) => {

                // Get ID and language from data
                let { lang } = data

                // If language wasn't found
                if (!lang) lang = 'en'

                // If selected language doesn't exist in config.language.js
                else if (!config_lang[lang]) lang = 'en'

                // Get object with all translations
                const locale = config_lang[lang]

                try {
                    if (data.sendMessage === false && socket.controller) {
                        // Stop streaming GPT response
                        socket.controller.abort();
                    } else {
                        socket.emit('err', {
                            code: 400,
                            display: locale.errors.cant_stop,
                            data: {}
                        })
                    }
                } catch (e) {
                    socket.emit('err', {
                        code: 500,
                        display: locale.errors.unexpected_error,
                        data: error
                    })
                    console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                }
            })
        })

        server.listen(process.env.API_PORT | 3000, () => {
            if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : API Server is ON')
        })
    }

}

module.exports = {
    apiApplication
}