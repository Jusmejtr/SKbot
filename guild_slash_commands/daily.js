const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'daily',
    data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Pick up your daily reward'),
    execute(interaction, db, config){

        const vip = (config.vip);

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

        function randomodmena(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function randomodmenaVIP(min, max){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        let timeout = 86400000;
        let reward = randomodmena(50,100);
        let rewardVIP = randomodmenaVIP(100,150);

        var hodnota;
        var peniaze;

        const embed = {};
        let isVIP;

        if(interaction.member.roles.cache.get(vip)){
            isVIP = true;
            embed.title = "Daily VIP reward";
        }else{
            isVIP = false;
            embed.title = "Daily reward";
        }

        
        db.collection('economy').doc(interaction.user.id).get().then((q) => {
            if(!q.exists){
                return interaction.reply({content: "You don't have account. You need to create it with *createaccount"});
            }
            hodnota = q.data().daily;
            peniaze = q.data().money;
            let cas = Date.now();
            if(timeout - (Date.now() - hodnota) > 0){
                var cas_do_daily = msToTime(timeout - (Date.now() - hodnota));
                embed.description = `${interaction.member.user.username}, you have already earned your daily reward`;
                embed.fields = [
                    { name: 'You can get the reward again in', value: cas_do_daily.toString() },
                ];
                return interaction.reply({embeds: [embed]});
            }
            else{
                if(isVIP){
                    peniaze += rewardVIP;
                    db.collection('economy').doc(interaction.user.id).update({
                        'money': peniaze,
                        'daily': cas
                    });
                    embed.description = `You have earned your VIP daily reward worth **${rewardVIP}**. Now you have ${peniaze}`;
                    return interaction.reply({embeds: [embed]});
                }else{
                    peniaze += reward;
                    db.collection('economy').doc(interaction.user.id).update({
                        'money': peniaze,
                        'daily' : cas
                    });
                    embed.description = `You have earned your daily reward worth **${reward}**. Now you have ${peniaze}`;
                    return interaction.reply({embeds: [embed]});
                }
                
            }
        });
    }
}