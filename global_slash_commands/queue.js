const { SlashCommandBuilder } = require('discord.js');
const { showQueue } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current queue'),

    async execute(interaction) {
        await showQueue(interaction);
    }
};