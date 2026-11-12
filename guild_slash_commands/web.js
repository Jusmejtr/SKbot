const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const DEVELOPER_ROLE_ID = '802287093371502662';

// Odpovede sú len pre teba (ephemeral), aby nikto nevidel kód
async function reset(interaction, db, kod) {
    const kto = interaction.user.tag;
    const a = await db.collection('web').doc(kto).get();
    if (!a.exists) return interaction.editReply('Tvoje meno sa nezhoduje s menom účtu v databáze');
    const { reset: code, meno, heslo_na_zmenu } = a.data();

    if (!code) return interaction.editReply('Nepožiadal si o zmenu hesla');
    if (code != kod || meno != kto) return interaction.editReply('Zadal si zlý kód, alebo nie si vlastníkom tohto web účtu');

    await db.collection('web').doc(kto).set({
        'meno': kto,
        'heslo': heslo_na_zmenu,
        'idcko': interaction.user.id,
        'rola': 'nic',
        'daily': Date.now() + 7200000, // +2h
        'can_buy': 1,
    });
    return interaction.editReply('Úspešne si si obnovil heslo pre web');
}

async function register(interaction, db, kod) {
    const kto = interaction.user.tag;
    const a = await db.collection('web').doc(kto).get();
    if (!a.exists) return interaction.editReply('Tvoje meno ešte nie je zaregistrované na našom webe');
    const { meno, reg_kod, heslo } = a.data();
    if (kod != reg_kod || kto != meno) return interaction.editReply('Zadal si zlý kód, alebo nie si vlastníkom tohto web účtu');

    const roles = interaction.member.roles.cache;
    let rola = 'nic';
    if (roles.has(process.env.MODERATOR_ROLE_ID)) rola = 'Helper';
    else if (roles.has(DEVELOPER_ROLE_ID)) rola = 'Developer';
    else if (process.env.SBS_ROLE_ID && roles.has(process.env.SBS_ROLE_ID)) rola = 'SBS';
    else if (roles.has(process.env.VIP_ROLE_ID)) rola = 'VIP';

    await db.collection('web').doc(kto).set({
        'meno': kto,
        'heslo': heslo,
        'idcko': interaction.user.id,
        'rola': rola,
        'daily': 0,
        'can_buy': 0,
    });
    return interaction.editReply('Úspešne si si aktivoval svoj web účet');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('web')
        .setDescription('Prepojenie s webom skplayers.eu')
        .addSubcommand(s => s.setName('register').setDescription('Aktivuje tvoj web účet')
            .addStringOption(o => o.setName('code').setDescription('Registračný kód z webu').setRequired(true)))
        .addSubcommand(s => s.setName('reset').setDescription('Potvrdí zmenu hesla na webe')
            .addStringOption(o => o.setName('code').setDescription('Kód na obnovu hesla z webu').setRequired(true))),
    async execute(interaction, db) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const kod = interaction.options.getString('code');
        if (interaction.options.getSubcommand() === 'reset') return reset(interaction, db, kod);
        return register(interaction, db, kod);
    }
}
