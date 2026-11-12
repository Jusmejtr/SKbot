const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const config = require('../config');

const ROOMKY = config.moveRooms;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Prehádže ťa cez všetky voice roomky a vráti späť'),
    async execute(interaction) {
        const roomka = interaction.member.voice.channel;
        if (!roomka) return interaction.reply({ content: 'Musíš byť vo voice roomke', flags: MessageFlags.Ephemeral });

        await interaction.reply({ files: ['./emotes/move.gif'] });
        for (const id of ROOMKY) {
            await interaction.member.voice.setChannel(id).catch(console.error);
        }
        await interaction.member.voice.setChannel(roomka).catch(console.error);
    }
}
