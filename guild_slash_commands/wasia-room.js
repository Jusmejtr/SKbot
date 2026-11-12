const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { hasAnyRole } = require('../utils/interaction');

const WASIA_ROLE_ID = '654364963376332841';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wasia-room')
        .setDescription('Pridá alebo odoberie prístup do wasia roomky (admin/moderátor)')
        .addStringOption(o => o.setName('action').setDescription('Čo chceš urobiť').setRequired(true)
            .addChoices(
                { name: 'Pridať prístup', value: 'add' },
                { name: 'Odobrať prístup', value: 'remove' }
            ))
        .addUserOption(o => o.setName('user').setDescription('Užívateľ').setRequired(true)),
    async execute(interaction) {
        if (!hasAnyRole(interaction.member, process.env.ADMIN_ROLE_ID, process.env.MODERATOR_ROLE_ID)) {
            return interaction.reply({ content: 'Na tento príkaz nemáš práva', flags: MessageFlags.Ephemeral });
        }
        const hrac = interaction.options.getMember('user');
        if (!hrac) return interaction.reply({ content: 'Tento užívateľ neexistuje', flags: MessageFlags.Ephemeral });

        if (interaction.options.getString('action') === 'add') {
            await hrac.roles.add(WASIA_ROLE_ID);
            return interaction.reply({ content: `${hrac} má teraz prístup do wasia roomky`, flags: MessageFlags.Ephemeral });
        }
        await hrac.roles.remove(WASIA_ROLE_ID);
        return interaction.reply({ content: `${hrac} už nemá prístup do wasia roomky`, flags: MessageFlags.Ephemeral });
    }
}
