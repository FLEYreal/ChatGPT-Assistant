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
const msgRoute = require('./routes/message')

// Database SQLite
const sqlite3 = require('sqlite3').verbose()

// Utils
const axios = require('axios');

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
        app.use('/message', msgRoute)

        // Setup EJS template engine
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '..', 'interfaces'));

        // Socket events
        let connections = [];
        io.sockets.on('connection', (socket) => {
            if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : User connected')
            connections.push(socket)

            socket.on('disconnect', () => {

                connections.splice(connections.indexOf(socket), 1)
                if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Used disconnected')

            })

            socket.on('message_sent', async (data) => {

                console.log('Message Sent!')

                // Get History of the conversation by ID
                let response = await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/conversation`, {
                    id: data.id,
                    prompt: data.value
                })
                    .then(res => res.data.gpt_response)
                    .catch(err => {
                        io.sockets.emit('get_gpt_response', { error: err })
                        console.log('[\u001b[1;31mERROR\u001b[0m] :', err)
                    })

                io.sockets.emit('get_gpt_response', { gpt_response: response })
            })

            socket.on('restart_conversation', async (data) => {

                // Delete conversation from DB
                if(config.delete_restarted_conversations) {
                    await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/delete`, {
                        id: data.id,
                    })
                        .then(res => res.data.gpt_response)
                        .catch(err => {
                            console.log('[\u001b[1;31mERROR\u001b[0m] :', err)
                        })
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