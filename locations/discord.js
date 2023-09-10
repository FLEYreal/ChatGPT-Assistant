'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, CommandInteractionOptionResolver } = require('discord.js');
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
        console.log('[\u001b[1;31mERROR\u001b[0m] : Discord Bot cannot work when Console Application is on!');
        return;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ],
    });

    client.once('ready', () => {
        if (config.display_info_logs) {
            console.log(`[\u001b[1;36mINFO\u001b[0m] : Discord Bot has logged in!`);
        }
    });

    client.on('ready', async () => {
        const guildId = '1147478772921147432';
        const commandName = 'command';
        const commandDescription = 'Reply with hello';

        const command = await client.guilds.cache.get(guildId)?.commands.create({
            name: commandName,
            description: commandDescription,
            options: [],
        });

        if (command) {
            console.log(`[\u001b[1;36mINFO\u001b[0m] : Slash Command ${command.name} registered!`);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const commandName = interaction.commandName;

        if (commandName === 'command') {
            await interaction.reply('hello');
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
    })
        .catch(e => {
            logging.error("Error calling ChatGPT API: ", e.message);
            return "An error occurred while processing your request";
        });

    const data = await res.json();
    return data.choices[0].message.content;
}

module.exports = {
    discordBot
};
