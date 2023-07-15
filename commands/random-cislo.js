module.exports = {
    name: 'random-cislo',
    description: 'generate random number',
    execute(message, config){
        const PREFIX = (config.prefix);

        const { EmbedBuilder } = require('discord.js');

        if (message.content.startsWith(PREFIX + "nroll")) {
            let args = message.content.split(" ");
            let min = args[1];
            let max = args[2];
    
            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            let color = ((1 << 24) * Math.random() | 0).toString(16);
    
            let embed = new EmbedBuilder()
                .setTitle(getRandomInt(min, max).toString())
                .setColor(`#${color}`)
            if (isNaN(min)) {
                message.reply("Chybné údaje");
            }
            else if (isNaN(max)) {
                message.reply("Chybné údaje");
            }
            else {
                message.reply({embeds: [embed]});
            }
        }
    
    }
}