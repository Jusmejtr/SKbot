module.exports = {
    name: 'daily',
    description: 'daily rewards',
    execute(message, config, db){
        const PREFIX = (config.prefix);
        const vip = (config.vip);
        var hodnota;
        var peniaze;
        
        const { MessageEmbed } = require('discord.js');

        function msToTime(duration) {
            var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            return hours + "h " + minutes + "m " + seconds + "s";
        }

        if(message.content === PREFIX + "daily"){
            //message.delete();
            var meno = message.member.user.id;

            function randomodmena(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            function randomodmenaVIP(min, max){
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
    
            let timeout = 86400000;
            let reward = randomodmena(50,100);
            let rewardVIP = randomodmenaVIP(100,150);
    
            let embed = new MessageEmbed();

            if(message.member.roles.cache.get(vip)){
                embed.setTitle("Denná VIP odmena");
            }else{
                embed.setTitle("Denná odmena");
            }


            db.collection('economy').doc(meno).get().then((q) => {
                if(!q.exists){
                    return message.reply("Musíš si vytvoriť účet príkazom *createaccount");
                }
                hodnota = q.data().daily;
                peniaze = q.data().money;
                    let cas = Date.now();
                    if(timeout - (Date.now() - hodnota) > 0){
                        var cas_do_daily = msToTime(timeout - (Date.now() - hodnota));
                        embed.setDescription(`${message.member.user.username}, Svoju dennú odmenu si už získal`);
                        //embed.addField(`Odmenu môžeš získať opäť o`, `${time.hours}h ${time.minutes}m ${time.seconds}s`);
                        embed.addField(`Odmenu môžeš získať opäť o`, `${cas_do_daily}`);
                        return message.reply({embeds: [embed]});
    
                    }
                    else{
                        if(message.member.roles.cache.get(vip)){
                            peniaze += rewardVIP;
                            db.collection('economy').doc(meno).update({
                                'money': peniaze
                            });
                            db.collection('economy').doc(meno).update({
                                'daily': cas
                            });
                            embed.setDescription(`${message.author.username}, Získal si svoju dennú odmenu v hodnote ${rewardVIP}. Aktuálne máš ${peniaze}`);
                            return message.reply({embeds: [embed]});
                        }else{
                            peniaze += reward;
                            db.collection('economy').doc(meno).update({
                                'money': peniaze
                            });
                            db.collection('economy').doc(meno).update({
                                'daily': cas
                            });
                            embed.setDescription(`${message.author.username}, Získal si svoju dennú odmenu v hodnote ${reward}. Aktuálne máš ${peniaze}`);
                            return message.reply({embeds: [embed]});
                        }
                        
                    }
            });
        }
    }
}
