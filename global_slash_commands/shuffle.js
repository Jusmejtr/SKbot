const { SlashCommandBuilder } = require('discord.js');
const { shuffleQueue } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue'),

    async execute(interaction) {
        await shuffleQueue(interaction);
    }
};