// Configs
require('dotenv').config();
const config_style = require('../../config.styles');
const config_lang = require('../../config.language');
const config = require('../../config')

// Basics
const express = require('express');
const router = express.Router();


router.get('/all', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/config/all" worked')

        // Set Header & Send Response
        res.setHeader({ 'Content-Type': 'text/javascript' })
        res.json(config)

    } catch (error) {

        // Display caught error
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: error })
    }
})

router.get('/language', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/config/language" worked')

        // Set Header & Send Response
        res.setHeader({ 'Content-Type': 'text/javascript' })
        res.json(config_lang)
    } catch (error) {

        // Display caught error
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: error })
    }
})

router.get('/styles', async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs) console.log('[\u001b[1;36mINFO\u001b[0m] : Route "/config/styles" worked')

        // Set Header & Send Response
        res.setHeader({ 'Content-Type': 'text/javascript' })
        res.json(config_style)
    } catch (error) {

        // Display caught error
        console.error('[\u001b[1;31mERROR\u001b[0m] :', error)
        return res.status(500).json({ error: error })
    }
})

module.exports = router