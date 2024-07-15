require('dotenv').config();

module.exports = {
    name: 'buy-name',
    description: 'buy color name',
    execute(bot, message, db){
        const PREFIX = process.env.PREFIX;
        const logs_channel = process.env.LOGS_CHANNEL_ID;
        
        const { EmbedBuilder } = require('discord.js');

        let uzivatel = message.author.id;

        if (message.content.startsWith(PREFIX + "buy colorname")){

            let args = message.content.split(" ");
            //message.delete();
            let farba;// ma #
            let farby;//nema #
            let kolko = args[3];
            if(!kolko || isNaN(kolko)) return message.reply("Nezadal si na ako dlho si chceš kúpiť farebné meno");
            kolko = parseInt(kolko);
            if(kolko < 1 || kolko > 14) return message.reply("Farebné meno si môžeš kúpiť na 1-14 dní");

            let embed = new EmbedBuilder()
                .setTitle("Nákup farebného mena")
                .setDescription(`${message.author.tag}, Úspešne si si kúpil farbu svojho mena na počet dní: ${kolko}`)

            let cena = 150;
            let nova_cena = cena * kolko;

            if(!args[2].startsWith('#')){
                return message.reply("Tvoja farba nezačína znakom #");
            }else if(!args[2]){
                return message.reply("Chybné údaje");
            }
            
            args.forEach(arg => {
               if(arg.startsWith('#')){
                   farba=arg;
               }
            });
            farby = farba.replace('#','');
            function hexadec (hex){
                return typeof hex === 'string' && hex.length === 6 && !isNaN(Number('0x' + hex));
            }
            if(message.guild.roles.cache.find(h => h.name === `${message.author.id}`)){
                return message.reply("Už máš farebné meno");
            }
            if(!farba) return message.reply("Nezadal si farbu");
            if(!hexadec(farby)) return message.reply("Tento hexadecimálny kód je zlý");
            if(farba === '#000000') return message.reply("Pre vybratie čierneho mena použi kód #000001 z dôvodu, že kód #000000 používa discord ako defaultnú farbu");

            db.collection('economy').doc(uzivatel).get().then((p) => {
                if(p.exists){
                    var hodnota = p.data().money;
                    if(hodnota >= nova_cena){
                        hodnota -= nova_cena;
                        db.collection('economy').doc(uzivatel).update({
                            'money': hodnota
                        });
                        bot.channels.cache.get(logs_channel).send(`${message.author.tag} si kupil farebne meno na ${kolko}`);
                        let numbersOfRoles = message.guild.roles.cache.size;
                        numbersOfRoles -= 2;
                        message.guild.roles.create({
                            name : message.author.id,
                            color : farba,
                            position: numbersOfRoles,
                         })
                         .then(() => {
                            let najdi = message.guild.roles.cache.find(r => r.name === `${message.author.id}`);
                            message.member.roles.add(najdi);
                            let cas = Date.now();
                            let novy_cas = 86400000 * kolko;
                            let dokedy = Date.now() + novy_cas;
                            db.collection('nakupy').doc(`${message.author.id}`).set({
                               'meno': message.author.tag,
                               'ID': message.author.id,
                               'casnakupu': cas,
                               'platnostnakupu': dokedy,
                               'typnakupu': 'meno',
                            });
                            return message.reply({embeds:[embed]});
                        }).catch(console.error);
                    }else{
                        message.reply("Na tento nákup nemáš dostatok financií");
                    }
                }
                else{
                    message.reply("Nemáš vytvorený účet");
                }
            });
        }

        if(message.content === PREFIX + "delete colorname"){
            //message.delete();
            if(message.guild.roles.cache.find(h => h.name === `${message.author.id}`)){
                let rola = message.guild.roles.cache.find(g => g.name === message.author.id).delete();
                db.collection('nakupy').doc(message.author.id).delete();
                return message.reply("Úspešne si si vymazal svoje farebné meno");
            }else{
                return message.reply("Nemáš kúpené farebné meno");
            }
        }

    }
}
