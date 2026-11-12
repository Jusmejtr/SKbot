const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'cicina',
    data: new SlashCommandBuilder()
		.setName('cicina')
		.setDescription('Aká dlhá je tvoja cicina?'),
    execute(interaction){
        let cislo = Math.floor(Math.random() * 30) + 0;

        const embed = {
            title: (cislo == 0) ? 'Nemáš cicinu' : `Tvoja cicina má ${cislo} cm`,
            color: 0x0000ff
        };
        
        interaction.reply({ embeds: [embed] });
    }
}