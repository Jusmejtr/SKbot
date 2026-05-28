const { SlashCommandBuilder } = require('discord.js');
const { nowPlaying } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),

    async execute(interaction) {
        await nowPlaying(interaction);
    }
};