import dotenv from "dotenv";
import express from "express";

import config from "../../config.js";
import config_lang from "../../config.language.js";
import config_style from "../../config.styles.js";

import { logging } from "../../utils/logging.js";

// Configs
dotenv.config();

// Basics
const router = express.Router();

router.get("/language", async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs)
            logging.info(`Route /config/"${req.url}" worked`);

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
    } catch (err) {
        // Display caught error
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                display: 'Unexpected error happened!',
                message: err
            }
        });
    }
});

router.get("/styles", async (req, res) => {
    try {
        // Log that route worked
        if (config.display_info_logs)
            logging.info(`Route /config/"${req.url}" worked`);

        // Send Response
        res.json(config_style);
    } catch (err) {
        // Display caught error
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                display: 'Unexpected error happened!',
                message: err
            }
        });
    }
});

export default router;
