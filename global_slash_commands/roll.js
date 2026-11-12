const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Vygeneruje náhodné číslo v rozsahu')
        .addIntegerOption(o => o.setName('min').setDescription('Najmenšie číslo').setRequired(true))
        .addIntegerOption(o => o.setName('max').setDescription('Najväčšie číslo').setRequired(true)),
    execute(interaction) {
        let min = interaction.options.getInteger('min');
        let max = interaction.options.getInteger('max');
        if (min > max) [min, max] = [max, min];
        if (min === max) return interaction.reply({ content: 'Min a max nemôžu byť rovnaké', flags: MessageFlags.Ephemeral });

        const cislo = Math.floor(Math.random() * (max - min + 1)) + min;
        const farba = ((1 << 24) * Math.random() | 0).toString(16).padStart(6, '0');
        const embed = new EmbedBuilder().setTitle(String(cislo)).setColor(`#${farba}`);
        return interaction.reply({ embeds: [embed] });
    }
}
