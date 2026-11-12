const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-team')
        .setDescription('Náhodne rozdelí hráčov do dvoch tímov')
        .addStringOption(o => o.setName('players').setDescription('Hráči oddelení medzerou alebo čiarkou (4, 6, 8 alebo 10 hráčov)').setRequired(true)),
    execute(interaction) {
        const hraci = interaction.options.getString('players').split(/[\s,]+/).filter(Boolean);
        if (hraci.length < 4 || hraci.length > 10 || hraci.length % 2 !== 0) {
            return interaction.reply({ content: 'Musíš zadať párny počet hráčov: 4, 6, 8 alebo 10', flags: MessageFlags.Ephemeral });
        }

        // zamiešanie (Fisher–Yates) a rozdelenie na polovicu
        for (let i = hraci.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [hraci[i], hraci[j]] = [hraci[j], hraci[i]];
        }
        const polovica = hraci.length / 2;
        const oranzovy = hraci.slice(0, polovica);
        const zlty = hraci.slice(polovica);

        const embed = new EmbedBuilder().setTitle('Oranžový tím').setColor('#FF7F00')
            .addFields(oranzovy.map((h, i) => ({ name: `Hráč č.${i + 1}`, value: h })));
        const embed2 = new EmbedBuilder().setTitle('Žltý tím').setColor('#FFFF00')
            .addFields(zlty.map((h, i) => ({ name: `Hráč č.${i + 1}`, value: h })));

        return interaction.reply({ embeds: [embed, embed2] });
    }
}
