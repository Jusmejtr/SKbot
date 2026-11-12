const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/interaction');
const db = require('../utils/db');
const config = require('../config');

const { prices } = config.economy;
const DEN_MS = 86400000;
const MIN_MS = 60000;

// Strhne cenu; ak akcia (pridanie roly...) zlyhá, coiny vráti.
async function zaplatAVykonaj(interaction, cena, akcia) {
    const r = db.takeMoney(interaction.user.id, cena);
    if (r === 'no_account') return interaction.editReply('Nemáš vytvorený účet');
    if (r === 'insufficient') return interaction.editReply(`Na tento nákup nemáš dostatok financií (cena: ${cena} coinov)`);
    try {
        return await akcia();
    } catch (err) {
        db.addMoney(interaction.user.id, cena);
        console.error('Nákup zlyhal, coiny vrátené:', err);
        return interaction.editReply('Nákup sa nepodaril, coiny ti boli vrátené');
    }
}

async function kupVip(interaction) {
    const dni = interaction.options.getInteger('days');
    if (!dni) return interaction.editReply('Zadaj na koľko dní chceš VIP (možnosť `days`, 1-14)');
    if (interaction.member.roles.cache.has(config.roles.vip)) return interaction.editReply('Už máš VIP');

    return zaplatAVykonaj(interaction, prices.vipPerDay * dni, async () => {
        await interaction.member.roles.add(config.roles.vip);
        db.setPurchase(interaction.user.id, 'vip', config.roles.vip, Date.now() + DEN_MS * dni);
        sendLog(interaction.client, `${interaction.user.tag} si kúpil VIP na ${dni} dní`);
        const embed = new EmbedBuilder()
            .setTitle('Nákup VIP')
            .setDescription(`${interaction.user.username}, Úspešne si si kúpil VIP na počet dní: ${dni}`);
        return interaction.editReply({ embeds: [embed] });
    });
}

