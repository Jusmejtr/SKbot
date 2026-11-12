const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js');

const TYPY = {
    thumb: ['👍', '👎'],
    mark: ['✅', '❌'],
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Vytvorí anketu s reakciami')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(o => o.setName('question').setDescription('Otázka').setRequired(true).setMaxLength(256))
        .addStringOption(o => o.setName('type').setDescription('Typ reakcií (predvolene 👍/👎)')
            .addChoices(
                { name: '👍 / 👎', value: 'thumb' },
                { name: '✅ / ❌', value: 'mark' }
            )),
    async execute(interaction) {
        const otazka = interaction.options.getString('question');
        const typ = interaction.options.getString('type') ?? 'thumb';

        const embed = new EmbedBuilder().setTitle(otazka).setColor('#ffffff');
        await interaction.reply({ embeds: [embed] });
        const sprava = await interaction.fetchReply();
        for (const emoji of TYPY[typ]) await sprava.react(emoji);
    }
}
