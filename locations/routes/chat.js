// Configs
require('dotenv').config();
const config = require('../../config');
const config_style = require('../../config.styles');

// Basics
const path = require('path');
const express = require('express');
const router = express.Router();

// Utils
const createUUID = require('../../utils/uuid')

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
        const id = crypto.randomUUID() || createUUID()

        // If ID couldn't be created
        if (!id) {
            return res.json({
                error: {
                    code: 500,
                    display: "Conversation ID couldn\'t be created!"
                }
            })
        }

        // Load instructions to chatGPT from config
        const instructions = JSON.stringify(transformPrompts('system', config.instructions)) || []

        // Save result of the promise to "result" in the case of an error
        const result = await new Promise((resolve) => {

            // Insert new data to database
            db.run('INSERT INTO conversations(id, history) VALUES (?, ?)', [id, instructions], (error) => {
                if (error) {
                    console.error('[\u001b[1;31mERROR\u001b[0m] :', error)

                    // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                    // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                    resolve({
                        error: {
                            code: 500,
                            message: error,
                            display: 'Failed to create new conversation!'
                        }
                    })
                } else resolve()
            })
        })

        // If error happened while working with db
        if (result && result.error) {
            return res.json({
                ...result.error
            })
        }

        // Set id in cookie
        res.cookie('CUC-ID', id) // CUC-ID stands for ChatGPT-Unique-Conversation-ID

        // Return result
        return res.status(200).json({ id: id })

    } catch (error) {

        // Display error to console and return it as response
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: `Unexpected Error happened! If you believe it\'s a mistake, contact us on: "${config.contact_email}". If you\'re owner, check console to see an error` })

    }
})

// Delete a conversation from DB
router.post('/delete', async (req, res) => {
    try {

        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/create" worked')

        // Get ID from request body
        let { id } = req.body

        // If id isn't defined from request's body, get it from cookies
        if (!id) id = req.cookies['CUC-ID']

        // If ID still couldn't be created
        if (!id) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
            return res.json({
                error: {
                    code: 404,
                    display: 'Coversation ID not found'
                }
            })
        }

        // Save result of the promise to "result" in the case of an error
        const row = await new Promise((resolve) => {

            // Find a row by ID
            db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                if (error) {
                    console.error('[\u001b[1;31mERROR\u001b[0m] :', error);

                    // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                    // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                    resolve({
                        error: {
                            code: 500,
                            message: error,
                            display: 'Failed to find conversation!'
                        }
                    });

                } else resolve(row);
            });

        });

        // If Promise caught an error
        if (row.error) {
            return res.json({
                error: row.error
            })
        }

        // If failed to find conversation in db
        else if (row.length <= 0) {

            // No row found
            console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
            return res.json({
                error: {
                    code: 404,
                    display: "Failed to find conversation! Conversation not found!"
                }
            });
        }

        // Promise didn't return a thing
        else if (!row) {

            console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
            return res.json({
                error: {
                    code: 404,
                    display: `Promise didn\'t return row! Contact us if you think this error is important! Email: ${config.contact_email}`
                }
            });

        }

        // Delete ID from database
        db.run('DELETE FROM conversations WHERE id = ?', [id], (error) => {
            if (error) {

                // Display an error
                console.error('[\u001b[1;31mERROR\u001b[0m] :', error)

                // Return an error
                return res.json({
                    error: {
                        code: 500,
                        message: error,
                        display: 'Failed to clear conversation!'
                    }
                })
            } else {

                // Clear cookie
                res.clearCookie('CUC-ID');

                // Return success
                return res.status(200).json({ message: 'row successfully deleted' })
            }
        })

    } catch (error) {

        // Display error to console and return it as response
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: `Unexpected Error happened! If you believe it\'s a mistake, contact us on: "${config.contact_email}". If you\'re owner, check console to see an error` })

    }
})

