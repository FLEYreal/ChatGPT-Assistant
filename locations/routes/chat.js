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
        if (config.display_info_logs) logging.info('Route "/chat/create" worked');

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
        const result = await new Promise((resolve) => {
            // Insert new data to database
            db.run(
                "INSERT INTO conversations(id, history) VALUES (?, ?)",
                [id, JSON.stringify([])],
                (error) => {
                    if (error) {
                        logging.error(error);

                        // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                        // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                        resolve({
                            error: {
                                code: 500,
                                message: error,
                                display: locale.errors.failed_conversation,
                            },
                        });
                    } else resolve();
                },
            );
        });

        // If error happened while working with db
        if (result && result.error) {
            return res.json({
                ...result.error,
            });
        }

        // Set id in cookie
        res.cookie("CUC-ID", id); // CUC-ID stands for ChatGPT-Unique-Conversation-ID

        // Return result
        return res.status(200).json({ id: id });
    } catch (error) {
        // Display error to console and return it as response
        logging.error(error);
        return res.status(500).json({ error: locale.errors.unexpected_error });
    }
});

// Delete a conversation from DB
router.post("/delete", check_lang, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs)
            logging.info('Route "/chat/create" worked');

        // Get ID from request body
        let { id } = req.body;

        // If id isn't defined from request's body, get it from cookies
        if (!id) id = req.cookies["CUC-ID"];

        // If ID still couldn't be created
        if (!id) {
            logging.log("No ID / CUC-ID found");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.id_not_found,
                },
            });
        }

        // Save result of the promise to "result" in the case of an error
        const row = await new Promise((resolve) => {
            // Find a row by ID
            db.all(
                "SELECT * FROM conversations WHERE id = ?",
                [id],
                (error, row) => {
                    if (error) {
                        logging.error(error);

                        // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                        // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                        resolve({
                            error: {
                                code: 500,
                                message: error,
                                display: locale.errors.failed_to_find,
                            },
                        });
                    } else resolve(row);
                },
            );
        });

        // If Promise caught an error
        if (row.error) {
            return res.json({
                error: row.error,
            });
        }

        // If failed to find conversation in db
        else if (row.length <= 0) {
            // No row found
            logging.warn("Row not found!");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.failed_to_find,
                },
            });
        }

        // Promise didn't return a thing
        else if (!row) {
            logging.warn("Row not found!");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.promise_failed_to_find,
                },
            });
        }

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
    } catch (error) {
        // Display error to console and return it as response
        logging.error(error);
        return res.status(500).json({ error: locale.errors.unexpected_error });
    }
});

// Get conversation history by ID
router.post("/get-history", check_lang, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) logging.info('Route "/chat/get-history" worked');

        // Get ID from request body
        let { id } = req.body;

        // If id isn't defined from request's body, get it from cookies
        if (!id) id = req.cookies["CUC-ID"];

        // If ID still couldn't be created
        if (!id) {
            logging.error("No ID / CUC-ID found");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.id_not_found,
                },
            });
        }

        // Save result of the promise to "result" in the case of an error
        const row = await new Promise((resolve, reject) => {
            // Find a row by ID
            db.all(
                "SELECT * FROM conversations WHERE id = ?",
                [id],
                (error, row) => {
                    if (error) {
                        logging.error(error);

                        // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                        // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                        reject({
                            error: {
                                code: 500,
                                message: error,
                                display: locale.errors.failed_to_find,
                            },
                        });
                    } else {
                        resolve(row);
                    }
                },
            );
        });

        // If Promise caught an error
        if (row.error) {
            return res.json({
                error: row.error,
            });
        }

        // If there's no conversation in DB
        else if (row.length <= 0) {
            // No row found
            logging.warn("Row not found!");
            return res.json({
                error: {
                    message: locale.errors.row_not_found,
                },
            });
        }

        // Promise didn't return a thing
        else if (!row) {
            logging.warn("Row not found!");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.promise_failed_to_find,
                },
            });
        }

        const history = JSON.parse(row[0].history);

        // Return result
        return res.status(200).json({ history: JSON.stringify(history) });
    } catch (error) {
        // Display error to console and return it as response
        logging.error(error);
        return res.status(500).json({ error: locale.errors.unexpected_error });
    }
});

