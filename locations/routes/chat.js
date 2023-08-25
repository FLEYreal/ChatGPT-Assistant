// Configs
require('dotenv').config();
const config = require('../../config');
const config_style = require('../../config.styles');

// Basics
const path = require('path');
const express = require('express');
const router = express.Router();

// Libraries
const crypto = require('crypto');

// Database SQLite
const sqlite3 = require('sqlite3').verbose()

// Connect to SQLite
const db = new sqlite3.Database('./conversations.db', sqlite3.OPEN_READWRITE, (error) => {
    if (error) console.error('[\u001b[1;31mERROR\u001b[0m] :', error.message)
})

// Utils
const { transformPrompts } = require('../../utils/transform_prompts');
const axios = require('axios');

// Create Chat ID and save to db. Database will store all the history of conversation
router.get('/create', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/create" worked')

        // Get unique ID
        const id = crypto.randomUUID()

        // Insert new data to database
        db.run('INSERT INTO conversations(id, history) VALUES (?, ?)', [id, JSON.stringify(transformPrompts('system', config.instructions))], (error) => {
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
router.post('/conversation', async (req, res) => {

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
    await axios.put(`${process.env.API_IP}:${process.env.API_PORT}/chat/save-history`, {
        id: id,
        prompt: prompt,
        gpt_response: gpt_response.response
    })
        .catch(err => res.json({ error: err }))

    // Return result
    return res.status(200).json({
        history: history,
        prompt: prompt,
        gpt_response: gpt_response.response
    })

})

// Delete a conversation from DB
router.post('/delete', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/create" worked')

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
router.post('/get-history', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/get-history" worked')

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
router.put('/save-history', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/save-history" worked')

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
router.get('/interface', async (req, res) => {

    try {

        // Get ID from request body
        let { id, lang } = req.query
        if (!id && req.cookies['CUC-ID']) id = req.cookies['CUC-ID']
        if (!id && !req.cookies['CUC-ID']) {
            const result = await axios.get(`${process.env.API_IP}:${process.env.API_PORT}/chat/create`)
            id = result.data.id
            res.cookie('CUC-ID', id)
        }

        if (!lang) lang = 'en'

        // Get History of the conversation by ID
        let history = await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`, {
            id: id
        })
            .then(res => res.data.history)
            .catch(err => res.json({ error: err }))

        // Define GPT version display name
        let display_gpt_name;

        if (config.gpt_version.startsWith('gpt-3.5-turbo')) display_gpt_name = 'ChatGPT 3.5 (Fastest Model)'
        else if (config.gpt_version.startsWith('gpt-4')) display_gpt_name = 'ChatGPT 4 (Most Advanced Model)'
        else display_gpt_name = 'ChatGPT 3 (Basic Model)'

        // Send file
        res.render(path.resolve(__dirname, '..', '..', 'interfaces', 'chat_interface'), {
            conversation_history: history,
            config_style: config_style,
            custom_names: {
                user_name: config.user_name,
                short_user_name: config.short_user_name,

                gpt_name: config.gpt_name,
                short_gpt_name: config.short_gpt_name,
            },
            default_name: display_gpt_name
        })

    } catch (error) {
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: error })
    }
})

module.exports = router