// Get conversation history by ID
router.post('/get-history', async (req, res) => {
    try {

        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/get-history" worked')

        // Get ID from request body
        let { id } = req.body

        // If id isn't defined from request's body, get it from cookies
        if (!id) id = req.cookies['CUC-ID']

        // If ID still couldn't be created
        if (!id) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
            return res.json({
                error: {
                    code: 404,
                    display: 'Coversation ID not found'
                }
            })
        }

        // Save result of the promise to "result" in the case of an error
        const row = await new Promise((resolve, reject) => {

            // Find a row by ID
            db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                if (error) {
                    console.error('[\u001b[1;31mERROR\u001b[0m] :', error);

                    // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                    // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                    reject({
                        error: {
                            code: 500,
                            message: error,
                            display: 'Failed to find conversation!'
                        }
                    });
                } else {
                    resolve(row);
                }
            });
        });

        // If Promise caught an error
        if (row.error) {

            return res.json({
                error: row.error
            })

        }

        // If there's no conversation in DB
        else if (row.length <= 0) {

            // No row found
            console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
            return res.status(404).json({ message: "Row not found!" });

        }

        // Promise didn't return a thing
        else if (!row) {

            console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
            return res.json({
                error: {
                    code: 404,
                    display: `Promise didn\'t return row! Contact us if you think this error is important! Email: ${config.contact_email}`
                }
            });

        }

        // Return result
        return res.status(200).json({ history: row[0].history })

    } catch (error) {

        // Display error to console and return it as response
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

        // If id isn't defined from request's body, get it from cookies
        if (!id) id = req.cookies['CUC-ID']

        // If ID still couldn't be created
        if (!id) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : No ID / CUC-ID found')
            return res.json({
                error: {
                    code: 404,
                    display: 'Coversation ID not found'
                }
            })
        }

        // Save result of the promise to "result" in the case of an error
        const row = await new Promise((resolve) => {

            // Find a row by ID
            db.all('SELECT * FROM conversations WHERE id = ?', [id], (error, row) => {
                if (error) {
                    console.error('[\u001b[1;31mERROR\u001b[0m] :', error);

                    // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                    // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                    resolve({
                        error: {
                            code: 500,
                            message: error,
                            display: 'Failed to find conversation!'
                        }
                    });
                } else {
                    resolve(row);
                }
            });
        });

        // If Promise caught an error
        if (row.error) {

            return res.json({
                error: row.error
            })

        }

        // If there's no conversation in db
        else if (row.length <= 0) {

            // No row found
            console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
            return res.status(404).json({ message: "Row not found!" });

        }

        // Promise didn't return a thing
        else if (!row) {

            console.error('[\u001b[1;33mWARN\u001b[0m] : Row not found!');
            return res.json({
                error: {
                    code: 404,
                    display: `Promise didn\'t return row! Contact us if you think this error is important! Email: ${config.contact_email}`
                }
            });

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
        db.run('UPDATE conversations SET history = ? WHERE id = ?', [JSON.stringify(newHistory), id], (error) => {
            if (error) {
                console.error('[\u001b[1;33mWARN\u001b[0m] :', error)
                return res.json({
                    error: {
                        code: 500,
                        message: error,
                        display: `Failed to save conversation history! If you think this error is important, contact us on ${config.contact_email}`
                    }
                })
            } else {
                // Return result
                return res.status(200).json({ message: 'History saved!' })
            }
        })

    } catch (error) {

        // Display error to console and return it as response
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: `Unexpected Error happened! If you believe it\'s a mistake, contact us on: "${config.contact_email}". If you\'re owner, check console to see an error` })

    }
})

