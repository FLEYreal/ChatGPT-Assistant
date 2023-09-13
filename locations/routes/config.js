// Configs
require("dotenv").config();
const config_style = require("../../config.styles");
const config_lang = require("../../config.language");
const config = require("../../config");

// Basics
const express = require("express");
const router = express.Router();

router.get("/language", async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs)
            console.log(
                '[\u001b[1;36mINFO\u001b[0m] : Route "/config/language" worked',
            );

        // Get language from query
        const { lang } = req.query;

        // If language wasn't found
        if (!lang) {
            return res.json({
                error: {
                    code: 400,
                    display: "Language is not defined!",
                },
            });
        }

        // If selected language doesn't exist in config.language.js
        else if (!config_lang[lang]) {
            return res.json({
                error: {
                    code: 400,
                    display:
                        "Language which you selected doesn't exist! Choose different one!",
                },
            });
        }

        // Send Response
        res.json(config_lang[lang]);
    } catch (error) {
        // Display caught error
        console.error("[\u001b[1;31mERROR\u001b[0m] :", error);
        return res.status(500).json({ error: error });
    }
});

router.get("/styles", async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs)
            console.log(
                '[\u001b[1;36mINFO\u001b[0m] : Route "/config/styles" worked',
            );

        // Send Response
        res.json(config_style);
    } catch (error) {
        // Display caught error
        console.error("[\u001b[1;31mERROR\u001b[0m] :", error);
        return res.status(500).json({ error: error });
    }
});

module.exports = router;
