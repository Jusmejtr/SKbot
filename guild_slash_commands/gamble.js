const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { hasAnyRole } = require('../utils/interaction');
const db = require('../utils/db');
const config = require('../config');

const WIN_IMG = 'https://i.imgur.com/wBXMggF.png';
const LOSE_IMG = 'https://i.imgur.com/gqvSC7x.png';
const WIN_CHANCE = 8 / 19; // rovnaká šanca ako pôvodný *gamble
const CHYBA_UCTU = {
    no_account: 'Najprv si musíš vytvoriť účet príkazom /createaccount',
    insufficient: 'Nemáš toľko peňazí',
};

function vysledokEmbed(title, user, bet, vyhra) {
    const stav = db.getMoney(user.id);
    const embed = new EmbedBuilder().setTitle(title).setColor('#821e64');
    if (vyhra) {
        return embed.addFields({ name: 'stávka', value: String(bet) })
            .setDescription(`${user.tag}, vyhral si ${bet * 2} coinov. Aktuálne máš ${stav}`)
            .setThumbnail(WIN_IMG);
    }
    return embed.setDescription(`${user.tag}, prehral si ${bet} coinov. Aktuálne máš ${stav}`).setThumbnail(LOSE_IMG);
}

// Stávka sa strhne hneď; pri výhre sa vráti 2× (stávka + zisk)
function odohraj(user, bet) {
    const vyhra = Math.random() < WIN_CHANCE;
    if (vyhra) db.addMoney(user.id, bet * 2);
    db.recordGamble(user.id, bet, vyhra);
    return vyhra;
}

function hrajStavku(interaction) {
    const bet = interaction.options.getInteger('amount');
    const r = db.takeMoney(interaction.user.id, bet);
    if (r !== 'ok') return interaction.reply(CHYBA_UCTU[r]);

    const vyhra = odohraj(interaction.user, bet);
    return interaction.reply({ embeds: [vysledokEmbed('GAMBLE', interaction.user, bet, vyhra)] });
}

async function allIn(interaction) {
    const { vip, moderator, sbs, admin } = config.roles;
    if (!hasAnyRole(interaction.member, vip, moderator, sbs, admin)) {
        return interaction.reply('Tento príkaz je len pre VIP');
    }
    const user = interaction.user;
    const coiny = db.getMoney(user.id);
    if (coiny === null) return interaction.reply(CHYBA_UCTU.no_account);
    if (coiny <= 0) return interaction.reply('Nemáš žiadne coiny');

    // coiny sa hneď "zamknú", aby sa počas potvrdzovania nedali minúť inde
    if (db.takeMoney(user.id, coiny) !== 'ok') return interaction.reply('Nastala chyba, skús to znova');

    const potvrdenie = new EmbedBuilder()
        .setTitle('GAMBLE (All in)')
        .setColor('#821e64')
        .setDescription(`${user.tag}, Naozaj chceš staviť ${coiny} coinov?`);
    const tlacidla = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('allin_yes').setLabel('Áno').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('allin_no').setLabel('Nie').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [potvrdenie], components: [tlacidla] });
    const sprava = await interaction.fetchReply();
    const collector = sprava.createMessageComponentCollector({ filter: i => i.user.id === user.id, max: 1, time: 15000 });

    collector.on('collect', async (i) => {
        await i.update({ components: [] });
        if (i.customId === 'allin_no') {
            db.addMoney(user.id, coiny);
            return interaction.followUp('Stávka zrušená');
        }
        const vyhra = odohraj(user, coiny);
        return interaction.followUp({ embeds: [vysledokEmbed('GAMBLE (All in)', user, coiny, vyhra)] });
    });
    collector.on('end', async (collected) => {
        if (collected.size > 0) return;
        db.addMoney(user.id, coiny);
        await interaction.editReply({ components: [] }).catch(() => {});
        return interaction.followUp('Nestihol si potvrdiť stávku, coiny ti boli vrátené');
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Gamble s tvojimi coinmi')
        .addSubcommand(s => s.setName('bet').setDescription('Stav určitú sumu')
            .addIntegerOption(o => o.setName('amount').setDescription('Stávka (minimálne 5)').setRequired(true).setMinValue(5)))
        .addSubcommand(s => s.setName('all-in').setDescription('Stav všetky coiny (len VIP)')),
    execute(interaction) {
        if (interaction.options.getSubcommand() === 'all-in') return allIn(interaction);
        return hrajStavku(interaction);
    }
}
