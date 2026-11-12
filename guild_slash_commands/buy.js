const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/interaction');

const ECONOMY_ROLE_ID = '790184496208150589';
const TEXT_MUTE_ROLE_ID = '686618345100935381';
const VOICE_MUTE_ROLE_ID = '784018915407560745';
const SKBOT_ROLE_ID = '662296220328525874';

const CENA_VIP_DEN = 250;
const CENA_MENO_DEN = 150;
const CENA_TEXT_MUTE_MIN = 50;
const CENA_VOICE_MUTE_MIN = 500;
const DEN_MS = 86400000;

// Načíta účet kupujúceho a strhne cenu. Vráti true, ak sa nákup podaril.
async function zaplat(interaction, db, cena) {
    const ucet = await db.collection('economy').doc(interaction.user.id).get();
    if (!ucet.exists) {
        await interaction.editReply('Nemáš vytvorený účet');
        return false;
    }
    const hodnota = ucet.data().money;
    if (hodnota < cena) {
        await interaction.editReply('Na tento nákup nemáš dostatok financií');
        return false;
    }
    await db.collection('economy').doc(interaction.user.id).update({ 'money': hodnota - cena });
    return true;
}

async function kupVip(interaction, db) {
    const vip = process.env.VIP_ROLE_ID;
    const dni = interaction.options.getInteger('days');
    if (!dni) return interaction.editReply('Zadaj na koľko dní chceš VIP (možnosť `days`, 1-14)');
    if (interaction.member.roles.cache.has(vip)) return interaction.editReply('Už máš VIP');

    if (!await zaplat(interaction, db, CENA_VIP_DEN * dni)) return;

    await interaction.member.roles.add(vip);
    sendLog(interaction.client, `${interaction.user.tag} si kupil vip na ${dni}`);

    await db.collection('nakupy2').doc(interaction.user.id).set({
        'meno': interaction.user.tag,
        'ID': interaction.user.id,
        'casnakupu': Date.now(),
        'platnostnakupu': Date.now() + DEN_MS * dni,
        'typnakupu': 'vip',
    });
    const web = await db.collection('web').doc(interaction.user.tag).get();
    if (web.exists) await db.collection('web').doc(interaction.user.tag).update({ 'rola': 'VIP' });

    const embed = new EmbedBuilder()
        .setTitle('Nákup VIP')
        .setDescription(`${interaction.user.username}, Úspešne si si kúpil VIP na počet dní: ${dni}`);
    return interaction.editReply({ embeds: [embed] });
}

async function kupFarebneMeno(interaction, db) {
    const dni = interaction.options.getInteger('days');
    let farba = interaction.options.getString('color');
    if (!dni) return interaction.editReply('Zadaj na koľko dní chceš farebné meno (možnosť `days`, 1-14)');
    if (!farba) return interaction.editReply('Zadaj farbu ako hex kód, napr. #ff0000 (možnosť `color`). Farby nájdeš tu: https://htmlcolorcodes.com/');

    farba = farba.trim();
    if (!farba.startsWith('#')) farba = '#' + farba;
    const hex = farba.slice(1);
    if (!(hex.length === 6 && !isNaN(Number('0x' + hex)))) return interaction.editReply('Tento hexadecimálny kód je zlý');
    if (farba === '#000000') return interaction.editReply('Pre vybratie čierneho mena použi kód #000001 z dôvodu, že kód #000000 používa discord ako defaultnú farbu');
    if (interaction.guild.roles.cache.find(r => r.name === interaction.user.id)) return interaction.editReply('Už máš farebné meno');

    if (!await zaplat(interaction, db, CENA_MENO_DEN * dni)) return;
    sendLog(interaction.client, `${interaction.user.tag} si kupil farebne meno na ${dni}`);

    const rola = await interaction.guild.roles.create({
        name: interaction.user.id,
        colors: { primaryColor: farba },
        position: interaction.guild.roles.cache.size - 2,
    });
    await interaction.member.roles.add(rola);
    await db.collection('nakupy').doc(interaction.user.id).set({
        'meno': interaction.user.tag,
        'ID': interaction.user.id,
        'casnakupu': Date.now(),
        'platnostnakupu': Date.now() + DEN_MS * dni,
        'typnakupu': 'meno',
    });

    const embed = new EmbedBuilder()
        .setTitle('Nákup farebného mena')
        .setDescription(`${interaction.user.tag}, Úspešne si si kúpil farbu svojho mena na počet dní: ${dni}`);
    return interaction.editReply({ embeds: [embed] });
}

async function zrusFarebneMeno(interaction, db) {
    const rola = interaction.guild.roles.cache.find(r => r.name === interaction.user.id);
    if (!rola) return interaction.editReply('Nemáš kúpené farebné meno');
    await rola.delete();
    await db.collection('nakupy').doc(interaction.user.id).delete();
    return interaction.editReply('Úspešne si si vymazal svoje farebné meno');
}

