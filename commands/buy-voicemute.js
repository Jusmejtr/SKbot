require('dotenv').config();

module.exports = {
    name: 'buy-voicemute',
    description: 'buy item to voice-mute someone',
    execute(message, db){
        const PREFIX = process.env.PREFIX;
        const admin = process.env.ADMIN_ROLE_ID;
        
        const { EmbedBuilder } = require('discord.js');

        if (message.content.startsWith(PREFIX + "buy voice-mute")) {
            //message.delete();
            var uzivatel = message.member.user.id;
            let args = message.content.split(" ");
            let clovek = message.mentions.users.first();

            let suma = args[3];
            if(isNaN(suma)) return message.reply("Musíš zadať platné číslo");
            suma = parseInt(suma);
            if(suma < 1 || suma > 10) return message.reply("Čas mutnutia musí byť 1-10 minút");
            if(!args[3] || args[3] == ' ') return message.reply("Musíš zadať čas");
            let cena = suma * 500;
            let kolko = suma * 60 * 1000;

            const mute_id = "784018915407560745";

            let embed = new EmbedBuilder()
            embed.setTitle("Voice-mute užívateľa");

            if (clovek) {
                let hrac = message.guild.members.resolve(clovek);
                if (hrac) {
                    if(clovek == message.author){
                        return message.reply("Nemôžeš voice mutnúť samého seba");
                    }
                    else if(hrac.roles.cache.has(admin)){
                        return message.reply("Nemôžeš voice mutnúť server admina");
                    }else if(hrac.roles.cache.get("662296220328525874")){
                        return message.reply("Nemôžeš mutnúť SKbota, ale on teba áno :)");
                    }else if(!hrac.roles.cache.get("790184496208150589")){
                        return message.reply("Nemôžeš voice mutnúť tohto užívateľa, pretože nemá vytvorený účet a tak by ti to nemohol vrátiť");
                    } else{
                        if(hrac.roles.cache.get(mute_id)){
                            return message.reply("Tento užívateľ už má voice mute");
                        }
                        else{
                            if(!hrac.voice.channel) return message.reply("Tento úživateľ nie je vo voice roomke a tak ho nemôžeš voice mutnúť");
                            db.collection('economy').doc(uzivatel).get().then((q) => {
                                if(q.exists){
                                    var hodnota = q.data().money;
                                    if(hodnota >= cena){
                                        hodnota -= cena;
                                        db.collection('economy').doc(uzivatel).update({
                                            'money': hodnota
                                        });
                                        embed.setDescription(`${message.author.tag}, Úspešne si voice-mutol hráča ${hrac} na ${suma} min`);
                                        message.reply({embeds: [embed]});
                                        hrac.voice.setMute(true);
                                        hrac.roles.add(mute_id);
                                        setTimeout(function(){
                                            hrac.voice.setMute(false).then((q) => {
                                                q.roles.remove(mute_id);
                                            });
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
