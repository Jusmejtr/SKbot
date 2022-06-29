module.exports = {
    name: 'statistiky',
    description: 'statistiky na gamble',
    execute(bot, message, config, db){

        const PREFIX = (config.prefix);
        const { MessageEmbed } = require('discord.js');

        if (message.content.startsWith(PREFIX + "stats")) {
            //message.delete();
            let args = message.content.split(" ");
            if(!args[1]){
                var user = message.author;
            }
            else{
                var user = message.mentions.users.first();
            }
            if (user) {
                let hrac = message.guild.members.resolve(user);
                if (hrac) {
                    db.collection('statistiky').doc(hrac.id).get().then((q) => {
                        if(q.exists){
                            var glose = q.data().gamble_lose;
                            var gwin = q.data().gamble_win;
                            var prega = q.data().pregamblene;
                            var swin = q.data().suma_vyhra;
                            var slose = q.data().suma_prehra;
                            var giv = q.data().givnute;

                            var rozdiel = gwin - glose;

                            let embedreact = new MessageEmbed()
                                .setTitle(`GAMBLE ŠTATISTIKY`)
                                .setColor(`#ffff00`)
                                .setDescription(`${bot.users.cache.get(hrac.id).tag}`)
                                .addField("Celkovo pregemblených coinov", `${prega}`)
                                .addField("Počet výhier", `${gwin} [win/lose: ${rozdiel}]`)
                                .addField("Počet prehier", `${glose}`)
                                .addField("Počet vyhratých coinov", `${swin}`)
                                .addField("Počet prehratých coinov", `${slose}`)
                                .addField("Počet darovaných coinov", `${giv}`)
                                .setTimestamp()

                            message.reply({embeds: [embedreact]});
                        }
                        else{
                            message.reply(`Pre ${user.tag} nie sú dostupné štatistiky`);
                        }
                    });
                } else {
                    message.reply("Tento užívateľ neexistuje")
                }
            } else {
                message.reply("Chybné údaje");
            }
        }
    }
}