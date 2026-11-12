const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Vypíše aktuálnu odozvu bota'),
    async execute(interaction) {
        await interaction.reply('Pinging...');
        return interaction.editReply(`🏓 Pong!\nOdozva je ${Math.round(interaction.client.ws.ping)}ms`);
    }
}
