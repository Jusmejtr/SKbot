const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../utils/db');
const config = require('../config');

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
    execute(interaction) {
        if (!interaction.member.roles.cache.has(config.roles.admin)) {
            return interaction.reply({ content: 'Na tento príkaz nemáš práva', flags: MessageFlags.Ephemeral });
        }
        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const ok = action === 'add' ? db.addMoney(user.id, amount) : db.adminRemoveMoney(user.id, amount);
        if (!ok) return interaction.reply(`${user.tag} nemá vytvorený účet`);

        const stav = db.getMoney(user.id);
        return interaction.reply(action === 'add'
            ? `Úspešne si pridal ${amount} coinov užívateľovi ${user.username} (teraz má ${stav})`
            : `Úspešne si odobral coiny užívateľovi ${user.username} (teraz má ${stav})`);
    }
}
