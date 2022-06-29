module.exports = {
    name: 'iq',
    description: 'generate random iq',
    execute(message, config){
        const PREFIX = (config.prefix);

        const { MessageEmbed } = require('discord.js');

        if (message.content === PREFIX + "iq") {
            let meno = message.member.user.tag;
            let cislo = Math.floor(Math.random() * 150) + 1;
            let embed = new MessageEmbed()
                .setTitle(`Tvoje IQ je ${cislo}`)
                .setColor(`#00ff00`)
    
            //message.delete();
            message.reply({ embeds: [embed]});
        }
    
    }
}