// Save history
router.put("/save-history", check_lang, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) logging.info('Route "/chat/save-history" worked',);

        // Get ID from request body
        let { id, prompt, gpt_response } = req.body;

        // If id isn't defined from request's body, get it from cookies
        if (!id) id = req.cookies["CUC-ID"];

        // If ID still couldn't be created
        if (!id) {
            logging.error("No ID / CUC-ID found");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.id_not_found,
                },
            });
        }

        // Save result of the promise to "result" in the case of an error
        const row = await new Promise((resolve) => {
            // Find a row by ID
            db.all(
                "SELECT * FROM conversations WHERE id = ?",
                [id],
                (error, row) => {
                    if (error) {
                        logging.error(error);

                        // Uses "resolve" instead of "reject", otherwise it's going to trigger "catch" and return error with
                        // no information provided to resolve. Also doesn't use status(500), it's triggering "catch" as well
                        resolve({
                            error: {
                                code: 500,
                                message: error,
                                display: locale.errors.failed_to_find,
                            },
                        });
                    } else {
                        resolve(row);
                    }
                },
            );
        });

        // If Promise caught an error
        if (row.error) {
            return res.json({
                error: row.error,
            });
        }

        // If there's no conversation in db
        else if (row.length <= 0) {
            // No row found
            logging.warn("Row not found!");
            return res.json({
                error: {
                    message: locale.errors.row_not_found,
                },
            });
        }

        // Promise didn't return a thing
        else if (!row) {
            logging.warn(" Row not found!");
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.promise_failed_to_find,
                },
            });
        }

        // Get newHistory and push existing prompt to it
        const newHistory = JSON.parse(row[0].history);

        // Save a prompt to history
        newHistory.push({
            role: "user",
            content: prompt,
        });

        // Save a response of chatGPT to history
        newHistory.push({
            role: "assistant",
            content: gpt_response,
        });

        // Insert updated history to DB
        db.run(
            "UPDATE conversations SET history = ? WHERE id = ?",
            [JSON.stringify(newHistory), id],
            (error) => {
                if (error) {
                    logging.warn(error);
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
    } catch (error) {
        // Display error to console and return it as response
        logging.error(error);
        return res.status(500).json({ error: locale.errors.unexpected_error });
    }
});

// Get configurable styles
router.get("/interface", check_lang, async (req, res) => {
    // Get object with all translations
    const locale = req.locale;

    try {
        // Log that route worked
        if (config.display_info_logs) logging.info('Route "/chat/interface" worked',);

        // Get ID from request body
        let { id } = req.body;

        // If id isn't defined from request's body, get it from cookies
        if (!id && req.cookies["CUC-ID"]) id = req.cookies["CUC-ID"];

        // If ID still couldn't be created
        if (!id && !req.cookies["CUC-ID"]) {
            const result = await axios
                .get(
                    `${process.env.API_IP}:${process.env.API_PORT}/chat/create`,
                )
                .catch((error) => error);

            // If chat couldn't be created or different error
            if (result.error) {
                return res.json({
                    error: {
                        code: 500,
                        message: result.error,
                        display: locale.errors.unexpected_error,
                    },
                });
            }

            // Save ID
            id = result.data.id;
            res.cookie("CUC-ID", id);
        }

        // Get History of the conversation by ID
        let history = await axios
            .post(
                `${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`,
                { id: id },
            )
            .then((res) => res.data.history)
            .catch((err) => err);

        // If couldn't get history or different error caught
        if (history.error) {
            // Return error to response
            return res.json({
                error: {
                    code: 500,
                    message: history.error,
                    display: locale.errors.unexpected_error,
                },
            });
        }

        // Define GPT version display name
        let display_gpt_name;

        if (config.gpt_version.startsWith("gpt-3.5-turbo"))
            display_gpt_name = `ChatGPT 3.5 (${locale.interface.gpt_fastest})`;
        else if (config.gpt_version.startsWith("gpt-4"))
            display_gpt_name = `ChatGPT 4 (${locale.interface.gpt_advanced})`;
        else display_gpt_name = `ChatGPT 3 (${locale.interface.gpt_basic})`;

        // Check if every variable that sends to interface is defined
        if (!history) {
            logging.error('History is not defined on "/chat/interface"',);
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.history_not_defined,
                },
            });
        } else if (!config_style) {
            logging.error('Style Config is not defined on "/chat/interface"',);
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.config_style_not_defined,
                },
            });
        } else if (!display_gpt_name) {
            logging.log('Display GPT Name is not defined on "/chat/interface"',);
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.display_gpt_name_not_defined,
                },
            });
        } else if (!process.env.API_IP) {
            logging.error('API\'s IP is not defined in ".env" file on "/chat/interface"',);
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.api_ip_not_defined,
                },
            });
        } else if (!process.env.API_PORT) {
            logging.error( 'API\'s PORT is not defined in ".env" file on "/chat/interface"',);
            return res.json({
                error: {
                    code: 404,
                    display: locale.errors.api_port_not_defined,
                },
            });
        } else if (
            config.user_name ||
            config.short_user_name ||
            config.gpt_name ||
            config.short_gpt_name
        ) {
            logging.warn("Custom names aren't defined in config!",);
        }

        // Send file
        res.render(
            path.resolve(__dirname, "..", "..", "interfaces", "chat_interface"),
            {
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
    } catch (error) {
        // Display error to console and return it as response
        logging.error(error);
        return res.status(500).json({ error: locale.errors.unexpected_error });
    }
});

export default router;
