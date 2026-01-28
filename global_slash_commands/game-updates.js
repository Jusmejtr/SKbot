const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const FieldValue = require('firebase-admin').firestore.FieldValue;

const ano = '✅';
const nie = '❌';

const GAMES = [
    { code: 'dbd', name: 'Dead by Daylight', field: 'dbd_channel' },
    { code: 'ets', name: 'Euro Truck Simulator 2', field: 'ets_channel' },
    { code: 'slapshot', name: 'Slapshot: Rebound', field: 'slapshot_channel' },
];

const getGameByCode = (code) => GAMES.find(g => g.code === code);
const getGameChoices = () => GAMES.map(g => ({ name: g.name, value: g.code }));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-updates')
        .setDescription('Manage game update notifications')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Shows actual game update list'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set this channel to receive game updates')
                .addStringOption(option =>
                    option.setName('game')
                        .setDescription('The game to receive updates for')
                        .setRequired(true)
                        .addChoices(...getGameChoices())))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Disable receiving game updates')
                .addStringOption(option =>
                    option.setName('game')
                        .setDescription('The game to stop receiving updates for')
                        .setRequired(true)
                        .addChoices(...getGameChoices())))
        .addSubcommand(subcommand =>
            subcommand
                .setName('game-codes')
                .setDescription('Shows game codes for setup command')),

    async execute(interaction, db) {
        const subcommand = interaction.options.getSubcommand();
        const serverId = interaction.guild.id;

        switch (subcommand) {
            case 'list':
                await showList(interaction, db, serverId);
                break;
            case 'setup':
                await setupGame(interaction, db, serverId);
                break;
            case 'remove':
                await removeGame(interaction, db, serverId);
                break;
            case 'game-codes':
                await showGameCodes(interaction);
                break;
        }
    }
};

async function showList(interaction, db, serverId) {
    let embed = new EmbedBuilder()
        .setTitle('GAME UPDATES LIST')
        .setColor('#17A7F5');

    try {
        const doc = await db.collection('global-updates').doc(serverId).get();
        const data = doc.exists ? doc.data() : {};

        for (const game of GAMES) {
            const channel = data[game.field];
            if (!channel) {
                embed.addFields({ name: game.name, value: nie });
            } else {
                embed.addFields({ name: `${game.name} ${ano}`, value: `<#${channel}>` });
            }
        }

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.log("Error getting document:", error);
        await interaction.reply({ content: 'An error occurred while fetching the list.', flags: MessageFlags.Ephemeral });
    }
}

async function setupGame(interaction, db, serverId) {
    const gameCode = interaction.options.getString('game');
    const game = getGameByCode(gameCode);
    const channelId = interaction.channel.id;
    const databaza = db.collection('global-updates').doc(serverId);

    try {
        const doc = await databaza.get();
        const updateData = { [game.field]: channelId };

        if (doc.exists) {
            await databaza.update(updateData);
        } else {
            await databaza.set(updateData);
        }

        await interaction.reply(`You have successfully added **${game.name}** game to the list.\nThis channel will receive notifications when an update is released.`);
    } catch (error) {
        console.log("Error setting up game:", error);
        await interaction.reply({ content: 'An error occurred while setting up the game.', flags: MessageFlags.Ephemeral });
    }
}

async function removeGame(interaction, db, serverId) {
    const gameCode = interaction.options.getString('game');
    const game = getGameByCode(gameCode);
    const databaza = db.collection('global-updates').doc(serverId);

    try {
        const doc = await databaza.get();

        if (!doc.exists) {
            return interaction.reply({ content: "You didn't setup this game yet.", flags: MessageFlags.Ephemeral });
        }

        const data = doc.data();
        if (!data[game.field]) {
            return interaction.reply({ content: "You didn't setup this game yet.", flags: MessageFlags.Ephemeral });
        }

        await databaza.update({
            [game.field]: FieldValue.delete()
        });

        await interaction.reply(`You have successfully removed **${game.name}** game from the list.\nThis channel will not receive notifications when an update is released.`);
    } catch (error) {
        console.log("Error removing game:", error);
        await interaction.reply({ content: 'An error occurred while removing the game.', flags: MessageFlags.Ephemeral });
    }
}

async function showGameCodes(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Game Codes')
        .setColor('#ff0000')
        .addFields(
            GAMES.map(g => ({
                name: g.name,
                value: `code: ${g.code} (usage: /game-updates setup game:${g.code})`
            }))
        );

    await interaction.reply({ embeds: [embed] });
}