require('dotenv').config();

module.exports = {
    name: 'removemoney',
    description: 'remove money to someone',
    execute(bot, message, db){
        const PREFIX = process.env.PREFIX;
        const admin = process.env.ADMIN_ROLE_ID;
        var hodnota=0;

        if (message.content.startsWith(PREFIX + "removemoney")) {
            let args = message.content.split(" ");
            let user = message.mentions.users.first();
            
            if (message.member.roles.cache.get(admin)) {
                if(!user) return message.reply("Nemôžem nájsť tohto užívateľa");
                if(!args[2]) return message.reply("Zadaj sumu, ktorú chces pripísať na účet");

                db.collection('economy').doc(user.id).get().then((q) => {
                    if(q.exists){
                        hodnota = q.data().money;
                        hodnota -= parseInt(args[2]);

                        db.collection('economy').doc(user.id).update({
                            'money': hodnota
                        }).catch(console.error);
                        message.reply(`Úspešne si odobral ${args[2]} coinov užívateľovi ${bot.users.cache.get(user.id).username}`);
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
