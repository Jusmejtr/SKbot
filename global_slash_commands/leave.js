const { SlashCommandBuilder } = require('discord.js');
const { leaveChannel } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Odpojí bota z voice roomky'),

    async execute(interaction) {
        await leaveChannel(interaction);
    }
};