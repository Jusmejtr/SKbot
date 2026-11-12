const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db');

// násobiteľ -> šanca na výhru v % (rovnaké ako pôvodný *multiply)
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
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const user = interaction.user;

        // stávka sa strhne hneď, pri zrušení / vypršaní času sa vráti
        const r = db.takeMoney(user.id, bet);
        if (r === 'no_account') return interaction.reply('Nemáš vytvorený účet');
        if (r === 'insufficient') return interaction.reply('Nemáš toľko peňazí');

        const embed = new EmbedBuilder()
            .setTitle('Multiply')
            .setColor('#821e64')
            .setDescription(`${user.tag}, vyber si násobiteľ`)
            .addFields({ name: 'stávka', value: String(bet) });
        const tlacidla = new ActionRowBuilder().addComponents(
            ...Object.keys(NASOBITELE).map(id => new ButtonBuilder().setCustomId(id).setLabel(id.toUpperCase()).setStyle(ButtonStyle.Primary)),
            new ButtonBuilder().setCustomId('close').setLabel('Zrušiť').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [tlacidla] });
        const sprava = await interaction.fetchReply();
        const collector = sprava.createMessageComponentCollector({ filter: i => i.user.id === user.id, max: 1, time: 15000 });

        collector.on('collect', async (i) => {
            await i.update({ components: [] });
            if (i.customId === 'close') {
                db.addMoney(user.id, bet);
                return interaction.followUp('Stávka zrušená');
            }

            const volba = NASOBITELE[i.customId];
            const vyhra = Math.floor(Math.random() * 100) + 1 <= volba.sanca;
            const zisk = bet * volba.nasobok;
            // pri výhre dostane späť stávku + zisk (bet × násobok)
            if (vyhra) db.addMoney(user.id, bet + zisk);
            db.recordGamble(user.id, bet, vyhra, zisk);

            const stav = db.getMoney(user.id);
            const vysledok = new EmbedBuilder().setTitle(`Multiply ${volba.nazov}`).setColor('#821e64');
            if (vyhra) {
                vysledok.addFields({ name: 'stávka', value: String(bet) })
                    .setDescription(`${user.tag}, vyhral si ${zisk} coinov. Aktuálne máš ${stav}`)
                    .setThumbnail('https://i.imgur.com/wBXMggF.png');
            } else {
                vysledok.setDescription(`${user.tag}, prehral si ${bet} coinov. Aktuálne máš ${stav}`)
                    .setThumbnail('https://i.imgur.com/gqvSC7x.png');
            }
            return interaction.followUp({ embeds: [vysledok] });
        });
        collector.on('end', async (collected) => {
            if (collected.size > 0) return;
            db.addMoney(user.id, bet);
            await interaction.editReply({ components: [] }).catch(() => {});
            return interaction.followUp('Nestihol si vybrať násobiteľ, stávka ti bola vrátená');
        });
    }
}
