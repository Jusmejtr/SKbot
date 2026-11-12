const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Koľko máš coinov?')
        .addUserOption(o => o.setName('user').setDescription('Koľko coinov má iný užívateľ')),
    execute(interaction) {
        const iny = interaction.options.getUser('user');
        const user = iny ?? interaction.user;
        const money = db.getMoney(user.id);

        if (money === null) {
            return interaction.reply(iny ? `${user.username} nemá vytvorený účet` : 'Nemáš vytvorený účet. Vytvor si ho príkazom /createaccount');
        }
        return interaction.reply(iny ? `${user.username} má ${money} coinov` : `Máš ${money} coinov`);
    }
}
