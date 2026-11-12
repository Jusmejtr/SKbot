const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { hasAnyRole } = require('../utils/interaction');

const WIN_IMG = 'https://i.imgur.com/wBXMggF.png';
const LOSE_IMG = 'https://i.imgur.com/gqvSC7x.png';

// Uloží výsledok hry do economy + statistiky
async function zapisVysledok(db, userId, novyStav, stavka, vyhra) {
    await db.collection('economy').doc(userId).update({ 'money': novyStav });
    const ia = await db.collection('statistiky').doc(userId).get();
    if (!ia.exists) return;
    const s = ia.data();
    if (vyhra) {
        await db.collection('statistiky').doc(userId).update({
            'pregamblene': s.pregamblene + stavka,
            'gamble_win': s.gamble_win + 1,
            'suma_vyhra': s.suma_vyhra + stavka
        });
    } else {
        await db.collection('statistiky').doc(userId).update({
            'pregamblene': s.pregamblene + stavka,
            'gamble_lose': s.gamble_lose + 1,
            'suma_prehra': s.suma_prehra + stavka
        });
    }
}

async function hrajStavku(interaction, db) {
    const bet = interaction.options.getInteger('amount');
    const uzivatel = interaction.user.id;
    await interaction.deferReply();

    const h = await db.collection('economy').doc(uzivatel).get();
    if (!h.exists) return interaction.editReply('Najprv si musíš vytvoriť účet príkazom /createaccount');
    let hodnota = h.data().money;
    if (hodnota <= 0) return interaction.editReply('Nemáš žiadne coiny');
    if (hodnota < bet) return interaction.editReply('Nemáš toľko peňazí');

    // 8 výhier / 11 prehier (rovnaká šanca ako pri *gamble)
    const moznosti = ['l', 'w', 'l', 'w', 'l', 'w', 'l', 'w', 'l', 'w', 'l', 'w', 'l', 'w', 'l', 'w', 'l', 'l', 'l'];
    const vyhra = moznosti[Math.floor(Math.random() * moznosti.length)] === 'w';

    hodnota = vyhra ? hodnota + bet : hodnota - bet;
    await zapisVysledok(db, uzivatel, hodnota, bet, vyhra);

    const embed = new EmbedBuilder().setTitle('GAMBLE').setColor('#821e64');
    if (vyhra) {
        embed.addFields({ name: 'stávka', value: String(bet) })
            .setDescription(`${interaction.user.tag}, vyhral si ${bet + bet} coinov. Aktuálne máš ${hodnota}`)
            .setThumbnail(WIN_IMG);
    } else {
        embed.setDescription(`${interaction.user.tag}, prehral si ${bet} coinov. Aktuálne máš ${hodnota}`)
            .setThumbnail(LOSE_IMG);
    }
    return interaction.editReply({ embeds: [embed] });
}

async function allIn(interaction, db) {
    const { VIP_ROLE_ID, MODERATOR_ROLE_ID, SBS_ROLE_ID, ADMIN_ROLE_ID } = process.env;
    if (!hasAnyRole(interaction.member, VIP_ROLE_ID, MODERATOR_ROLE_ID, SBS_ROLE_ID, ADMIN_ROLE_ID)) {
        return interaction.reply('Tento príkaz je len pre VIP');
    }
    const uzivatel = interaction.user.id;
    await interaction.deferReply();

    const a = await db.collection('economy').doc(uzivatel).get();
    if (!a.exists) return interaction.editReply('Nemáš vytvorený účet');
    const coiny = a.data().money;
    if (!(coiny > 0)) return interaction.editReply('Nemáš žiadne coiny');

    const potvrdenie = new EmbedBuilder()
        .setTitle('GAMBLE (All in)')
        .setColor('#821e64')
        .setDescription(`${interaction.user.tag}, Naozaj chceš staviť ${coiny} coinov?`);
    const tlacidla = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('allin_yes').setLabel('Áno').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('allin_no').setLabel('Nie').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    const sprava = await interaction.editReply({ embeds: [potvrdenie], components: [tlacidla] });
    const collector = sprava.createMessageComponentCollector({
        filter: i => i.user.id === uzivatel,
        max: 1,
        time: 7000
    });

    collector.on('collect', async (i) => {
        await i.update({ components: [] });
        if (i.customId === 'allin_no') return interaction.followUp('Stávka zrušená');

        const vyhra = Math.random() < 0.5;
        const novyStav = vyhra ? coiny * 2 : 0;
        await zapisVysledok(db, uzivatel, novyStav, coiny, vyhra);

        const embed = new EmbedBuilder().setTitle('GAMBLE (All in)').setColor('#821e64');
        if (vyhra) {
            embed.addFields({ name: 'stávka', value: String(coiny) })
                .setDescription(`${interaction.user.tag}, vyhral si ${novyStav} coinov. Aktuálne máš ${novyStav}`)
                .setThumbnail(WIN_IMG);
        } else {
            embed.setDescription(`${interaction.user.tag}, prehral si ${coiny} coinov. Aktuálne máš 0`)
                .setThumbnail(LOSE_IMG);
        }
        return interaction.followUp({ embeds: [embed] });
    });
    collector.on('end', async (collected) => {
        if (collected.size === 0) {
            await interaction.editReply({ components: [] }).catch(() => {});
            return interaction.followUp('Nestihol si potvrdiť stávku');
        }
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Gamble s tvojimi coinmi')
        .addSubcommand(s => s.setName('bet').setDescription('Stav určitú sumu')
            .addIntegerOption(o => o.setName('amount').setDescription('Stávka (minimálne 5)').setRequired(true).setMinValue(5)))
        .addSubcommand(s => s.setName('all-in').setDescription('Stav všetky coiny (len VIP)')),
    async execute(interaction, db) {
        if (interaction.options.getSubcommand() === 'all-in') return allIn(interaction, db);
        return hrajStavku(interaction, db);
    }
}
