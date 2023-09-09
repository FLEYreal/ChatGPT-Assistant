'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, CommandInteractionOptionResolver } = require('discord.js');
const { logging } = require('../utils/logging');

const commandMap = [
    {
        'name': 'command',
        'description': 'Reply with hello',
        'options': [],
    },
    {
        'name': 'test',
        'description': 'test',
        'options': [],
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

        const command = interaction.commandName;

        if (command === 'command') {
            await interaction.reply('hello');
        }

        if (command === 'test') {
            await interaction.reply('Test successfull.');
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

module.exports = {
    discordBot
};
