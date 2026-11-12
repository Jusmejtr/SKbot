const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// násobiteľ -> šanca na výhru v % (rovnaké ako pri *multiply)
const NASOBITELE = {
    '3x': { nasobok: 3, sanca: 26, nazov: '3-násobok' },
    '4x': { nasobok: 4, sanca: 21, nazov: '4-násobok' },
    '5x': { nasobok: 5, sanca: 17, nazov: '5-násobok' },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('multiply')
        .setDescription('Znásob svoje coiny (3x, 4x alebo 5x)')
        .addIntegerOption(o => o.setName('bet').setDescription('Stávka (minimálne 5)').setRequired(true).setMinValue(5)),
    async execute(interaction, db) {
        const bet = interaction.options.getInteger('bet');
        const uzivatel = interaction.user.id;
        await interaction.deferReply();

        const a = await db.collection('economy').doc(uzivatel).get();
        if (!a.exists) return interaction.editReply('Nemáš vytvorený účet');
        let peniazky = a.data().money;
        if (peniazky < bet) return interaction.editReply('Nemáš toľko peňazí');

        const embed = new EmbedBuilder()
            .setTitle('Multiply')
            .setColor('#821e64')
            .setDescription(`${interaction.user.tag}, vyber si násobiteľ`)
            .addFields({ name: 'stávka', value: String(bet) });

        const tlacidla = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('3x').setLabel('3X').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('4x').setLabel('4X').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('5x').setLabel('5X').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('close').setLabel('Zrušiť').setStyle(ButtonStyle.Danger)
        );

        const sprava = await interaction.editReply({ embeds: [embed], components: [tlacidla] });
        const collector = sprava.createMessageComponentCollector({
            filter: i => i.user.id === uzivatel,
            max: 1,
            time: 7000
        });

        collector.on('collect', async (i) => {
            await i.update({ components: [] });
            if (i.customId === 'close') return interaction.followUp('Stávka zrušená');

            const volba = NASOBITELE[i.customId];
            const vyhra = Math.floor(Math.random() * 100) + 1 <= volba.sanca;

            const ia = await db.collection('statistiky').doc(uzivatel).get();
            const s = ia.exists ? ia.data() : null;
            const vysledok = new EmbedBuilder().setTitle(`Multiply ${volba.nazov}`).setColor('#821e64');

            if (vyhra) {
                peniazky += bet * volba.nasobok;
                await db.collection('economy').doc(uzivatel).update({ 'money': peniazky });
                if (s) await db.collection('statistiky').doc(uzivatel).update({
                    'pregamblene': s.pregamblene + bet,
                    'suma_vyhra': s.suma_vyhra + bet * volba.nasobok
                });
                vysledok.addFields({ name: 'stávka', value: String(bet) })
                    .setDescription(`${interaction.user.tag}, vyhral si ${bet * volba.nasobok} coinov. Aktuálne máš ${peniazky}`)
                    .setThumbnail('https://i.imgur.com/wBXMggF.png');
            } else {
                peniazky -= bet;
                await db.collection('economy').doc(uzivatel).update({ 'money': peniazky });
                if (s) await db.collection('statistiky').doc(uzivatel).update({
                    'pregamblene': s.pregamblene + bet,
                    'suma_prehra': s.suma_prehra + bet
                });
                vysledok.setDescription(`${interaction.user.tag}, prehral si ${bet} coinov. Aktuálne máš ${peniazky}`)
                    .setThumbnail('https://i.imgur.com/gqvSC7x.png');
            }
            return interaction.followUp({ embeds: [vysledok] });
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ components: [] }).catch(() => {});
                return interaction.followUp('Nestihol si vybrať násobiteľ');
            }
        });
    }
}
