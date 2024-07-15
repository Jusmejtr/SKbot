require('dotenv').config();

module.exports = {
    name: 'iq',
    description: 'generate random iq',
    execute(message){
        const PREFIX = process.env.PREFIX;
        const { EmbedBuilder } = require('discord.js');

        if (message.content === PREFIX + "iq") {
            let cislo = Math.floor(Math.random() * 150) + 1;
            let embed = new EmbedBuilder()
                .setTitle(`Tvoje IQ je ${cislo}`)
                .setColor(`#00ff00`)
    
            message.reply({ embeds: [embed]});
        }
    }
}