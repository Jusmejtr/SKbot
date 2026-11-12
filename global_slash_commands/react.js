const {
    ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType,
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags
} = require('discord.js');

// Ako dlho ostane reakcia od bota (za ten čas na ňu môžeš kliknúť aj bez Nitra)
const REACTION_TIMEOUT_MS = 4000;

// Kliknutie pravým na správu -> Apps -> "React with emote"
module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Reagovať emotom')
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const cielovaSprava = interaction.targetMessage;
        const modalId = `react_${interaction.id}`;

        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle('Reagovať emotom')
            .addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('emote')
                    .setLabel('Názov emotu (napr. OMEGALUL alebo :OMEGALUL:)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(100)
            ));
        await interaction.showModal(modal);

        const odoslane = await interaction.awaitModalSubmit({
            filter: i => i.customId === modalId && i.user.id === interaction.user.id,
            time: 60000
        }).catch(() => null);
        if (!odoslane) return;

        // prijme "nazov", ":nazov:" aj "<:nazov:123>" / "<a:nazov:123>"
        const vstup = odoslane.fields.getTextInputValue('emote').trim();
        const nazov = (vstup.match(/^<a?:(\w+):\d+>$/)?.[1]) ?? vstup.replace(/^:|:$/g, '');

        const emotikon = interaction.client.emojis.cache.find(e => e.name === nazov);
        if (!emotikon) return odoslane.reply({ content: 'Taký emote som nenašiel', flags: MessageFlags.Ephemeral });

        await cielovaSprava.react(emotikon);
        await odoslane.reply({ content: `Pridal som ${emotikon}, klikni na reakciu do ${REACTION_TIMEOUT_MS / 1000} sekúnd`, flags: MessageFlags.Ephemeral });
        setTimeout(() => {
            cielovaSprava.reactions.resolve(emotikon.id)?.users.remove(interaction.client.user.id).catch(console.error);
        }, REACTION_TIMEOUT_MS);
    }
}
