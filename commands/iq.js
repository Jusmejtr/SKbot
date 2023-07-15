module.exports = {
    name: 'iq',
    description: 'generate random iq',
    execute(message, config){
        const PREFIX = (config.prefix);
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