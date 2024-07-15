require('dotenv').config();

module.exports = {
    name: 'buy-mute',
    description: 'buy item to text-mute someone',
    execute(message, db){
        const PREFIX = process.env.PREFIX;
        const admin = process.env.ADMIN_ROLE_ID;
        
        const { EmbedBuilder } = require('discord.js');

        if (message.content.startsWith(PREFIX + "buy text-mute")) {
            //message.delete();
            var meno = message.member.user.username;
            var uzivatel = message.member.user.id;
            let args = message.content.split(" ");
            let clovek = message.mentions.users.first();

            let suma = args[3];
            if(isNaN(suma)) return message.reply("Musíš zadať platné číslo");
            suma = parseInt(suma);
            if(args[3] < 1 || args[3] > 120) return message.reply("Čas mutnutia musí byť 1-120 minút");
            if(!args[3] || args[3] == ' ') return message.reply("Musíš zadať čas");
            let cena = args[3] * 50;
            let kolko = suma * 60 * 1000;

            const mute_id = "686618345100935381";

            let embed = new EmbedBuilder()
            embed.setTitle("Text-mute užívateľa");

            if (clovek) {
                let hrac = message.guild.members.resolve(clovek);
                if (hrac) {
                    if(clovek == message.author){
                        return message.reply("Nemôžeš mutnúť samého seba");
                    }
                    else if(hrac.roles.cache.has(admin)){
                        return message.reply("Nemôžeš mutnúť server admina");
                    }else if(!hrac.roles.cache.get("790184496208150589")){
                        return message.reply("Nemôžeš mutnúť tohto užívateľa, pretože nemá vytvorený účet a tak by ti to nemohol vrátiť");
                    } else{
                        if(hrac.roles.cache.get(mute_id)){
                            return message.reply("Tento užívateľ už má mute");
                        }
                        else{
                            db.collection('economy').doc(uzivatel).get().then((q) => {
                                if(q.exists){
                                    var hodnota = q.data().money;
                                    if(hodnota >= cena){
                                        hodnota -= cena;
                                        db.collection('economy').doc(uzivatel).update({
                                            'money': hodnota
                                        });
                                        embed.setDescription(`${message.author.tag}, Úspešne si text-mutol hráča ${hrac} na ${args[3]} min`);
                                        message.reply({embeds:[embed]});
                                        hrac.roles.add(mute_id);
                                        setTimeout(function(){
                                            hrac.roles.remove(mute_id);
                                        }, kolko);
                                    }else{
                                        message.reply("Na tento nákup nemáš dostatok financií");
                                    }
                                }
                                else{
                                    message.reply("Nemáš vytvorený účet");
                                }
                            });
                        }
                    }
                } else {
                    message.reply("Tento užívateľ neexistuje");
                }
            } else {
                message.reply("Chybné údaje");
            }
            

        }
    }
}