async function kupFarebneMeno(interaction) {
    const dni = interaction.options.getInteger('days');
    let farba = interaction.options.getString('color');
    if (!dni) return interaction.editReply('Zadaj na koľko dní chceš farebné meno (možnosť `days`, 1-14)');
    if (!farba) return interaction.editReply('Zadaj farbu ako hex kód, napr. #ff0000 (možnosť `color`). Farby nájdeš tu: https://htmlcolorcodes.com/');

    farba = farba.trim();
    if (!farba.startsWith('#')) farba = '#' + farba;
    if (!/^#[0-9a-fA-F]{6}$/.test(farba)) return interaction.editReply('Tento hexadecimálny kód je zlý');
    if (farba === '#000000') return interaction.editReply('Pre vybratie čierneho mena použi kód #000001 z dôvodu, že kód #000000 používa discord ako defaultnú farbu');
    if (db.getPurchase(interaction.user.id, 'colorname') || interaction.guild.roles.cache.find(r => r.name === interaction.user.id)) return interaction.editReply('Už máš farebné meno');

    return zaplatAVykonaj(interaction, prices.colornamePerDay * dni, async () => {
        const rola = await interaction.guild.roles.create({
            name: interaction.user.id,
            colors: { primaryColor: farba },
            position: Math.max(1, interaction.guild.members.me.roles.highest.position - 1),
        });
        try {
            await interaction.member.roles.add(rola);
        } catch (err) {
            await rola.delete().catch(() => {});
            throw err;
        }
        db.setPurchase(interaction.user.id, 'colorname', rola.id, Date.now() + DEN_MS * dni);
        sendLog(interaction.client, `${interaction.user.tag} si kúpil farebné meno na ${dni} dní`);
        const embed = new EmbedBuilder()
            .setTitle('Nákup farebného mena')
            .setDescription(`${interaction.user.tag}, Úspešne si si kúpil farbu svojho mena na počet dní: ${dni}`);
        return interaction.editReply({ embeds: [embed] });
    });
}

async function zrusFarebneMeno(interaction) {
    const nakup = db.getPurchase(interaction.user.id, 'colorname');
    const rola = (nakup?.role_id && interaction.guild.roles.cache.get(nakup.role_id))
        ?? interaction.guild.roles.cache.find(r => r.name === interaction.user.id);
    if (!nakup && !rola) return interaction.editReply('Nemáš kúpené farebné meno');

    if (rola) await rola.delete();
    db.deletePurchase(interaction.user.id, 'colorname');
    return interaction.editReply('Úspešne si si vymazal svoje farebné meno');
}

// Spoločné kontroly pre text-mute a voice-mute
function skontrolujCiel(interaction, hrac) {
    if (!hrac) return 'Zadaj koho chceš mutnúť (možnosť `user`)';
    if (hrac.id === interaction.user.id) return 'Nemôžeš mutnúť samého seba';
    if (hrac.roles.cache.has(config.roles.admin)) return 'Nemôžeš mutnúť server admina';
    if (hrac.roles.cache.has(config.roles.skbot)) return 'Nemôžeš mutnúť SKbota, ale on teba áno :)';
    if (!hrac.roles.cache.has(config.roles.economy)) return 'Nemôžeš mutnúť tohto užívateľa, pretože nemá vytvorený účet a tak by ti to nemohol vrátiť';
    return null;
}

async function kupTextMute(interaction) {
    const hrac = interaction.options.getMember('user');
    const minuty = interaction.options.getInteger('minutes');
    const chyba = skontrolujCiel(interaction, hrac);
    if (chyba) return interaction.editReply(chyba);
    if (!minuty || minuty > 120) return interaction.editReply('Zadaj čas mutnutia 1-120 minút (možnosť `minutes`)');
    if (hrac.roles.cache.has(config.roles.textMute)) return interaction.editReply('Tento užívateľ už má mute');

    return zaplatAVykonaj(interaction, prices.textMutePerMinute * minuty, async () => {
        await hrac.roles.add(config.roles.textMute);
        // koniec mute sa ukladá do DB, takže skončí aj keď bot medzitým reštartuje
        db.addMute(interaction.guild.id, hrac.id, 'text', Date.now() + minuty * MIN_MS);
        const embed = new EmbedBuilder()
            .setTitle('Text-mute užívateľa')
            .setDescription(`${interaction.user.tag}, Úspešne si text-mutol hráča ${hrac} na ${minuty} min`);
        return interaction.editReply({ embeds: [embed] });
    });
}

async function kupVoiceMute(interaction) {
    const hrac = interaction.options.getMember('user');
    const minuty = interaction.options.getInteger('minutes');
    const chyba = skontrolujCiel(interaction, hrac);
    if (chyba) return interaction.editReply(chyba);
    if (!minuty || minuty > 10) return interaction.editReply('Zadaj čas mutnutia 1-10 minút (možnosť `minutes`)');
    if (hrac.roles.cache.has(config.roles.voiceMute)) return interaction.editReply('Tento užívateľ už má voice mute');
    if (!hrac.voice.channel) return interaction.editReply('Tento úživateľ nie je vo voice roomke a tak ho nemôžeš voice mutnúť');

    return zaplatAVykonaj(interaction, prices.voiceMutePerMinute * minuty, async () => {
        await hrac.voice.setMute(true);
        await hrac.roles.add(config.roles.voiceMute);
        db.addMute(interaction.guild.id, hrac.id, 'voice', Date.now() + minuty * MIN_MS);
        const embed = new EmbedBuilder()
            .setTitle('Voice-mute užívateľa')
            .setDescription(`${interaction.user.tag}, Úspešne si voice-mutol hráča ${hrac} na ${minuty} min`);
        return interaction.editReply({ embeds: [embed] });
    });
}

const HANDLERY = {
    'vip': kupVip,
    'colorname': kupFarebneMeno,
    'text-mute': kupTextMute,
    'voice-mute': kupVoiceMute,
    'remove-colorname': zrusFarebneMeno,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Obchod - kúp si VIP, farebné meno alebo mute')
        .addStringOption(o => o.setName('item').setDescription('Čo si chceš kúpiť').setRequired(true)
            .addChoices(
                { name: `VIP (${prices.vipPerDay} coinov/deň) – days`, value: 'vip' },
                { name: `Farebné meno (${prices.colornamePerDay} coinov/deň) – days, color`, value: 'colorname' },
                { name: `Text-mute (${prices.textMutePerMinute} coinov/min) – user, minutes 1-120`, value: 'text-mute' },
                { name: `Voice-mute (${prices.voiceMutePerMinute} coinov/min) – user, minutes 1-10`, value: 'voice-mute' },
                { name: 'Zrušiť farebné meno', value: 'remove-colorname' }
            ))
        .addIntegerOption(o => o.setName('days').setDescription('Počet dní (VIP / farebné meno)').setMinValue(1).setMaxValue(14))
        .addStringOption(o => o.setName('color').setDescription('Hex kód farby, napr. #ff0000 (farebné meno)').setMinLength(6).setMaxLength(7))
        .addUserOption(o => o.setName('user').setDescription('Koho chceš mutnúť (text/voice-mute)'))
        .addIntegerOption(o => o.setName('minutes').setDescription('Na koľko minút (text/voice-mute)').setMinValue(1).setMaxValue(120)),
    async execute(interaction) {
        await interaction.deferReply();
        await HANDLERY[interaction.options.getString('item')](interaction);
    }
}
