const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/db');
const config = require('../config');

function msToTime(ms) {
    const s = Math.floor(ms / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}h ${pad(Math.floor(s / 60) % 60)}m ${pad(s % 60)}s`;
}
const random = ({ min, max }) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Vyzdvihni si dennú odmenu'),
    execute(interaction) {
        const isVip = interaction.member.roles.cache.has(config.roles.vip);
        const { dailyReward, dailyRewardVip, dailyCooldownMs } = config.economy;
        const reward = random(isVip ? dailyRewardVip : dailyReward);

        const result = db.claimDaily(interaction.user.id, reward, dailyCooldownMs);
        const embed = { title: isVip ? 'Denná VIP odmena' : 'Denná odmena' };

        if (result.status === 'no_account') {
            return interaction.reply('Nemáš vytvorený účet. Vytvor si ho príkazom /createaccount');
        }
        if (result.status === 'cooldown') {
            embed.description = `${interaction.user.username}, dennú odmenu si už dnes vyzdvihol`;
            embed.fields = [{ name: 'Odmenu môžeš získať opäť o', value: msToTime(result.remainingMs) }];
            return interaction.reply({ embeds: [embed] });
        }
        embed.description = `Získal si ${isVip ? 'VIP ' : ''}dennú odmenu v hodnote **${result.reward}**. Aktuálne máš ${result.money}`;
        return interaction.reply({ embeds: [embed] });
    }
}
