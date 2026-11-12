const { SlashCommandBuilder } = require('discord.js');
const { skipMusic } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Preskočí aktuálnu pesničku'),

    async execute(interaction) {
        await skipMusic(interaction);
    }
};