// Spoločné kontroly pre text-mute a voice-mute
function skontrolujCiel(interaction, hrac) {
    if (!hrac) return 'Zadaj koho chceš mutnúť (možnosť `user`)';
    if (hrac.id === interaction.user.id) return 'Nemôžeš mutnúť samého seba';
    if (hrac.roles.cache.has(process.env.ADMIN_ROLE_ID)) return 'Nemôžeš mutnúť server admina';
    if (hrac.roles.cache.has(SKBOT_ROLE_ID)) return 'Nemôžeš mutnúť SKbota, ale on teba áno :)';
    if (!hrac.roles.cache.has(ECONOMY_ROLE_ID)) return 'Nemôžeš mutnúť tohto užívateľa, pretože nemá vytvorený účet a tak by ti to nemohol vrátiť';
    return null;
}

async function kupTextMute(interaction, db) {
    const hrac = interaction.options.getMember('user');
    const minuty = interaction.options.getInteger('minutes');
    const chyba = skontrolujCiel(interaction, hrac);
    if (chyba) return interaction.editReply(chyba);
    if (!minuty || minuty > 120) return interaction.editReply('Zadaj čas mutnutia 1-120 minút (možnosť `minutes`)');
    if (hrac.roles.cache.has(TEXT_MUTE_ROLE_ID)) return interaction.editReply('Tento užívateľ už má mute');

    if (!await zaplat(interaction, db, CENA_TEXT_MUTE_MIN * minuty)) return;

    await hrac.roles.add(TEXT_MUTE_ROLE_ID);
    setTimeout(() => hrac.roles.remove(TEXT_MUTE_ROLE_ID).catch(console.error), minuty * 60 * 1000);

    const embed = new EmbedBuilder()
        .setTitle('Text-mute užívateľa')
        .setDescription(`${interaction.user.tag}, Úspešne si text-mutol hráča ${hrac} na ${minuty} min`);
    return interaction.editReply({ embeds: [embed] });
}

async function kupVoiceMute(interaction, db) {
    const hrac = interaction.options.getMember('user');
    const minuty = interaction.options.getInteger('minutes');
    const chyba = skontrolujCiel(interaction, hrac);
    if (chyba) return interaction.editReply(chyba);
    if (!minuty || minuty > 10) return interaction.editReply('Zadaj čas mutnutia 1-10 minút (možnosť `minutes`)');
    if (hrac.roles.cache.has(VOICE_MUTE_ROLE_ID)) return interaction.editReply('Tento užívateľ už má voice mute');
    if (!hrac.voice.channel) return interaction.editReply('Tento úživateľ nie je vo voice roomke a tak ho nemôžeš voice mutnúť');

    if (!await zaplat(interaction, db, CENA_VOICE_MUTE_MIN * minuty)) return;

    await hrac.voice.setMute(true);
    await hrac.roles.add(VOICE_MUTE_ROLE_ID);
    setTimeout(async () => {
        await hrac.voice.setMute(false).catch(console.error);
        await hrac.roles.remove(VOICE_MUTE_ROLE_ID).catch(console.error);
    }, minuty * 60 * 1000);

    const embed = new EmbedBuilder()
        .setTitle('Voice-mute užívateľa')
        .setDescription(`${interaction.user.tag}, Úspešne si voice-mutol hráča ${hrac} na ${minuty} min`);
    return interaction.editReply({ embeds: [embed] });
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
                { name: 'VIP (250 coinov/deň) – days', value: 'vip' },
                { name: 'Farebné meno (150 coinov/deň) – days, color', value: 'colorname' },
                { name: 'Text-mute (50 coinov/min) – user, minutes 1-120', value: 'text-mute' },
                { name: 'Voice-mute (500 coinov/min) – user, minutes 1-10', value: 'voice-mute' },
                { name: 'Zrušiť farebné meno', value: 'remove-colorname' }
            ))
        .addIntegerOption(o => o.setName('days').setDescription('Počet dní (VIP / farebné meno)').setMinValue(1).setMaxValue(14))
        .addStringOption(o => o.setName('color').setDescription('Hex kód farby, napr. #ff0000 (farebné meno)').setMinLength(6).setMaxLength(7))
        .addUserOption(o => o.setName('user').setDescription('Koho chceš mutnúť (text/voice-mute)'))
        .addIntegerOption(o => o.setName('minutes').setDescription('Na koľko minút (text/voice-mute)').setMinValue(1).setMaxValue(120)),
    async execute(interaction, db) {
        await interaction.deferReply();
        const item = interaction.options.getString('item');
        try {
            await HANDLERY[item](interaction, db);
        } catch (err) {
            console.error(err);
            await interaction.editReply('Nastala chyba pri nákupe').catch(() => {});
        }
    }
}
