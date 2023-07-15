module.exports = {
    name: 'buy-vip',
    description: 'buy items',
    execute(bot, message, config, db){
        const PREFIX = (config.prefix);
        const vip = (config.vip);
        
        const { EmbedBuilder } = require('discord.js');

        if (message.content.startsWith(PREFIX + "buy vip")){
            //message.delete();
            let args = message.content.split(" ");
            var meno = message.member.user.username;
            var uzivatel = message.author.id;

            let kolko = args[2];
            if(!kolko || isNaN(kolko)) return message.reply("Nezadal si na ako dlho si chceš kúpiť VIP");
            kolko = parseInt(kolko);
            if(kolko < 1 || kolko > 14) return message.reply("VIP si môžeš kúpiť na 1-14 dní");


            let embed = new EmbedBuilder()
                .setTitle("Nákup VIP")
                .setDescription(`${meno}, Úspešne si si kúpil VIP na počet dní: ${kolko}`)

            let cena3 = 250;
            let nova_cena = cena3 * kolko;

            if(message.member.roles.cache.get(vip)) return message.reply("už máš VIP");


            db.collection('economy').doc(uzivatel).get().then((d) => {
                if(d.exists){
                    var hodnota = d.data().money;
                    if(hodnota >= nova_cena){
                        hodnota -= nova_cena;
                        db.collection('economy').doc(uzivatel).update({
                            'money': hodnota
                        });
                        message.member.roles.add(vip);
                        bot.channels.cache.get("686650199904616456").send(`${message.author.tag} si kupil vip na ${kolko}`);

                        let cas = Date.now();
                        let novy_cas = 86400000 * kolko;
                        let dokedy = Date.now() + novy_cas;
                        db.collection('nakupy2').doc(`${message.author.id}`).set({
                            'meno': message.author.tag,
                            'ID': message.author.id,
                            'casnakupu': cas,
                            'platnostnakupu': dokedy,
                            'typnakupu': 'vip',
                        });
                        db.collection('web').doc(message.author.tag).get().then((a) => {
                            if(a.exists){
                                db.collection('web').doc(message.author.tag).update({
                                    "rola": "VIP",
                                });
                            }else{
                                return;
                            }
                        });
                        return message.reply({embeds:[embed]});
                    } else{
                        message.reply("Na tento nákup nemáš dostatok financií");
                    }
                }
                else{
                    message.reply("Nemáš vytvorený účet");
                }

            });

        }

    }
}
