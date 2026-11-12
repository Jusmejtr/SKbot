const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zabanuje užívateľa na serveri')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(o => o.setName('user').setDescription('Koho chceš zabanovať').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Dôvod')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: 'Nemáš oprávnenie **Zabanovať členov**', flags: MessageFlags.Ephemeral });
        }
        const hrac = interaction.options.getMember('user');
        const dovod = interaction.options.getString('reason');
        if (!hrac) return interaction.reply({ content: 'Tento užívateľ nie je na serveri', flags: MessageFlags.Ephemeral });
        if (hrac.id === interaction.user.id) return interaction.reply('Nemôžeš zabanovať sámeho seba. Či?');
        if (!hrac.bannable) return interaction.reply({ content: 'Nastal error, tohto užívateľa nemôžeš zabanovať zo servera', flags: MessageFlags.Ephemeral });

        await hrac.ban(dovod ? { reason: dovod } : undefined);
        return interaction.reply(dovod ? `Úspešne si zabanoval ${hrac}, dôvod: ${dovod}` : `Úspešne si zabanoval ${hrac}`);
    }
}
