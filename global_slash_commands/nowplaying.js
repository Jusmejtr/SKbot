const { SlashCommandBuilder } = require('discord.js');
const { nowPlaying } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Ukáže, čo práve hrá'),

    async execute(interaction) {
        await nowPlaying(interaction);
    }
};