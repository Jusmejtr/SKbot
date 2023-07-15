module.exports = {
    name: 'random-team',
    description: 'generate random team',
    execute(message, config){
        const PREFIX = (config.prefix);

        const { EmbedBuilder } = require('discord.js');

        function sendEmbed(playersInOneTeam, orangeTeam, yellowTeam){
            let embed = new EmbedBuilder();
            let embed2 = new EmbedBuilder();

            embed.setTitle("Oranžový tím");
            embed.setColor(`#FF7F00`);

            embed2.setTitle("Žltý tím");
            embed2.setColor(`#FFFF00`);
            
            for(let i=1; i<=playersInOneTeam; i++){
                try {
                    embed.addFields({name: `Hráč č.${i}`, value: orangeTeam[i-1].toString()});                    
                } catch (error) {
                    message.reply("Wrong input");
                    return;
                }
            }
            for(let i=1; i<=playersInOneTeam; i++){
                try {
                    embed2.addFields({name: `Hráč č.${i}`, value: yellowTeam[i-1].toString()});          
                } catch (error) {
                    message.reply("Wrong input");
                    return;
                }
            }
            try {
                message.reply({ embeds: [embed, embed2] });                
            } catch (error) {
                
            }
        }
        
        function randomizeTeam(players, orangeTeam, yellowTeam){
            for (let i = 0; i < players.length; i++) {
                let cislo = Math.floor(Math.random() * 2);
                if (cislo === 1) {
                    if (orangeTeam[players.length/2-1] == null) {
                        orangeTeam.push(players[i]);
                    }
                    else {
                        yellowTeam.push(players[i]);
                    }
                }
                else {
                    if (yellowTeam[players.length/2-1] == null) {
                        yellowTeam.push(players[i]);
                    }
                    else {
                        orangeTeam.push(players[i]);
                    }
                }
            }

        }

        if (message.content.startsWith(PREFIX + "generate-team")) {
            let args = message.content.split(" ");
            if(isNaN(args[1])) return message.reply("You need to write valid number");

            var zoznam = [];
            var oranzovy = [];
            var zlty = [];

            switch (args[1]) {
                case '2':
                    for(let i=2; i<6; i++){
                        zoznam.push(args[i]);
                    }
                    randomizeTeam(zoznam, oranzovy, zlty);
                    sendEmbed(2, oranzovy, zlty);
                    break;
                case '3':
                    for(let i=2; i<8; i++){
                        zoznam.push(args[i]);
                    }
                    randomizeTeam(zoznam, oranzovy, zlty);
                    sendEmbed(3, oranzovy, zlty);
                    break;
                case '4':
                    for(let i=2; i<10; i++){
                        zoznam.push(args[i]);
                    }
                    randomizeTeam(zoznam, oranzovy, zlty);
                    sendEmbed(4, oranzovy, zlty);
                    break;
                case '5':
                    for(let i=2; i<12; i++){
                        zoznam.push(args[i]);
                    }
                    randomizeTeam(zoznam, oranzovy, zlty);
                    sendEmbed(5, oranzovy, zlty);
                    break;
                default:
                    message.reply("Wrong input");
                    break;
            }

        }    
    }
}