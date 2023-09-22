// Configs
import config_lang from "./config.language.js";

// Function to check lang query for endpoints [MIDDLEWARE]
function check_lang(req, res, next) {
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
}

// Check conversation id for endpoints [MIDDLEWARE]
function check_id(req, res, next) {}

// Export middlewares
export { check_id, check_lang };
