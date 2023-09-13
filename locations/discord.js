'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { logging } = require('../utils/logging');
const config = require('../config');

const commandMap = [
    {
        name: 'chat',
        description: 'Chat with GPT.',
        options: [
            {
                name: 'prompt',
                description: 'Your question or message to ChatGPT',
                type: 3,  // string
                required: true
            }
        ],
    }
];

function discordBot(config) {
    if (!config.locations.discord) return;

    if (config.locations.console) {
        logging.error('Discord Bot cannot work when Console Application is on!');
        return;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ],
        partials: [
            Partials.Channel,
        ]
    });

    client.once('ready', () => {
        if (config.display_info_logs) {
            logging.info('Discord Bot has logged in!');
        }
    });

    client.on('ready', async () => {
        const guildId = '1147478772921147432';

        for (const command of commandMap) {
            const _command = await client.guilds.cache.get(guildId)?.commands.create({
                name: command.name,
                description: command.description,
                options: command.options,
            });

            if (_command) logging.info(`"/${command.name}" registered!`);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;
        const { commandName, options } = interaction;

        if (commandName === 'chat') {
            const prompt = options.getString('prompt');
            const res = await chatWithGPT(prompt);
            interaction.reply(res);
        }
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot || message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return;
        const botId = client.user.id;

        if (!message.guild) {
            const prompt = message.content;
            const res = await chatWithGPT(prompt);
            message.author.send(res);
        }

        // Ensure that only the bot is mentioned
        else if (message.mentions.users.size == 1 && message.mentions.users.has(botId)) {
            const prompt = message.content.slice(botId.length + 4);
            const res = await chatWithGPT(prompt);
            message.reply(res);
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

async function chatWithGPT(prompt) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: 'Summarize in one sentence with a max of 50 characters.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.1,
            model: config.gpt_version,
            max_tokens: config.max_tokens,
        }),
    }).catch(err => {
        logging.error("Error calling ChatGPT API: ", err.message);
        return "An error occurred while processing your request";
    });

    const data = await res.json();
    return data.choices[0].message.content;
}

module.exports = {
    discordBot
};
