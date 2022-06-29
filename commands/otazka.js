module.exports = {
    name: 'otazka',
    description: 'anketa',
    execute(message, config){
        const PREFIX = (config.prefix);
        const { MessageEmbed } = require('discord.js');

        if (message.content.startsWith(PREFIX + "otazka")) {
            let args = message.content.split("°");
            let ot = args[1];
            let embedreact = new MessageEmbed()
                .setTitle(`${ot}`)
                .setColor(`#ffffff`)
            message.delete();
            message.channel.send({ embeds: [embedreact] }).then(reakcia => {
                reakcia.react("👍");
                reakcia.react("👎");
            });
        }
        if (message.content.startsWith(PREFIX + "2otazka")) {
            let args = message.content.split("°");
            let ot = args[1];
            let embedreact = new MessageEmbed()
                .setTitle(`${ot}`)
                .setColor(`#ffffff`)
            message.delete();

            message.channel.send({ embeds: [embedreact] }).then(reakcia => {
                reakcia.react("✅");
                reakcia.react("❌");
            });
        }

    }
}