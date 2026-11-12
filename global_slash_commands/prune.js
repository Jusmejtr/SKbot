const { SlashCommandBuilder, PermissionsBitField, MessageFlags, InteractionContextType } = require('discord.js');
const { hasAnyRole, sendLog } = require('../utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Vymaže správy v roomke')
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(o => o.setName('count').setDescription('Počet správ (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const pocet = interaction.options.getInteger('count');
        const naSkServeri = interaction.guild.id === process.env.SERVER_ID;

        if (naSkServeri) {
            const { ADMIN_ROLE_ID, MODERATOR_ROLE_ID, SBS_ROLE_ID } = process.env;
            if (!hasAnyRole(interaction.member, ADMIN_ROLE_ID, MODERATOR_ROLE_ID, SBS_ROLE_ID)) {
                return interaction.reply({ content: 'Na tento príkaz nemáš práva.', flags: MessageFlags.Ephemeral });
            }
        } else if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission **MANAGE_MESSAGES**", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        // true = preskočí správy staršie ako 14 dní (Discord ich nedovolí hromadne mazať)
        const vymazane = await interaction.channel.bulkDelete(pocet, true);
        if (naSkServeri) {
            sendLog(interaction.client, `${interaction.user.tag} vymazal ${vymazane.size} sprav v roomke: ${interaction.channel.name}`);
        }
        return interaction.editReply(`Vymazaných správ: ${vymazane.size}`);
    }
}
