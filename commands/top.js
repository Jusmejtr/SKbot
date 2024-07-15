require('dotenv').config();

module.exports = {
    name: "top",
    description: "leaderboard of top users coins",

    async execute(message, db){

        const PREFIX = process.env.PREFIX;
        const vip = process.env.VIP_ROLE_ID;
        const helper = process.env.MODERATOR_ROLE_ID;
        const sbs = process.env.SBS_ROLE_ID;
        
        const { EmbedBuilder } = require('discord.js');

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
                    let embed = new EmbedBuilder()
                        .setTitle("TOP 5 s najviac coinami")
                        .setColor(`#b7d5f0`)
                        .addFields(
                            {name: `1. ${zoznam[0]}`, value: coiny[0].toString()},
                            {name: `2. ${zoznam[1]}`, value: coiny[1].toString()},
                            {name: `3. ${zoznam[2]}`, value: coiny[2].toString()},
                            {name: `4. ${zoznam[3]}`, value: coiny[3].toString()},
                            {name: `5. ${zoznam[4]}`, value: coiny[4].toString()}
                        )
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
                    let embed = new EmbedBuilder()
                        .setTitle("TOP 3 s najviac coinami")
                        .setColor(`#b7d5f0`)
                        .addFields(
                            {name: `1. ${zoznam[0]}`, value: coiny[0].toString()},
                            {name: `2. ${zoznam[1]}`, value: coiny[1].toString()},
                            {name: `3. ${zoznam[2]}`, value: coiny[2].toString()}
                        )
                        .setTimestamp()
                    message.reply({embeds: [embed]});
                }
            }
        }
    
    }
}