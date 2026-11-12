const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasAnyRole } = require('../utils/interaction');
const db = require('../utils/db');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Rebríček užívateľov s najviac coinami'),
    execute(interaction) {
        const { vip, moderator, sbs } = config.roles;
        const pocet = hasAnyRole(interaction.member, vip, moderator, sbs) ? 5 : 3;
        const top = db.getTop(pocet);
        if (top.length === 0) return interaction.reply('Zatiaľ nikto nemá účet');

        const embed = new EmbedBuilder()
            .setTitle(`TOP ${pocet} s najviac coinami`)
            .setColor('#b7d5f0')
            .addFields(top.map((u, i) => ({ name: `${i + 1}. ${u.name}`, value: String(u.money) })))
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }
}
