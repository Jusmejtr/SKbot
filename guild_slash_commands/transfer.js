const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/db');

const CHYBY = {
    no_account: 'Nemáš vytvorený účet',
    target_no_account: 'Užívateľ komu chceš poslať coiny nemá účet',
    insufficient: 'Nemáš toľko peňazí na prevedenie',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Prevedie coiny inému užívateľovi')
        .addUserOption(o => o.setName('user').setDescription('Komu chceš coiny previesť').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('Suma (minimálne 10)').setRequired(true).setMinValue(10)),
    execute(interaction) {
        const prijemca = interaction.options.getUser('user');
        const suma = interaction.options.getInteger('amount');

        if (prijemca.id === interaction.user.id) return interaction.reply('Nemôžeš previesť sám sebe coiny');
        if (prijemca.bot) return interaction.reply('Botovi nemôžeš previesť coiny');

        const result = db.transfer(interaction.user.id, prijemca.id, suma);
        if (result !== 'ok') return interaction.reply(CHYBY[result]);
        return interaction.reply(`Úspešne si previedol ${suma} coinov užívateľovi ${prijemca.tag}`);
    }
}
