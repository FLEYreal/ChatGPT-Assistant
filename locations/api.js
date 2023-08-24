// Configs
require('dotenv').config();
const config_style = require('../config.styles');

// Basics
const path = require('path');
const express = require('express');
const app = express();

// Libraries
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// OpenAI
const OpenAIApi = require('openai');
const openAI = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
});

// Database SQLite
let sql;
const sqlite3 = require('sqlite3').verbose()

// Utils
const { transformPrompts } = require('../utils/transform_prompts');
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

        db.run('DELETE FROM conversations')

        // Middlewares
        app.use(express.json());
        app.use(cookieParser());
        app.use(cors())
        app.use(express.static('public'));

        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '..', 'interfaces'));

        // API Routes:

        // Create message and send it in response
        app.post('/message/create', async (req, res) => {
            try {
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/message/create" worked')
                console.log(JSON.parse(req.body.history))

                const response = await openAI.chat.completions.create({
                    model: config.gpt_version,
                    messages: JSON.parse(req.body.history),
                    max_tokens: config.max_tokens
                })

                return res.status(200).json({
                    response: response.choices[0].message.content
                })

            } catch (error) {
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                res.status(500).json({ error: error })
            }
        })

        // Create Chat ID and save to db. Database will store all the history of conversation
        app.get('/chat/create', async (req, res) => {
            try {
                // Log that route worked
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/create" worked')

                // Get unique ID
                const id = crypto.randomUUID()

                // Insert new data to database
                db.run('INSERT INTO conversations(id, history) VALUES (?, ?)', [id, JSON.stringify(transformPrompts('system', config.system_prompts))], (error) => {
                    if (error) {
                        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                        return res.status(500).json({ error: error })
                    }
                })

                // Set id in cookie
                res.cookie('CUC-ID', id) // CUC-ID stands for ChatGPT-Unique-Conversation-ID

                // Return result
                return res.status(200).json({ id: id })

            } catch (error) {
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                return res.status(500).json({ error: error })
            }
        })

        // A full conversation with chatGPT
        app.post('/chat/conversation', async (req, res) => {

            // Get ID from query
            let { id, prompt } = req.body
            if (!id) id = req.cookies['CUC-ID']
            if (!id) {
                console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
                return res.status(404).json({ error: 'No ID / CUC-ID found' })
            }

            // Get History of the conversation by ID
            let history = await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`, {
                id: id
            })
                .then(res => res.data.history)
                .catch(err => res.json({ error: err }))


            // Add new prompt and get newHistory
            let newHistory = JSON.parse(history)

            newHistory.push({
                role: 'user',
                content: prompt
            })

            // Get response of chatGPT
            const gpt_response = await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/message/create`, {
                history: JSON.stringify(newHistory)
            })
                .then(res => res.data)
                .catch(err => res.json({ error: err }))

            // Update history in database
            await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/save-history`, {
                id: id,
                prompt: prompt,
                gpt_response: gpt_response.response
            })
                .catch(err => res.json({ error: err }))

            // Return result
            return res.status(200).json({
                history: history,
                prompt: prompt,
                got_response: gpt_response.response
            })

        })

        // Delete a conversation from DB
        app.delete('/chat/delete', async (req, res) => {
            try {
                // Log that route worked
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/create" worked')

                // Get ID from request body
                let { id } = req.body
                if (!id) id = req.cookies['CUC-ID']
                if (!id) {
                    console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
                    return res.status(404).json({ error: 'No ID / CUC-ID found' })
                }

                // Find a row by ID
                const row = await new Promise((resolve, reject) => {
                    db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                        if (error) {
                            console.error('[\u001b[1;31mERROR\u001b[0m] :', error);
                            reject(error);
                        } else {
                            resolve(row);
                        }
                    });
                });

                if (row.length <= 0) {
                    // No row found
                    console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
                    return res.status(404).json({ message: "Row not found!" });
                }

                // Delete ID from database
                db.run('DELETE FROM conversations WHERE id = ?', [id], (error) => {
                    if (error) {
                        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                        return res.status(500).json({ error: error })
                    } else {

                        // Clear cookie
                        res.clearCookie('CUC-ID');

                        // Return success
                        return res.status(200).json({ message: 'row successfully deleted' })
                    }
                })

            } catch (error) {
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                return res.status(500).json({ error: error })
            }
        })

        // Get conversation history by ID
        app.post('/chat/get-history', async (req, res) => {
            try {
                // Log that route worked
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/get-history" worked')

                // Get ID from request body
                let { id } = req.body
                if (!id) id = req.cookies['CUC-ID']
                if (!id) {
                    console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
                    return res.status(404).json({ error: 'No ID / CUC-ID found' })
                }

                // Find a row by ID
                const row = await new Promise((resolve, reject) => {
                    db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                        if (error) {
                            console.error('[\u001b[1;31mERROR\u001b[0m] :', error);
                            reject(error);
                        } else {
                            resolve(row);
                        }
                    });
                });

                if (row.length <= 0) {
                    // No row found
                    console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
                    return res.status(404).json({ message: "Row not found!" });
                }

                // Return result
                return res.status(200).json({ history: row[0].history })

            } catch (error) {
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                return res.status(500).json({ error: error })
            }
        })

        // Save history
        app.post('/chat/save-history', async (req, res) => {
            try {
                // Log that route worked
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/save-history" worked')

                // Get ID from request body
                let { id, prompt, gpt_response } = req.body
                if (!id) id = req.cookies['CUC-ID']
                if (!id) {
                    console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
                    return res.status(404).json({ error: 'No ID / CUC-ID found' })
                }

                // Find a row by ID
                const row = await new Promise((resolve, reject) => {
                    db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                        if (error) {
                            console.error('[\u001b[1;31mERROR\u001b[0m] :', error);
                            reject(error);
                        } else {
                            resolve(row);
                        }
                    });
                });

                if (row.length <= 0) {
                    // No row found
                    console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
                    return res.status(404).json({ message: "Row not found!" });
                }

                // Get newHistory and push existing prompt to it
                const newHistory = JSON.parse(row[0].history)

                // Save a prompt to history
                newHistory.push({
                    role: 'user',
                    content: prompt
                })

                // Save a response of chatGPT to history
                newHistory.push({
                    role: 'assistant',
                    content: gpt_response
                })

                // Insert updated history to DB
                db.run('UPDATE conversations SET history = ? WHERE id = ?', [JSON.stringify(newHistory), id], (err) => {
                    if (err) console.error('[\u001b[1;33mWARN\u001b[0m] :', err)
                })

                // Return result
                return res.status(200).json({ message: 'History saved!' })

            } catch (error) {
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
                return res.status(500).json({ error: error })
            }
        })

        // Get configurable styles
        app.get('/config/styles', async (req, res) => {
            res.json(config_style)
        })

        // Get config
        app.get('/config/all', async (req, res) => {
            res.json(config)
        })

        // Get configurable styles
        app.get('/chat/interface', async (req, res) => {
            res.render(path.resolve(__dirname, '..', 'interfaces', 'chat_interface'))
        })

        server.listen(process.env.API_PORT | 3000, () => {
            console.log('[\u001b[1;36mINFO\u001b[0m] : API Server is ON')
        })
    }

}

module.exports = {
    apiApplication
}