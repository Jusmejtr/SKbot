const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'cicina',
    data: new SlashCommandBuilder()
		.setName('cicina')
		.setDescription('How long is your cicina?'),
    execute(interaction){
        let cislo = Math.floor(Math.random() * 30) + 0;

        const embed = {
            title: (cislo == 0) ? `You don't have cicina` : `Your cicina has ${cislo} cm`,
            color: 0x0000ff
        };
        
        interaction.reply({ embeds: [embed] });
    }
}