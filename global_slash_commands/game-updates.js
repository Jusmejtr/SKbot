const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const db = require('../utils/db');
const config = require('../config');

const ano = '✅';
const nie = '❌';
const gameChoices = config.games.map(g => ({ name: g.name, value: g.code }));
const getGame = (code) => config.games.find(g => g.code === code);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-updates')
        .setDescription('Nastavenie upozornení na updaty hier zo Steamu')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(s => s.setName('list').setDescription('Ukáže, ktoré hry posielajú updaty a kam'))
        .addSubcommand(s => s.setName('setup').setDescription('Táto roomka bude dostávať updaty vybranej hry')
            .addStringOption(o => o.setName('game').setDescription('Hra').setRequired(true).addChoices(...gameChoices)))
        .addSubcommand(s => s.setName('remove').setDescription('Vypne updaty vybranej hry')
            .addStringOption(o => o.setName('game').setDescription('Hra').setRequired(true).addChoices(...gameChoices))),

    execute(interaction) {
        const guildId = interaction.guild.id;
        const sub = interaction.options.getSubcommand();

        if (sub === 'list') {
            const kanaly = new Map(db.getGameChannelsForGuild(guildId).map(r => [r.game, r.channel_id]));
            const embed = new EmbedBuilder()
                .setTitle('GAME UPDATES')
                .setColor('#17A7F5')
                .addFields(config.games.map(g => kanaly.has(g.code)
                    ? { name: `${g.name} ${ano}`, value: `<#${kanaly.get(g.code)}>` }
                    : { name: g.name, value: nie }));
            return interaction.reply({ embeds: [embed] });
        }

        const game = getGame(interaction.options.getString('game'));
        if (sub === 'setup') {
            db.setGameChannel(guildId, game.code, interaction.channel.id);
            return interaction.reply(`Hra **${game.name}** bola pridaná.\nDo tejto roomky budú chodiť upozornenia, keď vyjde nový update.`);
        }

        if (!db.removeGameChannel(guildId, game.code)) {
            return interaction.reply({ content: 'Túto hru ešte nemáš nastavenú.', flags: MessageFlags.Ephemeral });
        }
        return interaction.reply(`Hra **${game.name}** bola odstránená, updaty už nebudú chodiť.`);
    }
};
