const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasAnyRole } = require('../utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Rebríček užívateľov s najviac coinami'),
    async execute(interaction, db) {
        await interaction.deferReply();

        const vip = process.env.VIP_ROLE_ID;
        const helper = process.env.MODERATOR_ROLE_ID;
        const sbs = process.env.SBS_ROLE_ID;
        const pocet = hasAnyRole(interaction.member, vip, helper, sbs) ? 5 : 3;

        const zorad = await db.collection('economy').orderBy('money', 'desc').limit(pocet).get();
        if (zorad.empty) return interaction.editReply('Chybné dáta');

        const embed = new EmbedBuilder()
            .setTitle(`TOP ${pocet} s najviac coinami`)
            .setColor('#b7d5f0')
            .setTimestamp();

        let poradie = 1;
        zorad.forEach(doc => {
            embed.addFields({ name: `${poradie}. ${doc.data().meno}`, value: String(doc.data().money) });
            poradie++;
        });

        return interaction.editReply({ embeds: [embed] });
    }
}
