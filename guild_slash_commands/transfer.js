const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Prevedie coiny inému užívateľovi')
        .addUserOption(o => o.setName('user').setDescription('Komu chceš coiny previesť').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('Suma (minimálne 10)').setRequired(true).setMinValue(10)),
    async execute(interaction, db) {
        const prijemca = interaction.options.getUser('user');
        const suma = interaction.options.getInteger('amount');
        const odosielatel = interaction.user;

        if (prijemca.id === odosielatel.id) return interaction.reply('Nemôžeš previesť sám sebe coiny');
        if (prijemca.bot) return interaction.reply('Botovi nemôžeš previesť coiny');

        await interaction.deferReply();

        const q = await db.collection('economy').doc(odosielatel.id).get();
        if (!q.exists) return interaction.editReply('Nemáš vytvorený účet');
        const hodnota = q.data().money;
        if (suma > hodnota) return interaction.editReply('Nemáš toľko peňazí na prevedenie');

        const g = await db.collection('economy').doc(prijemca.id).get();
        if (!g.exists) return interaction.editReply('Užívateľ komu chceš poslať coiny nemá účet');

        const stats = await db.collection('statistiky').doc(odosielatel.id).get();
        if (stats.exists) {
            await db.collection('statistiky').doc(odosielatel.id).update({
                'givnute': stats.data().givnute + suma
            });
        }
        await db.collection('economy').doc(prijemca.id).update({ 'money': g.data().money + suma });
        await db.collection('economy').doc(odosielatel.id).update({ 'money': hodnota - suma });

        return interaction.editReply(`Úspešne si previedol ${suma} coinov užívateľovi ${prijemca.tag}`);
    }
}
