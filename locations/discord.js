'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, CommandInteractionOptionResolver } = require('discord.js');
const { logging } = require('../utils/logging');

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
        const commandName = 'command';
        const commandDescription = 'Reply with hello';

        const command = await client.guilds.cache.get(guildId)?.commands.create({
            name: commandName,
            description: commandDescription,
            options: [],
        });

        if (command) {
            logging.info('Slash Command ${command.name} registered!');
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

module.exports = {
    discordBot
};
