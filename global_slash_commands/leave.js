const { SlashCommandBuilder } = require('discord.js');
const { leaveChannel } = require('../utils/music-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnect from the voice channel'),

    async execute(interaction) {
        await leaveChannel(interaction);
    }
};