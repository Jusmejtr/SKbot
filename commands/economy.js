module.exports = {
    name: 'economy',
    description: 'send economy commands',
    execute(message, config){

        const PREFIX = (config.prefix);

        const { EmbedBuilder } = require('discord.js');

        if (message.content === PREFIX + "economy") {
            //message.delete();
            let embed = new EmbedBuilder()
                .setTitle("Economy príkazy")
                .setColor("ff0000")
                .setDescription("[economy príkazy](https://skplayers.eu/dcbot/docs/#economy)")
                // .addField("*createaccount", "Vytvorí ti účet pomocou ktorého budeš môcť využívať economy príkazy")
                // .addField("*balance", "Zobrazí ti tvoj aktuálny zostatok")
                // .addField("*daily", "Získaš svoju dennú odmenu")
                // .addField("*gamble 5", "Stavíš 5 coinov a máš 50% šancu vyhrať dvojnásobok stávky (*all in)-staví ti všetky tvoje coiny")
                // .addField("*transfer @someone 20", "Presunieš 20 coinov inému užívateľovi")
                // .addField("*jackpot 20", "Stavíš 20 coinov do jackpotu a hraješ s ostatnými hráčmi, (pre upozornenie na jackpoty daj *alert-jackpot)")
                // .addField("*shop", "Zobrazí ti obchod, v ktorom si môžeš nakúpiť veci za svoje coiny")
                // .addField("*stats", "Zobrazí ti gamble štatistiky")
                // .addField("*top", "Zobrazí ti prvých troch ľudí s najviac coinami")
                // .addField("*multiply 5", "Môžeš si vybrať násobiteľ coinov")
                // .addField("*redeem kod", "kód získaš po zakúpení v mojom twitch store")
                

            message.reply({embeds:[embed]});
        }
    
    }
}