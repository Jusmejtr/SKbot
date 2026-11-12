const { SlashCommandBuilder, PermissionsBitField, MessageFlags, InteractionContextType } = require('discord.js');
const { hasAnyRole, sendLog } = require('../utils/interaction');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Vymaže správy v roomke')
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(o => o.setName('count').setDescription('Počet správ (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const pocet = interaction.options.getInteger('count');
        const naSkServeri = interaction.guild.id === config.guildId;

        if (naSkServeri) {
            const { admin, moderator, sbs } = config.roles;
            if (!hasAnyRole(interaction.member, admin, moderator, sbs)) {
                return interaction.reply({ content: 'Na tento príkaz nemáš práva.', flags: MessageFlags.Ephemeral });
            }
        } else if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'Nemáš oprávnenie **Spravovať správy**', flags: MessageFlags.Ephemeral });
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
