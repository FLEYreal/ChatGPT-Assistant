// Configs
require('dotenv').config();
const config_style = require('../../config.styles');
const config_lang = require('../../config.language');

// Basics
const express = require('express');
const router = express.Router();


router.get('/all', async (req, res) => {
    res.setHeader({ 'Content-Type': 'text/javascript' })
    res.json(config)
})

router.get('/language', async (req, res) => {
    res.setHeader({ 'Content-Type': 'text/javascript' })
    res.json(config_lang)
})

router.get('/styles', async (req, res) => {
    res.setHeader({ 'Content-Type': 'text/javascript' })
    res.json(config_style)
})

module.exports = router