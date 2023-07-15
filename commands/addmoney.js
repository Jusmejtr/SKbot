module.exports = {
    name: 'addmoney',
    description: 'add money to someone',
    execute(bot, message, config, db){
        const PREFIX = (config.prefix);
        const admin = (config.admin);
        var hodnota=0;

        if (message.content.startsWith(PREFIX + "addmoney")) {
            let args = message.content.split(" ");
            let user = message.mentions.users.first();
            //message.delete();
            if (message.member.roles.cache.get(admin)) {
                if(!user) return message.reply("Nemôžem nájsť tohto užívateľa");
                if(!args[2]) return message.reply("Zadaj sumu, ktorú chces pripísať na účet");

                db.collection('economy').doc(user.id).get().then((q) => {
                    if(q.exists){
                        hodnota = q.data().money;
                        hodnota += parseInt(args[2]);

                        db.collection('economy').doc(user.id).update({
                            'money': hodnota
                        }).catch(console.error);
                        message.reply(`Úspešne si pridal ${args[2]} coinov užívateľovi ${bot.users.cache.get(user.id).username}`);
                    }
                    else{
                        message.reply(`${user.tag} nemá vytvorený účet`);
                    }
                }).catch(console.error);
            }
            else{
                message.reply("Na tento príkaz nemáš práva");
            }
        }
    }
}
