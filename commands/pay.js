module.exports = {
    name: 'pay',
    description: 'transfer money to someone',
    execute(message, config, db){

        const PREFIX = (config.prefix);
        if (message.content.startsWith(PREFIX + "transfer")) {
            //message.delete();
            let args = message.content.split(" ");
            let user = message.author;
            if(!args[1]){
                return message.reply("musíš zadať komu chceš coiny previesť");
            }
            else{
                var uzivatel = message.mentions.users.first();
            }
            if(!args[2]) return message.reply("musíš zadať sumu ktorú chceš previesť");
            if(isNaN(args[2])) return message.reply("Nesprávny formát čísla");

            if (uzivatel) {
                let hrac = message.guild.members.resolve(uzivatel);
                if (hrac) {
                    if(hrac == message.author) return message.reply("Nemôžeš previesť sám sebe coiny");
                    db.collection('economy').doc(user.id).get().then((q) => {
                        if(q.exists){
                            var hodnota = q.data().money;
                            if(parseInt(args[2]) > hodnota) return message.reply("Nemáš toľko peňazí na prevedenie");
                            if(parseInt(args[2]) < 10) return message.reply("Musíš minimálne previesť 10 coinov");
                            db.collection('economy').doc(uzivatel.id).get().then((g) => {
                                if(!g.exists){
                                    return message.reply("Užívateľ komu chceš poslať coiny nemá účet");
                                } else{
                                    db.collection('statistiky').doc(message.author.id).get().then((uj) => {
                                        let suma = uj.data().givnute;
                                        suma += parseInt(args[2]);
                                        db.collection('statistiky').doc(message.author.id).update({
                                            'givnute': suma
                                        });
                                        var peniazky = g.data().money;
                                        peniazky += parseInt(args[2]);
                                        db.collection('economy').doc(uzivatel.id).update({
                                            'money': peniazky
                                        });
                                        hodnota -= parseInt(args[2]);
                                        db.collection('economy').doc(user.id).update({
                                            'money': hodnota
                                        });
                                        message.reply(`Úspešne si previedol ${args[2]} coinov užívateľovi ${uzivatel.tag}`);
                                    });
                                }
                            });
                        }
                        else{
                            message.reply(`nemáš vytvorený účet`);
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