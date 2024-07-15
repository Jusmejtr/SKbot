require('dotenv').config();

module.exports = {
    name: 'gamble',
    description: 'gamble with your coins',
    execute(message, db){
        const PREFIX = process.env.PREFIX;
        const vip = process.env.VIP_ROLE_ID;
        const admin = process.env.ADMIN_ROLE_ID;
        const helper = process.env.MODERATOR_ROLE_ID;
        const sbs = process.env.SBS_ROLE_ID;
        
        const { EmbedBuilder } = require('discord.js');

        if(message.content.startsWith(PREFIX + "gamble")){
            //message.delete();

            var uzivatel = message.member.user.id;
            let args = message.content.split(" ");
            if(!args[1]) return message.reply("nezadal si čiastku stávky");
            if(isNaN(args[1])) return message.reply("Musíš zadať číslo");
            try{
                var bet = parseInt(args[1]);
            }catch{
                return message.reply("musíš zadať celé číslo");
            }
            if(bet < 5) return message.reply("Nemôžeš staviť menej ako 5 coinov");
    
            db.collection('economy').doc(uzivatel).get().then((h) => {
                if(h.exists){
                    var hodnota = h.data().money;
                    if(hodnota >=0){
                        if(hodnota < bet) return message.reply("nemáš toľko peňazí");

                        //19 / 11 / 8 
                        let moznosti = ["l", "w", "l", "w", "l", "w", "l", "w", "l", "w", "l", "w", "l", "w", "l", "w", "l", "l", "l"];
                        var vyber = moznosti[Math.floor(Math.random() * moznosti.length)];

                        db.collection('statistiky').doc(message.author.id).get().then((ia) => {
                            var lose = ia.data().gamble_lose;
                            var win = ia.data().gamble_win;
                            var pregamble = ia.data().pregamblene;
                            var suma_win = ia.data().suma_vyhra;
                            var suma_lose = ia.data().suma_prehra;
                        

                            if(vyber == "w"){
                                hodnota += bet;
                                db.collection('economy').doc(uzivatel).update({
                                    'money': hodnota
                                });
                                pregamble+=bet;
                                win+=1;
                                suma_win+=bet;
                                db.collection('statistiky').doc(message.author.id).update({
                                    'pregamblene': pregamble,
                                    'gamble_win': win,
                                    'suma_vyhra': suma_win
                                });
                                let embed = new EmbedBuilder()
                                    .setTitle("GAMBLE")
                                    .setColor("821e64")
                                    .addFields({name: "stávka", value: bet.toString()})
                                    .setDescription(`${message.author.tag}, vyhral si ${bet+bet} coinov. Aktuálne máš ${hodnota}`)
                                    .setThumbnail('https://i.imgur.com/wBXMggF.png')
                                message.reply({embeds:[embed]});
                            }
                            else if(vyber == "l"){
                                hodnota -= bet;
                                db.collection('economy').doc(uzivatel).update({
                                    'money': hodnota
                                });
                                pregamble+=bet;
                                lose+=1;
                                suma_lose+=bet;
                                db.collection('statistiky').doc(message.author.id).update({
                                    'pregamblene': pregamble,
                                    'gamble_lose': lose,
                                    'suma_prehra': suma_lose
                                });
                                let embed2 = new EmbedBuilder()
                                    .setTitle("GAMBLE")
                                    .setColor("821e64")
                                    .setDescription(`${message.author.tag}, prehral si ${bet} coinov. Aktuálne máš ${hodnota}`)
                                    .setThumbnail('https://i.imgur.com/gqvSC7x.png')
                                    message.reply({embeds:[embed2]});

                            }
                            else{
                                message.channel.send("Nastala chyba");
                            }
                        });
                    }
                    else{
                        return message.reply("nemáš žiadne coiny");
                    }
                }
                else{
                    return message.reply("Najprv si musíš vytvoriť účet príkazom *createaccount");
                }
            });

        }

        if(message.content === PREFIX + "all in"){
            //message.delete();
            var uzivatel = message.member.user.id;

            if(message.member.roles.cache.get(vip) || message.member.roles.cache.get(helper) || message.member.roles.cache.get(sbs) || message.member.roles.cache.get(admin)){
                db.collection('economy').doc(uzivatel).get().then((a) => {
                    if(!a.exists) return message.reply("Nemáš vytvorený účet");
                    var peniazky = a.data().money;
                    let coiny = a.data().money;
                    if(!peniazky>0) return message.reply("Nemáš žiadne coiny");

                    let embed3 = new EmbedBuilder()
                        .setTitle("GAMBLE (All in)")
                        .setColor("821e64")
                        .setDescription(`${message.author.tag}, Naozaj chceš staviť ${peniazky} coinov?`)

                    message.channel.send({embeds:[embed3]}).then(reakcia => {
                    
                        reakcia.react("✅");
                        reakcia.react("❌");

                        const filter = (reaction, user) => {
                            return (
                            ["✅", "❌"].includes(reaction.emoji.name) &&
                            user.id === message.author.id
                            );
                        };
                    
                        const collector = reakcia.createReactionCollector({ filter, max:1, time: 7000 });

                        collector.on('collect', (reaction, user) => {
                            
                            if (reaction.emoji.name === "✅") {
                                let moznosti = ["vyhral si", "prehral si"];
                                var vyber = moznosti[Math.floor(Math.random() * moznosti.length)];

                                db.collection('statistiky').doc(message.author.id).get().then((ia) => {
                                    var lose = ia.data().gamble_lose;
                                    var win = ia.data().gamble_win;
                                    var pregamble = ia.data().pregamblene;
                                    var suma_win = ia.data().suma_vyhra;
                                    var suma_lose = ia.data().suma_prehra;
                                

                                    if(vyber == "vyhral si"){
                                        peniazky += peniazky;
                                        db.collection('economy').doc(uzivatel).update({
                                            'money': peniazky
                                        });
                                        pregamble+=coiny;
                                        win+=1;
                                        suma_win+=coiny;
                                        db.collection('statistiky').doc(message.author.id).update({
                                            'pregamblene': pregamble,
                                            'gamble_win': win,
                                            'suma_vyhra': suma_win
                                        });
                                        let embed = new EmbedBuilder()
                                            .setTitle("GAMBLE (All in)")
                                            .setColor("821e64")
                                            .addFields({name: "stávka", value: coiny.toString()})
                                            .setDescription(`${message.author.tag}, vyhral si ${peniazky} coinov. Aktuálne máš ${peniazky}`)
                                            .setThumbnail('https://i.imgur.com/wBXMggF.png')
                                        return message.reply({embeds:[embed]});
                                    }
                                    else if(vyber == "prehral si"){
                                        peniazky -= peniazky;
                                        db.collection('economy').doc(uzivatel).update({
                                            'money': peniazky
                                        });
                                        pregamble+=coiny;
                                        lose+=1;
                                        suma_lose+=coiny;
                                        db.collection('statistiky').doc(message.author.id).update({
                                            'pregamblene': pregamble,
                                            'gamble_lose': lose,
                                            'suma_prehra': suma_lose
                                        });
                                        let embed2 = new EmbedBuilder()
                                            .setTitle("GAMBLE (All in)")
                                            .setColor("821e64")
                                            .setDescription(`${message.author.tag}, prehral si ${coiny} coinov. Aktuálne máš ${peniazky}`)
                                            .setThumbnail('https://i.imgur.com/gqvSC7x.png')
                                        return message.reply({embeds:[embed2]});

                                    }
                                    else{
                                        return message.channel.send("Nastala chyba");
                                    }
                                });
                            }else if(reaction.emoji.name === '❌'){
                                return message.reply("Stávka zrušená");
                            }
                        });
                        collector.on('end', collected => {
                            if(collected.size == 0) return message.reply("Nestihol si pridať reakciu");
                        });
                    });
                });
            }else{
              message.reply("Tento príkaz je len pre VIP");
          }
        }
    }
}
