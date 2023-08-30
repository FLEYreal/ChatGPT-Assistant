const fs = require('fs')

// Configs
require('dotenv').config();
const config_style = require('../config.styles');
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
const decoder = new TextDecoder();

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

                    // create new AbortController
                    const controller = new AbortController();
                    const signal = controller.signal;

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
                            display: `No conversation ID found!`,
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
                                display: `Failed to get history of conversation! Try later or contact support on ${config.contact_email}`,
                                data: err
                            })
                        })

                    // Get newHistory, parse past one
                    let newHistory = JSON.parse(history)

                    // Push current prompt GPT
                    newHistory.push({
                        role: 'user',
                        content: value
                    })

                    // Make a POST request to the OpenAI API to get chat completions
                    const response = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                        },
                        body: JSON.stringify({
                            messages: newHistory,
                            temperature: 0.1,
                            model: config.gpt_version,
                            max_tokens: config.max_tokens,
                            stream: true,
                        }),

                        // Use the AbortController's signal to allow aborting the request
                        signal: controller.signal,
                    })
                        .catch(err => {
                            socket.emit('err', {
                                code: 500,
                                display: `Failed to load chunk of the response! Try later or contact support on ${config.contact_email}`,
                                data: err
                            })
                        });

                    // When chunk of the response gotten
                    for await (const chunk of response.body) {
                        const decodedChunk = decoder.decode(chunk);

                        // Clean up the data
                        const lines = decodedChunk
                            .split("\n")
                            .map((line) => line.replace("data: ", ""))
                            .filter((line) => line.length > 0)
                            .filter((line) => line !== "[DONE]")
                            .map((line) => JSON.parse(line));

                        // Destructuring!
                        for (const line of lines) {
                            const {
                                choices: [
                                    {
                                        delta: { content },
                                    },
                                ],
                            } = line;

                            if (content) {
                                gpt_response += content;
                                socket.emit('chunk', { content: content })
                            }
                        }
                    }

                    // Notify frontend when message is completed
                    socket.emit('fully_received')

                    // Save a prompt and response to history
                    await axios.put(`${process.env.API_IP}:${process.env.API_PORT}/chat/save-history`, {
                        id: id,
                        prompt: value,
                        gpt_response: gpt_response
                    }).catch((err) => {
                        socket.emit('err', {
                            code: 500,
                            display: `Failed to save conversation history! If you think this error is important, you can contact us on: ${config.contact_email}`,
                            data: err
                        })
                    })

                } catch (error) {
                    console.error('[\u001b[1;31mERROR\u001b[0m] : (Might Be just a Request Abort, Nothing to worry)', error)
                }
            })

            // When button to restart conversation is clicked
            socket.on('restart_conversation', async (data) => {

                // Delete conversation from DB
                if (config.delete_restarted_conversations) {
                    await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/delete`, {
                        id: data.id,
                    })
                        .then(res => res.data.gpt_response)
                        .catch(err => {
                            socket.emit('err', {
                                code: 500,
                                display: `Unexpected error happened! Try later or contact support on ${config.contact_email}`,
                                data: error
                            })
                            console.log('[\u001b[1;31mERROR\u001b[0m] :', err)
                        })
                }
            })

            // Stop generating response of GPT, aborts fetch from "message_sent" event
            socket.on('stop_generating', async (data) => {
                try {
                    if (data.sendMessage === false && socket.controller) {
                        // Stop streaming GPT response
                        socket.controller.abort();
                    } else {
                        socket.emit('err', {
                            code: 400,
                            display: `Can't stop generating response!`,
                            data: {}
                        })
                    }
                } catch (e) {
                    socket.emit('err', {
                        code: 500,
                        display: `Unexpected error happened! Try later or contact support on ${config.contact_email}`,
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