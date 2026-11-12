const { SlashCommandBuilder } = require('discord.js');
const { playMusic } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Prehrá pesničku')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube odkaz alebo názov pesničky')
                .setRequired(true)),

    async execute(interaction) {
        await playMusic(interaction);
    }
};