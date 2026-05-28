const { SlashCommandBuilder } = require('discord.js');
const { skipMusic } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction) {
        await skipMusic(interaction);
    }
};