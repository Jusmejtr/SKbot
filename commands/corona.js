module.exports = {
    name: 'corona',
    description: 'informations about coronavirus',
    async execute(message, config, fetch){

        const PREFIX = (config.prefix);
        const { MessageEmbed } = require('discord.js');

        if (message.content.startsWith(PREFIX + "corona")) {
           // message.delete();
            let args = message.content.split(" ");
            let res = await fetch(`https://coronavirus-19-api.herokuapp.com/countries/${args[1]}`).catch(err => {
            console.log(err);
            });
            let data = await res.json().then((data) => {
                var pri = data.cases;
                pri=parseInt(pri);
                var smr = data.deaths;
                smr=parseInt(smr);
                var vyl = data.recovered;
                vyl=parseInt(vyl);
                var eso = data.todayCases;
                eso = parseInt(eso);
                var tca = data.todayDeaths;
                tca=parseInt(tca);
                var fess = data.active;
                fess=parseInt(fess);
    
                let embed = new MessageEmbed()
                    .setTitle(`Corona - štát (${args[1]})`)
                    .addField("Počet prípadov", `${pri} [+${eso}]`)
                    .addField("Počet úmrtí", `${smr} [+${tca}]`)
                    .addField("Počet vyliečených", `${vyl}`)
                    .addField("Počet aktívnych prípadov", `${fess}`)
                    .setColor("00ffff")
    
                message.reply({ embeds: [embed]});
    
            }).catch(err => {
                console.log(err);
                message.reply("Štát, ktorý si zadal sa nezhoduje s databázou. Pre overenie názvu krajiny choď na: https://coronavirus-19-api.herokuapp.com/countries")
                return;
            });    
        }
    }
}