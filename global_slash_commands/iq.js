const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'iq',
    data: new SlashCommandBuilder()
		.setName('iq')
		.setDescription('Whats your IQ?'),
    execute(interaction){
        let cislo = Math.floor(Math.random() * 150) + 1;

        const embed = {
            title: `Your IQ is ${cislo}`,
            color: 0x00ff00
        };
        
        interaction.reply({ embeds: [embed] });
    }
}