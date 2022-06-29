module.exports = {
    name: 'random-team',
    description: 'generate random team',
    execute(message, config){
        const PREFIX = (config.prefix);

        const { MessageEmbed } = require('discord.js');

        if (message.content.startsWith(PREFIX + "5-team")) {
            let roz = message.content.split(" ");
            let hrac = roz[1];
            let hrac1 = roz[2];
            let hrac2 = roz[3];
            let hrac3 = roz[4];
            let hrac4 = roz[5];
            let hrac5 = roz[6];
            let hrac6 = roz[7];
            let hrac7 = roz[8];
            let hrac8 = roz[9];
            let hrac9 = roz[10];
    
            var zoznam = [];
            var oranzovy = [];
            var zlty = [];
    
            zoznam.push(`${hrac}`);
            zoznam.push(`${hrac1}`);
            zoznam.push(`${hrac2}`);
            zoznam.push(`${hrac3}`);
            zoznam.push(`${hrac4}`);
            zoznam.push(`${hrac5}`);
            zoznam.push(`${hrac6}`);
            zoznam.push(`${hrac7}`);
            zoznam.push(`${hrac8}`);
            zoznam.push(`${hrac9}`);
    
            for (let i = 0; i < zoznam.length; i++) {
                let cislo = Math.floor(Math.random() * 2);
                if (cislo === 1) {
                    if (oranzovy[4] == null) {
                        oranzovy.push(zoznam[i]);
                    }
                    else {
                        zlty.push(zoznam[i]);
                    }
                }
                else {
                    if (zlty[4] == null) {
                        zlty.push(zoznam[i]);
                    }
                    else {
                        oranzovy.push(zoznam[i]);
                    }
                }
            }
            
            try {
                let embed1 = new MessageEmbed()
                    .setTitle("Oranžový tím")
                    .addField("Hráč č.1", `${oranzovy[0]}`)
                    .addField("Hráč č.2", `${oranzovy[1]}`)
                    .addField("Hráč č.3", `${oranzovy[2]}`)
                    .addField("Hráč č.4", `${oranzovy[3]}`)
                    .addField("Hráč č.5", `${oranzovy[4]}`)
                    .setColor(`#FF7F00`)
                let embed2 = new MessageEmbed()
                    .setTitle("Žltý tím")
                    .addField("Hráč č.1", `${zlty[0]}`)
                    .addField("Hráč č.2", `${zlty[1]}`)
                    .addField("Hráč č.3", `${zlty[2]}`)
                    .addField("Hráč č.4", `${zlty[3]}`)
                    .addField("Hráč č.5", `${zlty[4]}`)
                    .setColor(`#FFFF00`)
                message.reply({ embeds: [embed1, embed2] }); 
            } catch (error) {
                message.reply("Nastala chyba");
                console.log(error);
            }

        }
        if (message.content.startsWith(PREFIX + "4-team")) {
            let roz = message.content.split(" ");
            let hrac = roz[1];
            let hrac1 = roz[2];
            let hrac2 = roz[3];
            let hrac3 = roz[4];
            let hrac4 = roz[5];
            let hrac5 = roz[6];
            let hrac6 = roz[7];
            let hrac7 = roz[8];
    
            var zoznam = [];
            var oranzovy = [];
            var zlty = [];
    
            zoznam.push(`${hrac}`);
            zoznam.push(`${hrac1}`);
            zoznam.push(`${hrac2}`);
            zoznam.push(`${hrac3}`);
            zoznam.push(`${hrac4}`);
            zoznam.push(`${hrac5}`);
            zoznam.push(`${hrac6}`);
            zoznam.push(`${hrac7}`);
    
            for (let i = 0; i < zoznam.length; i++) {
                let cislo = Math.floor(Math.random() * 2);
                if (cislo === 1) {
                    if (oranzovy[3] == null) {
                        oranzovy.push(zoznam[i]);
                    }
                    else {
                        zlty.push(zoznam[i]);
                    }
                }
                else {
                    if (zlty[3] == null) {
                        zlty.push(zoznam[i]);
                    }
                    else {
                        oranzovy.push(zoznam[i]);
                    }
                }
            }
                try {
                    let embed1 = new MessageEmbed()
                        .setTitle("Oranžový tím")
                        .addField("Hráč č.1", `${oranzovy[0]}`)
                        .addField("Hráč č.2", `${oranzovy[1]}`)
                        .addField("Hráč č.3", `${oranzovy[2]}`)
                        .addField("Hráč č.4", `${oranzovy[3]}`)
                        .setColor(`#FF7F00`)
                    let embed2 = new MessageEmbed()
                        .setTitle("Žltý tím")
                        .addField("Hráč č.1", `${zlty[0]}`)
                        .addField("Hráč č.2", `${zlty[1]}`)
                        .addField("Hráč č.3", `${zlty[2]}`)
                        .addField("Hráč č.4", `${zlty[3]}`)
                        .setColor(`#FFFF00`)
                    message.reply({ embeds: [embed1, embed2] }); 
                } catch (error) {
                    message.reply("Nastala chyba");
                    console.log(error);
                }
        }
        if (message.content.startsWith(PREFIX + "3-team")) {
            let roz = message.content.split(" ");
            let hrac = roz[1];
            let hrac1 = roz[2];
            let hrac2 = roz[3];
            let hrac3 = roz[4];
            let hrac4 = roz[5];
            let hrac5 = roz[6];
    
            var zoznam = [];
            var oranzovy = [];
            var zlty = [];
    
            zoznam.push(`${hrac}`);
            zoznam.push(`${hrac1}`);
            zoznam.push(`${hrac2}`);
            zoznam.push(`${hrac3}`);
            zoznam.push(`${hrac4}`);
            zoznam.push(`${hrac5}`);
    
            for (let i = 0; i < zoznam.length; i++) {
                let cislo = Math.floor(Math.random() * 2);
                if (cislo === 1) {
                    if (oranzovy[2] == null) {
                        oranzovy.push(zoznam[i]);
                    }
                    else {
                        zlty.push(zoznam[i]);
                    }
                }
                else {
                    if (zlty[2] == null) {
                        zlty.push(zoznam[i]);
                    }
                    else {
                        oranzovy.push(zoznam[i]);
                    }
                }
            }
            
                try {
                    let embed1 = new MessageEmbed()
                        .setTitle("Oranžový tím")
                        .addField("Hráč č.1", `${oranzovy[0]}`)
                        .addField("Hráč č.2", `${oranzovy[1]}`)
                        .addField("Hráč č.3", `${oranzovy[2]}`)
                        .setColor(`#FF7F00`)
                    let embed2 = new MessageEmbed()
                        .setTitle("Žltý tím")
                        .addField("Hráč č.1", `${zlty[0]}`)
                        .addField("Hráč č.2", `${zlty[1]}`)
                        .addField("Hráč č.3", `${zlty[2]}`)
                        .setColor(`#FFFF00`)
                    message.reply({ embeds: [embed1, embed2] }); 
                } catch (error) {
                    message.reply("Nastala chyba");
                    console.log(error);
                }
        }
        if (message.content.startsWith(PREFIX + "2-team")) {
            let roz = message.content.split(" ");
            let hrac = roz[1];
            let hrac1 = roz[2];
            let hrac2 = roz[3];
            let hrac3 = roz[4];
    
            var zoznam = [];
            var oranzovy = [];
            var zlty = [];
    
            zoznam.push(`${hrac}`);
            zoznam.push(`${hrac1}`);
            zoznam.push(`${hrac2}`);
            zoznam.push(`${hrac3}`);
    
            for (let i = 0; i < zoznam.length; i++) {
                let cislo = Math.floor(Math.random() * 2);
                if (cislo === 1) {
                    if (oranzovy[1] == null) {
                        oranzovy.push(zoznam[i]);
                    }
                    else {
                        zlty.push(zoznam[i]);
                    }
                }
                else {
                    if (zlty[1] == null) {
                        zlty.push(zoznam[i]);
                    }
                    else {
                        oranzovy.push(zoznam[i]);
                    }
                }
            }

                try {
                    let embed1 = new MessageEmbed()
                        .setTitle("Oranžový tím")
                        .addField("Hráč č.1", `${oranzovy[0]}`)
                        .addField("Hráč č.2", `${oranzovy[1]}`)
                        .setColor(`#FF7F00`)
                    let embed2 = new MessageEmbed()
                        .setTitle("Žltý tím")
                        .addField("Hráč č.1", `${zlty[0]}`)
                        .addField("Hráč č.2", `${zlty[1]}`)
                        .setColor(`#FFFF00`)
                    message.reply({ embeds: [embed1, embed2] }); 
                } catch (error) {
                    message.reply("Nastala chyba");
                    console.log(error);
                }
        }
    
    }
}