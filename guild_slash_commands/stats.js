const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Gamble štatistiky')
        .addUserOption(o => o.setName('user').setDescription('Čie štatistiky chceš vidieť (predvolene tvoje)')),
    execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const s = db.getStats(user.id);
        if (!s) return interaction.reply(`Pre ${user.tag} nie sú dostupné štatistiky`);

        const embed = new EmbedBuilder()
            .setTitle('GAMBLE ŠTATISTIKY')
            .setColor('#ffff00')
            .setDescription(user.tag)
            .addFields(
                { name: 'Celkovo pregemblených coinov', value: String(s.total_bet) },
                { name: 'Počet výhier', value: `${s.wins} [win/lose: ${s.wins - s.losses}]` },
                { name: 'Počet prehier', value: String(s.losses) },
                { name: 'Počet vyhratých coinov', value: String(s.total_won) },
                { name: 'Počet prehratých coinov', value: String(s.total_lost) },
                { name: 'Počet darovaných coinov', value: String(s.total_given) }
            )
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }
}
