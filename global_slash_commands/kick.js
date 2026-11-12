const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Vyhodí užívateľa zo servera')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName('user').setDescription('Koho chceš vyhodiť').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Dôvod')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: "You don't have permission **KICK_MEMBERS**", flags: MessageFlags.Ephemeral });
        }
        const hrac = interaction.options.getMember('user');
        const dovod = interaction.options.getString('reason');
        if (!hrac) return interaction.reply({ content: 'Tento užívateľ nie je na serveri', flags: MessageFlags.Ephemeral });
        if (hrac.id === interaction.user.id) return interaction.reply('Nemôžeš kicknúť sámeho seba. Či?');
        if (!hrac.kickable) return interaction.reply({ content: 'Nastal error, tohto užívateľa nemôžeš vyhodiť zo servera', flags: MessageFlags.Ephemeral });

        await hrac.kick(dovod ?? undefined);
        return interaction.reply(dovod ? `Úspešne si vyhodil ${hrac}, dôvod: ${dovod}` : `Úspešne si vyhodil ${hrac}`);
    }
}
