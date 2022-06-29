module.exports = {
    name: "top",
    description: "leaderboard of top users coins",

    async execute(message, config, db){

        const PREFIX = (config.prefix);
        const vip = (config.vip);
        const helper = (config.helper);
        const sbs = (config.sbs);
        const { MessageEmbed } = require('discord.js');

        if(message.content === PREFIX + "top"){
            //message.delete();
            let author = message.member;


            if(author.roles.cache.get(vip) || author.roles.cache.get(helper) || author.roles.cache.get(sbs)){
                const aa = db.collection('economy');
                const zorad = await aa.orderBy('money', "desc").limit(5).get();
                if(zorad.empty){
                    message.reply("Chybné dáta");
                }else{
                    var zoznam=[];
                    var coiny=[];
                    zorad.forEach(opa => {
                        let f = opa.data().money;
                        let mienko = opa.data().meno;
                        zoznam.push(mienko);
                        coiny.push(f);
                    });
                    let embed = new MessageEmbed()
                        .setTitle("TOP 5 s najviac coinami")
                        .setColor(`#b7d5f0`)
                        .addField(`1. ${zoznam[0]}`, coiny[0].toString())
                        .addField(`2. ${zoznam[1]}`, coiny[1].toString())
                        .addField(`3. ${zoznam[2]}`, coiny[2].toString())
                        .addField(`4. ${zoznam[3]}`, coiny[3].toString())
                        .addField(`5. ${zoznam[4]}`, coiny[4].toString())
                        .setTimestamp()
                    message.reply({embeds: [embed]});

                }
            }else{
                const aa = db.collection('economy');
                const zorad = await aa.orderBy('money', "desc").limit(3).get();
                if(zorad.empty){
                    message.reply("Chybné dáta");
                }else{
                    var zoznam=[];
                    var coiny=[];
                    zorad.forEach(opa => {
                        let f = opa.data().money;
                        let mienko = opa.data().meno;
                        zoznam.push(mienko);
                        coiny.push(f);
                    });
                    let embed = new MessageEmbed()
                        .setTitle("TOP 3 s najviac coinami")
                        .setColor(`#b7d5f0`)
                        .addField(`1. ${zoznam[0]}`, coiny[0].toString())
                        .addField(`2. ${zoznam[1]}`, coiny[1].toString())
                        .addField(`3. ${zoznam[2]}`, coiny[2].toString())
                        .setTimestamp()
                    message.reply({embeds: [embed]});
                }
            }
        }
    
    }
}