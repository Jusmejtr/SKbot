const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const ROOMKY = ['472823396674174986', '476403298505850891', '760055283451035719', '682975722146758747', '472841212664086529', '476110496357941252', '476110732635930624'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Prehádže ťa cez všetky voice roomky a vráti späť'),
    async execute(interaction) {
        const roomka = interaction.member.voice.channel;
        if (!roomka) return interaction.reply({ content: 'Musíš byť vo voice roomke', flags: MessageFlags.Ephemeral });

        await interaction.reply({ files: ['./emotes/move.gif'] });
        for (const id of ROOMKY) {
            await interaction.member.voice.setChannel(id).catch(console.error);
        }
        await interaction.member.voice.setChannel(roomka).catch(console.error);
    }
}
