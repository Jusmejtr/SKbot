require('dotenv').config();

module.exports = {
    name: 'otazka',
    description: 'anketa',
    execute(message){
        const PREFIX = process.env.PREFIX;
        
        const { EmbedBuilder } = require('discord.js');

        if(message.content.startsWith(PREFIX + "question")){
            let args = message.content.split(" ");
            let type = args[1];
            let question = message.content.split(" ").slice(2).join(" ");
            let embed = new EmbedBuilder();
            switch (type) {
                case 'thumb':
                        embed.setTitle(question)
                        embed.setColor(`#ffffff`)
                    message.delete();
                    message.channel.send({ embeds: [embed] }).then(reakcia => {
                        reakcia.react("👍");
                        reakcia.react("👎");
                    });
                    break;
                case 'mark':
                    embed.setTitle(question)
                    embed.setColor(`#ffffff`)
                    message.delete();
                    message.channel.send({ embeds: [embed] }).then(reakcia => {
                        reakcia.react("✅");
                        reakcia.react("❌");
                    });
                    break;
                default:
                    message.reply("wrong input");
                    break;
            }
        }

    }
}