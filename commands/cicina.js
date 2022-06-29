module.exports = {
    name: "cicina",
    description: "generate cicna",

    execute(message, config){
        const PREFIX = (config.prefix);
        const { MessageEmbed } = require('discord.js');

        if (message.content === PREFIX + "cicina") {
            let meno = message.member.user.tag;
            let cislo = Math.floor(Math.random() * 30) + 0;
            let embed = new MessageEmbed()
                .setTitle(`Veľkosť tvojej ciciny je ${cislo} cm aj v studenej vode.`)
                .setColor(`#0000ff`)
    
            let embed2 = new MessageEmbed()
                .setTitle(`Nemáš cicinu.`)
                .setColor(`#0000ff`)
    
            //message.delete();
            if (cislo === 0) {
                message.reply({ embeds: [embed2]});
            }
            else {
                message.reply({ embeds: [embed]});
            }
        }
        
    }
}