const { SlashCommandBuilder } = require('discord.js');
const { playMusic } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube URL or search term')
                .setRequired(true)),

    async execute(interaction) {
        await playMusic(interaction);
    }
};