// Basics
import { createServer } from "http";
import path from "path";

// Libraries
import dotenv from "dotenv";
import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";

// Configs
import config_lang from "../config.language.js";

// Routes
import configRoute from "./routes/config.js";
import chatRoute from "./routes/chat.js";

// Utils
import sqlite3 from "sqlite3";
import { getStreamingGPTResponse } from "../utils/ask.js";
import { transformPrompts } from "../utils/transform_prompts.js";
import { logging } from "../utils/logging.js";
import { check_endpoint } from '../middlewares.js'

// File system
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configs
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// Database SQLite
sqlite3.verbose();

function apiApplication(config) {

    // Checks if it's off in config
    if (!config.locations.api) {
        return;
    } else if (config.locations.console) {
        logging.error('API cannot work when Console Application is on!')
        return;
    } else {
        // Connect to SQLite
        const db = new sqlite3.Database(
            "./conversations.db",
            sqlite3.OPEN_READWRITE,
            (error) => {
                if (error)
                    logging.error(error.message)
            },
        );

        // SQL commands to run, create table & delete everything if allowed
        const create_table = "CREATE TABLE IF NOT EXISTS conversations( id CHAR(36) PRIMARY KEY, history JSON DEFAULT [] )";
        const clean_history = "DELETE FROM conversations"

        // Run sql commands, create table & delete everything if allowed
        db.run(create_table);
        if(config.reload_history_cleanup) db.run(clean_history)

        // Middlewares
        app.use(express.json());
        app.use(cookieParser());
        app.use(cors());
        app.use(express.static("public"));
        app.use(check_endpoint)

        // Setup routes
        app.use("/chat", chatRoute);
        app.use("/config", configRoute);

        // Setup EJS template engine
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "..", "interfaces"));

        // Socket events
        let connections = [];
        io.sockets.on("connection", (socket) => {
            // Display log when user is connected to the interface
            if (config.display_info_logs) logging.info("User connected");

            // Add connection to the array
            connections.push(socket);

            // When user disconnected
            socket.on("disconnect", () => {
                // Delete from the array + log to console
                connections.splice(connections.indexOf(socket), 1);
                if (config.display_info_logs) logging.info("Used disconnected")
            });

            // When prompt to chatGPT is sent
            socket.on("message_sent", async (data) => {
                try {
                    // Get ID and language from data
                    let { lang } = data;

                    // If language wasn't found
                    if (!lang) lang = "en";

                    // If selected language doesn't exist in config.language.js
                    else if (!config_lang[lang]) lang = "en";

                    // Get object with all translations
                    const locale = config_lang[lang];

                    // create new AbortController
                    const controller = new AbortController();

                    // save controller in the context of conversation
                    socket.controller = controller;

                    // Get all variables
                    let { value, id } = data;

                    // If id is undefined
                    if (!id) {
                        logging.error("No ID / CUC-ID found")
                        socket.emit("err", {
                            code: 404,
                            display: locale.errors.id_not_found
                        });
                    }

                    // Get History of the conversation by ID
                    let history = await axios
                        .post(
                            `${process.env.API_IP}:${process.env.API_PORT}/chat/get-history`,
                            { id: id },
                        )
                        .then(res => res.data)
                        .catch(error => {
                            logging.error(error)
                            socket.emit("err", {
                                code: 500,
                                display: locale.errors.failed_to_get_history,
                                message: error,
                            });
                        });

                    if (history.error) {
                        socket.emit('err', {
                            code: history.error.code,
                            display: history.error.display,
                            message: history.error.message
                        })
                    }

                    // Get newHistory, parse past one
                    let parsedHistory = JSON.parse(history.history);
                    let newHistory = [
                        ...transformPrompts("system", config.instructions),
                        ...parsedHistory,
                    ];

                    // Push current prompt GPT
                    newHistory.push({
                        role: "user",
                        content: value,
                    });

                    // Make a POST request to the OpenAI API to get chat completions
                    const gpt = getStreamingGPTResponse(
                        // 1ST param is a history of conversation
                        newHistory,

                        // 2ND param is controller that let you to stop generating response if needed
                        controller,

                        // 3RD param is a language, 'ru', 'en' or else
                        lang,

                        // 4TH param is callback function that works as chunk is received
                        async (chunk, response, isDone) => {
                            if (!isDone) socket.emit("chunk", { content: chunk });
                            else if (isDone) {

                                // Notify frontend when message is completed
                                socket.emit("fully_received");

                                // Save a prompt and response to history
                                const isSaved = await axios
                                    .put(
                                        `${process.env.API_IP}:${process.env.API_PORT}/chat/save-history`,
                                        {
                                            id: id,
                                            prompt: value,
                                            gpt_response: response,
                                        },
                                    )
                                        .then(res => res.data)
                                        .catch(error => {
                                            logging.error(error)
                                            socket.emit("err", {
                                                code: 500,
                                                display: locale.errors.failed_to_save,
                                                message: err,
                                            });
                                        });

                                if (isSaved.error) socket.emit("err", {
                                    code: isSaved.error.code,
                                    display: isSaved.error.display,
                                    message: isSaved.error.message
                                })

                            }
                        },
                    );

                    if (gpt.error)
                        socket.emit("err", {
                            ...gpt.error,
                        });
                } catch (error) {
                    logging.error(`(Might Be just a Request Abort, Nothing to worry) ${error}`);
                }
            });

            // When button to restart conversation is clicked
            socket.on("restart_conversation", async (data) => {
                // Get ID and language from data
                let { lang } = data;

                // If language wasn't found
                if (!lang) lang = "en";

                // If selected language doesn't exist in config.language.js
                else if (!config_lang[lang]) lang = "en";

                // Get object with all translations
                const locale = config_lang[lang];

                // Delete conversation from DB
                if (config.delete_restarted_conversations) {
                    const isDeleted = await axios
                        .post(
                            `${process.env.API_IP}:${process.env.API_PORT}/chat/delete`,
                            {
                                id: data.id,
                            },
                        )
                            .then(res => res.data)
                            .catch(error => {
                                logging.error(error);
                                socket.emit("err", {
                                    code: 500,
                                    display: locale.errors.unexpected_error,
                                    message: error,
                                });
                            });
                    
                    if(isDeleted.error) {
                        socket.emit("err", {
                            code: isDeleted.error.code,
                            display: isDeleted.error.display,
                            message: isDeleted.error.message,
                        })
                    }
                }
            });

            // Stop generating response of GPT, aborts fetch from "message_sent" event
            socket.on("stop_generating", async (data) => {
                // Get ID and language from data
                let { lang } = data;

                // If language wasn't found
                if (!lang) lang = "en";
                // If selected language doesn't exist in config.language.js
                else if (!config_lang[lang]) lang = "en";

                // Get object with all translations
                const locale = config_lang[lang];

                try {
                    if (data.sendMessage === false && socket.controller) {
                        // Stop streaming GPT response
                        socket.controller.abort();
                    } else {
                        socket.emit("err", {
                            code: 400,
                            display: locale.errors.cant_stop
                        });
                    }
                } catch (err) {
                    socket.emit("err", {
                        code: 500,
                        display: locale.errors.unexpected_error,
                        message: err,
                    });
                    logging.error(err);
                }
            });
        });

        server.listen(process.env.API_PORT | 3000, () => {
            if (config.display_info_logs) logging.info("API Server is ON");
        });
    }
}

export { apiApplication };
