const { SlashCommandBuilder, MessageFlags } = require('discord.js');

// CS2 map pooly – aktualizované podľa Premier Season 5 (8. 7. 2026: Cache nahradil Overpass v Active Duty)
const MAP_POOLS = {
    active: {
        nazov: 'active duty / premier',
        mapy: ['Ancient', 'Anubis', 'Cache', 'Dust II', 'Inferno', 'Mirage', 'Nuke'],
    },
    competitive: {
        nazov: 'kompetetívne mapy',
        mapy: ['Ancient', 'Anubis', 'Cache', 'Dust II', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Train', 'Vertigo', 'Office', 'Italy', 'Boulder', 'Fachwerk', 'Shelter'],
    },
    wingman: {
        nazov: 'wingman mapy',
        mapy: ['Nuke', 'Vertigo', 'Overpass', 'Inferno', 'Poseidon', 'Debris', 'El Dorado'],
    },
};

const nahodna = (zoznam) => zoznam[Math.floor(Math.random() * zoznam.length)];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Vyberie náhodnú CS2 mapu')
        .addStringOption(o => o.setName('pool').setDescription('Z ktorého map poolu').setRequired(true)
            .addChoices(
                { name: 'Active Duty / Premier', value: 'active' },
                { name: 'Competitive', value: 'competitive' },
                { name: 'Wingman', value: 'wingman' },
                { name: 'Vlastný zoznam', value: 'custom' }
            ))
        .addStringOption(o => o.setName('maps').setDescription('Pre vlastný zoznam: mapy oddelené medzerou alebo čiarkou (napr. mirage inferno nuke)')),
    async execute(interaction) {
        const pool = interaction.options.getString('pool');

        if (pool === 'custom') {
            const vstup = interaction.options.getString('maps');
            const mapy = (vstup ?? '').split(/[\s,]+/).filter(Boolean);
            if (mapy.length < 2) {
                return interaction.reply({ content: 'Zadaj aspoň 2 mapy v možnosti `maps` (napr. mirage inferno nuke)', flags: MessageFlags.Ephemeral });
            }
            return interaction.reply(`${nahodna(mapy)} (z: ${mapy.join(', ')})`);
        }

        const { nazov, mapy } = MAP_POOLS[pool];
        return interaction.reply(`${nahodna(mapy)} (${nazov})`);
    }
}
