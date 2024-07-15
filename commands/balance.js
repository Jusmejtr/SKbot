require('dotenv').config();

module.exports = {
    name: 'balance',
    description: 'money command',
    execute(bot, message, db){

        const PREFIX = process.env.PREFIX;
        if (message.content.startsWith(PREFIX + "balance")) {
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
                    db.collection('economy').doc(user.id).get().then((q) => {
                        if(!q.exists){
                            message.reply(`${user.tag} nemá vytvorený účet`);
                        }else{
                            var hodnota = q.data().money;
                            message.reply(`${bot.users.cache.get(user.id).username} má ${hodnota} coinov`);
                        }
                    });
                } else {
                    message.reply("Tento užívateľ neexistuje");
                }
            } else {
                message.reply("Chybné údaje");
            }
        }
    }
}