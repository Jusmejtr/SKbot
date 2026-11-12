const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prepacte')
        .setDescription('🇵 🇷 🇪 🇵 🇦 🇨 🇹 🇪'),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const webhook = await interaction.channel.createWebhook({
            name: 'SK-bot-webhook',
            avatar: interaction.client.user.avatarURL(),
        });
        await webhook.send({
            content: '🇵 🇷 🇪 🇵 🇦 🇨 🇹 🇪',
            username: interaction.user.username,
            avatarURL: interaction.user.avatarURL()
        });
        setTimeout(() => webhook.delete().catch(console.error), 500);
        return interaction.editReply('Odoslané');
    }
}
