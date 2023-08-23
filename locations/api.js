// Configs
require('dotenv').config()

// Basics
const express = require('express')
const app = express()
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

// OpenAI
const OpenAIApi = require('openai')
const openAI = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
})

// Database SQLite
let sql;
const sqlite3 = require('sqlite3').verbose()

// Utils
const { transformPrompts } = require('../utils/transform_prompts')

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

        // API Routes:

        // Create message and send it in response
        app.post('/message/create', async (req, res) => {
            try {
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/message/create" worked')

                const response = await openAI.chat.completions.create({
                    model: config.gpt_version,
                    messages: req.body.prompts || req.body.history,
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

        app.get('/chat/conversation', async (req, res) => {
            // Chat between user and chatGPT with API
        })

        // Delete a conversation from DB
        app.delete('/chat/delete', async (req, res) => {
            try {
                // Log that route worked
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/create" worked')

                // Get ID from request body
                let { id } = req.body
                if(!id) id = req.cookies['CUC-ID']

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

        app.post('/chat/get-history', async (req, res) => {
            try {
                // Log that route worked
                console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/get-history" worked')

                // Get ID from request body
                let { id } = req.body
                if(!id) id = req.cookies['CUC-ID']

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

        app.get('/chat/interface', async (req, res) => {
            // actual HTML interface for conversaytions
        })


        app.listen(process.env.API_PORT | 3000, () => {
            console.log('[\u001b[1;36mINFO\u001b[0m] : API Server is ON')
        })
    }

}

module.exports = {
    apiApplication
}