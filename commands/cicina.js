require('dotenv').config();

module.exports = {
    name: "cicina",
    description: "generate cicna",

    execute(message){
        const PREFIX = process.env.PREFIX;
        const { EmbedBuilder } = require('discord.js');

        if (message.content === PREFIX + "cicina") {
            let cislo = Math.floor(Math.random() * 30) + 0;
            let embed = new EmbedBuilder()
                .setTitle(`Veľkosť tvojej ciciny je ${cislo} cm aj v studenej vode.`)
                .setColor(`#0000ff`)
    
            let embed2 = new EmbedBuilder()
                .setTitle(`Nemáš cicinu.`)
                .setColor(`#0000ff`)
    
            if (cislo === 0) {
                message.reply({ embeds: [embed2]});
            }
            else {
                message.reply({ embeds: [embed]});
            }
        }
        
    }
}