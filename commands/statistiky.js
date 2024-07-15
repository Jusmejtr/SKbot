require('dotenv').config();

module.exports = {
    name: 'statistiky',
    description: 'statistiky na gamble',
    execute(bot, message, db){

        const PREFIX = process.env.PREFIX;
        
        const { EmbedBuilder } = require('discord.js');

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

                            let embedreact = new EmbedBuilder()
                                .setTitle(`GAMBLE ŠTATISTIKY`)
                                .setColor(`#ffff00`)
                                .setDescription(`${bot.users.cache.get(hrac.id).tag}`)
                                .addFields(
                                    {name: 'Celkovo pregemblených coinov', value: prega.toString()},
                                    {name: 'Počet výhier', value: `${gwin} [win/lose: ${rozdiel}]`},
                                    {name: 'Počet prehier', value: glose.toString()},
                                    {name: 'Počet vyhratých coinov', value: swin.toString()},
                                    {name: 'Počet prehratých coinov', value: slose.toString()},
                                    {name: 'Počet darovaných coinov', value: giv.toString()}
                                )
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