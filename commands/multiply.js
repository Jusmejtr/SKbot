module.exports = {
    name: "multiply",
    description: "multiply your coins",

    execute(message, config, db){
        const PREFIX = (config.prefix);
        const botspam = (config.botspamID);

        const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

        if(message.content.startsWith(PREFIX + "multiply")){
            //message.delete();

            if(message.channel.id == 786141470963793942 || message.channel.id == 635918396596289536){
                return message.reply(`Tento text channel nie je určený na multiply. Použi: <#${botspam}>`);
            }

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

                db.collection('economy').doc(uzivatel).get().then((a) => {
                    if(!a.exists) return message.reply("Nemáš vytvorený účet");
                    let hodnota = a.data().money;
                    var peniazky = a.data().money;
                    if(hodnota < bet) return message.reply("nemáš toľko peňazí");

                    let embed3 = new MessageEmbed()
                        .setTitle("Multiply")
                        .setColor("821e64")
                        .setDescription(`${message.author.tag}, vyber si násobiteľ`)
                        .addField("stávka", `${bet}`)

                    //message.channel.send({embeds: [embed3]}).then(reakcia => {
                    

                        // reakcia.react('3️⃣');
                        // reakcia.react('4️⃣');
                        // reakcia.react('5️⃣');
                        // reakcia.react("❌");

                        const filter = i => i.user.id === message.author.id;
                            
                        const tlacidla = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                    .setCustomId('3x')
                                    .setLabel('3X')
                                    .setStyle('PRIMARY')
                                )
                                .addComponents(
                                    new MessageButton()
                                    .setCustomId('4x')
                                    .setLabel('4X')
                                    .setStyle('PRIMARY')
                                )
                                .addComponents(
                                    new MessageButton()
                                    .setCustomId('5x')
                                    .setLabel('5X')
                                    .setStyle('PRIMARY')
                                )
                                .addComponents(
                                    new MessageButton()
                                    .setCustomId('close')
                                    .setLabel("Zrušiť")
                                    .setStyle('DANGER')
                                )

                        message.reply({ embeds: [embed3], components: [tlacidla]}).then(reakcia => {

                        
                            const collector = reakcia.createMessageComponentCollector({ filter, max:1, time: 7000 });
                            function getRandomInt(min, max) {
                                min = Math.ceil(min);
                                max = Math.floor(max);
                                return Math.floor(Math.random() * (max - min + 1)) + min;
                            }
                            collector.on('collect', reaction => {
                                reaction.deferUpdate();
                                if (reaction.customId == '3x') {
                                    let rcislo = getRandomInt(1,100);

                                    db.collection('statistiky').doc(message.author.id).get().then((ia) => {
                                        var pregamble = ia.data().pregamblene;
                                        var suma_win = ia.data().suma_vyhra;
                                        var suma_lose = ia.data().suma_prehra;
                                    
                                        if(rcislo <= 26){
                                            peniazky += bet*3;
                                            db.collection('economy').doc(uzivatel).update({
                                                'money': peniazky
                                            });
                                            pregamble+=bet;
                                            suma_win+=bet*3;
                                            db.collection('statistiky').doc(message.author.id).update({
                                                'pregamblene': pregamble,
                                                'suma_vyhra': suma_win
                                            });
                                            let embed = new MessageEmbed()
                                                .setTitle("Multiply 3-násobok")
                                                .setColor("821e64")
                                                .addField("stávka", `${bet}`)
                                                .setDescription(`${message.author.tag}, vyhral si ${bet+bet+bet} coinov. Aktuálne máš ${peniazky}`)
                                                .setThumbnail('https://i.imgur.com/wBXMggF.png')
                                            return message.reply({embeds: [embed]});
                                        }
                                        else{
                                            peniazky -= bet;
                                            db.collection('economy').doc(uzivatel).update({
                                                'money': peniazky
                                            });
                                            pregamble+=bet;
                                            suma_lose+=bet;
                                            db.collection('statistiky').doc(message.author.id).update({
                                                'pregamblene': pregamble,
                                                'suma_prehra': suma_lose
                                            });
                                            let embed2 = new MessageEmbed()
                                                .setTitle("Multiply 3-násobok")
                                                .setColor("821e64")
                                                .setDescription(`${message.author.tag}, prehral si ${bet} coinov. Aktuálne máš ${peniazky}`)
                                                .setThumbnail('https://i.imgur.com/gqvSC7x.png')
                                                return message.reply({embeds: [embed2]});
                                            }
                                    });
                                }else if (reaction.customId === '4x') {
                                    let rcislo = getRandomInt(1,100);

                                    db.collection('statistiky').doc(message.author.id).get().then((ia) => {
                                        var pregamble = ia.data().pregamblene;
                                        var suma_win = ia.data().suma_vyhra;
                                        var suma_lose = ia.data().suma_prehra;
                                    
                                        if(rcislo <= 21){
                                            peniazky += bet*4;
                                            db.collection('economy').doc(uzivatel).update({
                                                'money': peniazky
                                            });
                                            pregamble+=bet;
                                            suma_win+=bet*4;
                                            db.collection('statistiky').doc(message.author.id).update({
                                                'pregamblene': pregamble,
                                                'suma_vyhra': suma_win
                                            });
                                            let embed = new MessageEmbed()
                                                .setTitle("Multiply 4-násobok")
                                                .setColor("821e64")
                                                .addField("stávka", `${bet}`)
                                                .setDescription(`${message.author.tag}, vyhral si ${bet+bet+bet+bet} coinov. Aktuálne máš ${peniazky}`)
                                                .setThumbnail('https://i.imgur.com/wBXMggF.png')
                                            return message.reply({embeds: [embed]});
                                        }else{
                                            peniazky -= bet;
                                            db.collection('economy').doc(uzivatel).update({
                                                'money': peniazky
                                            });
                                            pregamble+=bet;
                                            suma_lose+=bet;
                                            db.collection('statistiky').doc(message.author.id).update({
                                                'pregamblene': pregamble,
                                                'suma_prehra': suma_lose
                                            });
                                            let embed2 = new MessageEmbed()
                                                .setTitle("Multiply 4-násobok")
                                                .setColor("821e64")
                                                .setDescription(`${message.author.tag}, prehral si ${bet} coinov. Aktuálne máš ${peniazky}`)
                                                .setThumbnail('https://i.imgur.com/gqvSC7x.png')
                                            return message.reply({embeds: [embed2]});
                                        }
                                    });
                                }else if (reaction.customId === '5x') {
                                    let rcislo = getRandomInt(1,100);

                                    db.collection('statistiky').doc(message.author.id).get().then((ia) => {
                                        var pregamble = ia.data().pregamblene;
                                        var suma_win = ia.data().suma_vyhra;
                                        var suma_lose = ia.data().suma_prehra;
                                    
                                        if(rcislo <= 17){
                                            peniazky += bet*5;
                                            db.collection('economy').doc(uzivatel).update({
                                                'money': peniazky
                                            });
                                            pregamble+=bet;;
                                            suma_win+=bet*5;
                                            db.collection('statistiky').doc(message.author.id).update({
                                                'pregamblene': pregamble,
                                                'suma_vyhra': suma_win
                                            });
                                            let embed = new MessageEmbed()
                                                .setTitle("Multiply 5-násobok")
                                                .setColor("821e64")
                                                .addField("stávka", `${bet}`)
                                                .setDescription(`${message.author.tag}, vyhral si ${bet+bet+bet+bet+bet} coinov. Aktuálne máš ${peniazky}`)
                                                .setThumbnail('https://i.imgur.com/wBXMggF.png')
                                            return message.reply({embeds: [embed]});
                                            }
                                        else{
                                            peniazky -= bet;
                                            db.collection('economy').doc(uzivatel).update({
                                                'money': peniazky
                                            });
                                            pregamble+=bet;
                                            suma_lose+=bet;
                                            db.collection('statistiky').doc(message.author.id).update({
                                                'pregamblene': pregamble,
                                                'suma_prehra': suma_lose
                                            });
                                            let embed2 = new MessageEmbed()
                                                .setTitle("Multiply 5-násobok")
                                                .setColor("821e64")
                                                .setDescription(`${message.author.tag}, prehral si ${bet} coinov. Aktuálne máš ${peniazky}`)
                                                .setThumbnail('https://i.imgur.com/gqvSC7x.png')
                                            return message.reply({embeds: [embed2]});

                                        }
                                    });
                                }else if(reaction.customId === 'close'){
                                    return message.reply("Stávka zrušená");
                                }
                            });
                            collector.on('end', collected => {
                                if(collected.size == 0) return message.reply("Nestihol si pridať reakciu");
                            });
                        });
                    //});
                    
                });
        }

    }
}
