const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Gamble štatistiky')
        .addUserOption(o => o.setName('user').setDescription('Čie štatistiky chceš vidieť (predvolene tvoje)')),
    async execute(interaction, db) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        await interaction.deferReply();

        const q = await db.collection('statistiky').doc(user.id).get();
        if (!q.exists) return interaction.editReply(`Pre ${user.tag} nie sú dostupné štatistiky`);

        const d = q.data();
        const embed = new EmbedBuilder()
            .setTitle('GAMBLE ŠTATISTIKY')
            .setColor('#ffff00')
            .setDescription(user.tag)
            .addFields(
                { name: 'Celkovo pregemblených coinov', value: String(d.pregamblene) },
                { name: 'Počet výhier', value: `${d.gamble_win} [win/lose: ${d.gamble_win - d.gamble_lose}]` },
                { name: 'Počet prehier', value: String(d.gamble_lose) },
                { name: 'Počet vyhratých coinov', value: String(d.suma_vyhra) },
                { name: 'Počet prehratých coinov', value: String(d.suma_prehra) },
                { name: 'Počet darovaných coinov', value: String(d.givnute) }
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}
