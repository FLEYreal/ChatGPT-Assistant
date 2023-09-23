// Utils
import axios from "axios";

// Libraries
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import path from "path";

// Database SQLite
import sqlite3 from "sqlite3";

// Utils
import createUUID from "../../utils/uuid.js";
import { marked } from 'marked';
import { logging } from "../../utils/logging.js";
import { check_interface_variables } from '../../utils/check.js'

// Middlewares
import { check_lang, check_id } from "../../middlewares.js";

// Configs
dotenv.config();
import config from "../../config.js";
import config_style from "../../config.styles.js";

// Basics
const router = express.Router();

// Connect to SQLite
const db = new sqlite3.Database(
    "./conversations.db",
    sqlite3.OPEN_READWRITE,
    (error) => {
        if (error) logging.error(error.message);
    },
);

// File system
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Chat ID and save to db. Database will store all the history of conversation
router.get("/create", check_lang, async (req, res) => {

    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) logging.info(`Route /chat/"${req.url}" worked`);

        // Get unique ID
        const id = crypto.randomUUID() || createUUID();

        // If ID couldn't be created
        if (!id) {
            return res.json({
                error: {
                    code: 500,
                    display: locale.errors.id_not_created,
                },
            });
        }

        // Save result of the promise to "result" in the case of an error
        await new Promise((resolve, reject) => {
            // Insert new data to database
            db.run(
                "INSERT INTO conversations(id, history) VALUES (?, ?)",
                [id, JSON.stringify([])],
                (error) => {
                    if (error) reject(error);
                    else resolve();
                },
            );
        });

        // Set id in cookie
        res.cookie("CUC-ID", id); // CUC-ID stands for ChatGPT-Unique-Conversation-ID

        // Return result
        return res.status(200).json({ id: id });

    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                display: locale.errors.unexpected_error,
                message: err
            }
        });

    }
});

// Delete a conversation from DB
router.post("/delete", check_lang, check_id, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs)
            logging.info(`Route /chat/"${req.url}" worked`);

        const id = req.id

        // Delete ID from database
        db.run("DELETE FROM conversations WHERE id = ?", [id], (error) => {
            if (error) {
                // Display an error
                logging.error("error");

                // Return an error
                return res.json({
                    error: {
                        code: 500,
                        message: error,
                        display: locale.errors.failed_clear_conversation,
                    },
                });

            } else {

                // Clear cookie
                res.clearCookie("CUC-ID");

                // Return success
                return res
                    .status(200)
                    .json({ message: locale.messages.row_deleted });
            }
        });
    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                error: locale.errors.unexpected_error,
                message: err
            }
        });

    }
});

// Get conversation history by ID
router.post("/get-history", check_lang, check_id, async (req, res) => {

    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) 
            logging.info(`Route /chat/"${req.url}" worked`);

        const history = req.history;

        // Return result
        return res.status(200).json({ history: JSON.stringify(history) });

    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                display: locale.errors.unexpected_error,
                message: err
            }
        });

    }
});

// Save history
router.put("/save-history", check_lang, check_id, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) 
            logging.info(`Route /chat/"${req.url}" worked`);

        let { prompt, gpt_response } = req.body;
        const id = req.id
        const history = req.history

        if (!prompt) return res.json({
            error: {
                code: 400,
                display: locale.errors.prompt_field_not_found
            }
        })

        else if (!gpt_response) return res.json({
            error: {
                code: 400,
                display: locale.errors.gpt_response_field_not_found
            }
        })

        // Save a prompt to history
        history.push({
            role: "user",
            content: prompt,
        });

        // Save a response of chatGPT to history
        history.push({
            role: "assistant",
            content: gpt_response,
        });

        // Insert updated history to DB
        db.run(
            "UPDATE conversations SET history = ? WHERE id = ?",
            [JSON.stringify(history), id],
            (error) => {
                if (error) {
                    logging.error(error);
                    return res.json({
                        error: {
                            code: 500,
                            message: error,
                            display: locale.errors.failed_to_save,
                        },
                    });
                } else {
                    // Return result
                    return res
                        .status(200)
                        .json({ message: locale.messages.history_saved });
                }
            },
        );
    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                display: locale.errors.unexpected_error,
                message: err
            }
        });

    }
});

// Get configurable styles
router.get("/interface", check_lang, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) 
            logging.info(`Route /chat/"${req.url}" worked`);

        // Get ID from request body
        let { id } = req.body;

        // If id isn't defined from request's body, get it from cookies
        if (!id && req.cookies["CUC-ID"]) id = req.cookies["CUC-ID"];

        // If ID still couldn't be created
        if (!id && !req.cookies["CUC-ID"]) {
            const result = await axios
                .get(`${process.env.API_IP}:${process.env.API_PORT}/chat/create`)
                    .then(res => res.data)
                    .catch(error => logging.error(error));

            // If chat couldn't be created or different error
            if (result.error) {
                return res.json({
                    error: {
                        code: result.error.code,
                        message: result.error.message,
                        display: result.error.display,
                    },
                });
            }

            // Save ID
            id = result.id;
            res.cookie("CUC-ID", id);
        }

        // Get History of the conversation by ID
        let history = await axios
            .post(
                `${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`,
                { id: id },
            )
            .then((res) => res.data)
            .catch(error => logging.error(error));

        // If couldn't get history or different error caught
        if (history.error) {

            // Return error to response
            return res.json({
                error: {
                    code: history.error.code,
                    message: history.error.message,
                    display: history.error.display,
                },
            });

        }

        // Define GPT version display name
        let display_gpt_name = '';

        if (config.gpt_version.startsWith("gpt-3.5-turbo")) display_gpt_name = `ChatGPT 3.5 (${locale.interface.gpt_fastest})`;
        else if (config.gpt_version.startsWith("gpt-4")) display_gpt_name = `ChatGPT 4 (${locale.interface.gpt_advanced})`;
        else display_gpt_name = `ChatGPT 3 (${locale.interface.gpt_basic})`;

        // Check if every variable that sends to interface is defined
        const isCheckSucceed = check_interface_variables({
            history,
            config_style,
            display_gpt_name,
            config
        }, locale)

        // Check is everything is okay
        if (isCheckSucceed.error) return res.json(isCheckSucceed.error)
        if (!isCheckSucceed.success) {
            return res.json({
                error: {
                    code: 500,
                    display: locale.errors.unexpected_error
                }
            });
        }

        // Send file
        res.render(
            path.resolve(__dirname, "..", "..", "interfaces", "chat_interface"),
            {
                // History of the conversation with GPT
                conversation_history: history.history,

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
                    port: process.env.API_PORT,
                },

                // All text in object, translatable to different languages
                locale: locale,

                // What language is it: 'ru', 'en', 'ja', 'tr', 'kr' and ...etc
                lang: req.lang,

                // Function to transform text into markdown
                marked
            },
        );
    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);
        return res.json({
            error: {
                code: 500,
                display: locale.errors.unexpected_error,
                message: err
            }
        });

    }
});

export default router;