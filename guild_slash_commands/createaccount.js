const { SlashCommandBuilder } = require('discord.js');

const ECONOMY_ROLE_ID = '790184496208150589';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createaccount')
        .setDescription('Vytvorí ti ekonomický účet'),
    async execute(interaction, db) {
        await interaction.deferReply();
        const uzivatel = interaction.user.id;

        const ucet = await db.collection('economy').doc(uzivatel).get();
        if (ucet.exists) return interaction.editReply('Už máš vytvorený účet');

        await db.collection('economy').doc(uzivatel).set({
            'ID': uzivatel,
            'money': 0,
            'daily': 0,
            'meno': interaction.user.tag
        });
        await db.collection('statistiky').doc(uzivatel).set({
            'gamble_lose': 0,
            'gamble_win': 0,
            'givnute': 0,
            'meno': interaction.user.tag,
            'pregamblene': 0,
            'suma_prehra': 0,
            'suma_vyhra': 0,
            'gamble_count': 1000
        });
        await interaction.member.roles.add(ECONOMY_ROLE_ID).catch(console.error);
        return interaction.editReply('Úspešne si si vytvoril svoj účet');
    }
}
