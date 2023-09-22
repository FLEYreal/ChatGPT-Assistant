// Configs
import config_lang from "./config.language.js";

// List of Endpoints
import endpoints from './endpoints.json' assert { type: 'json' }

// Database SQLite
import sqlite3 from "sqlite3";

// Utils
import { logging } from "./utils/logging.js"

// Connect to SQLite
const db = new sqlite3.Database(
    "./conversations.db",
    sqlite3.OPEN_READWRITE,
    (error) => {
        if (error) logging.error(error.message);
    },
);

// Function to check lang query for endpoints [MIDDLEWARE]
function check_lang(req, res, next) {

    try {

        // Get language from query
        let { lang } = req.query;

        // If language wasn't found
        if (!lang) lang = "en";
        // If selected language doesn't exist in config.language.js
        else if (!config_lang[lang]) lang = "en";

        // Get object with all translations
        req.locale = config_lang[lang];
        req.lang = lang;

        next();

    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);
        return res.json({
            code: 500,
            display: 'Unexpected error, cannot define language!',
            message: err
        });

    }
}

// Check conversation id for endpoints [MIDDLEWARE]
async function check_id(req, res, next) {

    // Get object with all translations
    const locale = req.locale;

    try {

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
                    if (error) reject(error); 
                    else resolve(row);
                },
            );
        });

        // If there's no conversation in DB
        if (!row || row.length <= 0) {
            // No row found
            logging.error("Row not found!");
            return res.json({
                error: {
                    code: 404,
                    display: row ? locale.errors.row_not_found : locale.errors.promise_failed_to_find,
                },
            });
        }

        // Define potenrially useful variables
        req.id = id;
        req.history = JSON.parse(row[0].history);

        next();

    } catch (err) {

        // Display error to console and return it as response
        logging.error(err);

        return res.json({
            code: 500,
            display: locale.errors.unexpected_error,
            message: err
        });

    }

}

async function check_endpoint(req, res, next) {
    const params = {
        method: req.method,
        url: req.url
    }

    const result = endpoints.filter(i => i.method === params.method && i.url === params.url)

    result.length >= 1 ? next() : res.json({
        code: 405,
        display: 'Failed to find such endpoint!'
    })

    return;
}

// URL exists

// Export middlewares
export { check_lang, check_id, check_endpoint };
