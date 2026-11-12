const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { addMoney, removeMoney } = require('../utils/economy-db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('money')
        .setDescription('Pridá alebo odoberie coiny užívateľovi (admin)')
        .addStringOption(o => o.setName('action').setDescription('Čo chceš urobiť').setRequired(true)
            .addChoices(
                { name: 'Pridať coiny', value: 'add' },
                { name: 'Odobrať coiny', value: 'remove' }
            ))
        .addUserOption(o => o.setName('user').setDescription('Užívateľ').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('Suma').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
            return interaction.reply({ content: 'Na tento príkaz nemáš práva', flags: MessageFlags.Ephemeral });
        }
        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        await interaction.deferReply();
        const result = action === 'add' ? await addMoney(user.id, amount) : await removeMoney(user.id, amount);
        if (!result) return interaction.editReply(`${user.tag} nemá vytvorený účet`);

        return interaction.editReply(action === 'add'
            ? `Úspešne si pridal ${amount} coinov užívateľovi ${user.username}`
            : `Úspešne si odobral ${amount} coinov užívateľovi ${user.username}`);
    }
}