// Get configurable styles
router.get('/interface', async (req, res) => {

    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/chat/interface" worked')

        // Get ID from request body
        let { id, lang } = req.query

        // If id isn't defined from request's body, get it from cookies
        if (!id && req.cookies['CUC-ID']) id = req.cookies['CUC-ID']

        // If ID still couldn't be created
        if (!id && !req.cookies['CUC-ID']) {
            const result = await axios.get(`${process.env.API_IP}:${process.env.API_PORT}/chat/create`)
                .catch(error => error)

            // If chat couldn't be created or different error
            if (result.error) {
                return res.json({
                    error: {
                        code: 500,
                        message: result.error,
                        display: `Unexpected error happened! Try later or contact support on ${config.contact_email}`,
                    }
                })
            }

            // Save ID
            id = result.data.id
            res.cookie('CUC-ID', id)
        }

        // Setup default language if not found
        if (!lang) lang = 'en'

        // Get History of the conversation by ID
        let history = await axios.post(`${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`, {
            id: id
        })
            .then(res => res.data.history)
            .catch(err => err)

        // If couldn't get history or different error caught
        if (history.error) {

            // Return error to response
            return res.json({
                error: {
                    code: 500,
                    message: history.error,
                    display: `Unexpected error happened! Try later or contact support on ${config.contact_email}`,
                }
            })

        }

        // Define GPT version display name
        let display_gpt_name;

        if (config.gpt_version.startsWith('gpt-3.5-turbo')) display_gpt_name = 'ChatGPT 3.5 (Fastest Model)'
        else if (config.gpt_version.startsWith('gpt-4')) display_gpt_name = 'ChatGPT 4 (Most Advanced Model)'
        else display_gpt_name = 'ChatGPT 3 (Basic Model)'

        // Check if every variable that sends to interface is defined
        if(!history) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : History is not defined on \"/chat/interface\"')
            return res.json({ error: {
                    code: 404,
                    display: `History is not defined! Try later or contact support on ${config.contact_email}`,
            }})
        }
        
        else if(!config_style) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : Style Config is not defined on \"/chat/interface\"')
            return res.json({ error: {
                    code: 404,
                    display: `Style Config is not defined! Try later or contact support on ${config.contact_email}`,
            }})
        }

        else if(!display_gpt_name) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : Display GPT Name is not defined on \"/chat/interface\"')
            return res.json({ error: {
                    code: 404,
                    display: `Name of chatGPT is not defined! Try later or contact support on ${config.contact_email}`,
            }})
        }

        else if(!process.env.API_IP) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : API\'s IP is not defined in \".env\" file on \"/chat/interface\"')
            return res.json({ error: {
                    code: 404,
                    display: `IP of API is not defined! Try later or contact support on ${config.contact_email}`,
            }})
        }

        else if(!process.env.API_PORT) {
            console.log('[\u001b[1;31mERROR\u001b[0m] : API\'s PORT is not defined in \".env\" file on \"/chat/interface\"')
            return res.json({ error: {
                    code: 404,
                    display: `PORT of API is not defined! Try later or contact support on ${config.contact_email}`,
            }})
        }

        else if(config.user_name || config.short_user_name || config.gpt_name || config.short_gpt_name) {
            console.log('[\u001b[1;33mWARN\u001b[0m] : Custom names aren\'t defined in config!');
        }

        // Send file
        res.render(path.resolve(__dirname, '..', '..', 'interfaces', 'chat_interface'), {
            // History of the conversation with GPT
            conversation_history: history,

            // Styles configurable in "config.styles.js"
            config_style: config_style,

            // Custom names taken from "config.js", lets users setup their own names for User and ChatGPT
            custom_names: {

                // Full names
                user_name: config.user_name,
                short_user_name: config.short_user_name,

                // Short names
                gpt_name: config.gpt_name,
                short_gpt_name: config.short_gpt_name,
            },

            // Default name for Header, defined by version of GPT from "config.js"
            default_name: display_gpt_name,

            // Data about IP and PORT for frontend to send requests if needed
            backend: {
                ip: process.env.API_IP,
                port: process.env.API_PORT
            }
        })

    } catch (error) {

        // Display error to console and return it as response
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: `Unexpected Error happened! If you believe it\'s a mistake, contact us on: "${config.contact_email}". If you\'re owner, check console to see an error` })

    }
})

module.exports = router