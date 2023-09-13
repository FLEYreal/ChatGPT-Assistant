const config = require("./config");

// You can easily add your own languages with own signs!
module.exports = {
    // English language / Английский язык
    en: {
        // All interface's translations
        interface: {
            gpt_basic: "Basic Model",
            gpt_fastest: "Fastest Model",
            gpt_advanced: "Most Advanced Model",

            stop_generating: "Stop Generation",
            restart_conversation: "Restart Conversation",
            send_message: "Send Message...",
            embedded: "Embedded",
            chat_by: "chat by",
        },

        // All error's translations
        errors: {
            id_not_created: "Conversation ID couldn't be created!",
            id_not_found: "Coversation ID not found!",
            failed_to_find: "Failed to find conversation!",
            failed_conversation: "Failed to create new conversation!",
            failed_clear_conversation: "Failed to clear conversation!",
            failed_to_get_history: "Failed to get history of conversation!",
            failed_to_load_chunk: `Failed to load chunk of the response! Try later or contact support on ${config.contact_email}`,
            failed_to_save: `Failed to save conversation history! If you think this error is important, contact us on ${config.contact_email}`,
            unexpected_error: `Unexpected Error happened! If you believe it\'s an important error, contact us on: "${config.contact_email}". If you\'re owner, check console to see an error`,
            promise_failed_to_find: `Promise didn\'t return row! Contact us if you think this error is important! Email: ${config.contact_email}`,
            row_not_found: "Row not found!",
            cant_stop: `Can't stop generating response!`,

            history_not_defined: `History is not defined! Try later or contact support on ${config.contact_email}`,
            config_style_not_defined: `Style Config is not defined! Try later or contact support on ${config.contact_email}`,
            display_gpt_name_not_defined: `Name of chatGPT is not defined! Try later or contact support on ${config.contact_email}`,
            api_ip_not_defined: `IP of API is not defined! Try later or contact support on ${config.contact_email}`,
            api_port_not_defined: `PORT of API is not defined! Try later or contact support on ${config.contact_email}`,
        },

        messages: {
            row_deleted: "Row successfully deleted",
            history_saved: "History saved!",
        },
    },

    // Russian language / Русский язык
    ru: {
        // Все переводы интерфейса
        interface: {
            gpt_basic: "Базовая Модель",
            gpt_fastest: "Самая Быстрая Модель",
            gpt_advanced: "Самая Продвинутая Модель",

            stop_generating: "Остановить Генерацию",
            restart_conversation: "Перезагрузить Диалог",
            send_message: "Отправить Сообщение...",
            embedded: "Встроенный",
            chat_by: "чат от",
        },

        // Все переводы ошибок
        errors: {
            id_not_created: "Не получилось создать ID диалога!",
            id_not_found: "ID диалога не найдено!",
            failed_to_find: "Не удалось найти нужный диалог!",
            failed_conversation: "Не удалось создать новый диалог!",
            failed_clear_conversation: "Не удалось очистить диалог!",
            failed_to_get_history: "Не удалось получить историю диалога!",
            failed_to_load_chunk: `Не удалось загрузить фрагмент ответа! Попробуйте позже или свяжитесь с нами: ${config.contact_email}`,
            failed_to_save: `Не удалось сохранить историю диалога! Если вы считаете, что ошибка имеет значение, свяжитесь с нами: ${config.contact_email}`,
            unexpected_error: `Неизвестная ошибка! Если вы считаете, что важная ошибка, свяжитесь с нами тут: "${config.contact_email}". Если вы владелец, то посмотрите в консоль, чтобы увидеть подробную ошибку!`,
            promise_failed_to_find: `Промис не вернул никаких строк! Свяжитесь с нами, если считаете ошибку важной! Почта: ${config.contact_email}`,
            row_not_found: "Строка не найдена!",
            cant_stop: `Неполучается остановить генерацию ответа!`,

            history_not_defined: `История диалога не найдена! Попробуйте позже или свяжитесь с нами: ${config.contact_email}`,
            config_style_not_defined: `Конфиг стилей не найден! Попробуйте позже или свяжитесь с нами: ${config.contact_email}`,
            display_gpt_name_not_defined: `Имя для chatGPT не найдено! Попробуйте позже или свяжитесь с нами: ${config.contact_email}`,
            api_ip_not_defined: `IP для API не найдено! Попробуйте позже или свяжитесь с нами: ${config.contact_email}`,
            api_port_not_defined: `PORT для API не найден! Попробуйте позже или свяжитесь с нами: ${config.contact_email}`,
        },

        messages: {
            row_deleted: "Строка была успешно удалена",
            history_saved: "История диалога сохранена!",
        },
    },
};
