const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/db');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createaccount')
        .setDescription('Vytvorí ti ekonomický účet'),
    async execute(interaction) {
        if (!db.createAccount(interaction.user.id, interaction.user.tag)) {
            return interaction.reply('Už máš vytvorený účet');
        }
        await interaction.member.roles.add(config.roles.economy).catch(console.error);
        return interaction.reply('Úspešne si si vytvoril svoj účet');
    }
}
