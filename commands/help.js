module.exports = {
    name: 'help',
    description: 'send bots commands',
    execute(message, config){

        const PREFIX = (config.prefix);

        const admin = (config.admin);
        const helper = (config.helper);
        const sbs = (config.sbs);
        const skplayers = (config.skplayersID);

        const { MessageEmbed } = require('discord.js');

        if (message.content === PREFIX + "help") {
            //message.delete();
            if (message.guild.id !== skplayers){
                let embed = new MessageEmbed();
                embed.setTitle("Príkazy pre SKbot");
                embed.setColor("ff0000");
                embed.addField("*ping", "Vypíše aktuálnu odozvu bota.");
                embed.addField("*nroll", "Vygeneruje náhodné číslo(*nroll 5 10 - vygeneruje číslo od 5 do 10).");
                embed.addField("*cicina", "Vypíše ti veľkosť tvojej ciciny.");
                embed.addField("*iq", "Vypíše ti tvoje IQ.");
                embed.addField("*2/3/4/5-team", "Vygeneruje náhodný tím, prvé číslo je podľa počtu hráčov v tíme. (*2-team @name @name @name @name)");
                embed.addField("*corona", "Zobrazí ti ifnormácie o koronavíruse v danom štáte (*corona slovakia)");
                embed.addField("*otazka", "Vytvorí otázku s reakciami 👍👎 (*otazka°text)");
                embed.addField("*2otazka", "Vytvorí otázku s reakciami ✅❌ (*2otazka°text)");
                embed.addField("*map-mm/wm/a", "Vygeneruje ti náhodnú mapu, wm-wingman, mm-matchmaking, a-active map pool; map-r Mirage Inferno ... - vygeneruje mapu podľa toho aké tam zadáš");
                embed.addField("*prune", "Vymažeš určitý počet správ napr. 5 (*prune 5)");
                embed.addField("*setup-updates", "Zobrazíš príkazy pre nastavenie herných noviniek alebo corony");

                //message.channel.send(`<@${message.author.id}> Všetky príkazy na bota máš v DM.`);
                message.reply("Všetky príkazy na bota máš v DM.");
                message.author.send({ embeds: [embed] });   
            }else{
                let embed = new MessageEmbed();
                embed.setTitle("Príkazy pre SKbot");
                embed.setColor("ff0000");
                embed.addField("*ping", "Vypíše aktuálnu odozvu bota.");
                embed.addField("*nroll", "Vygeneruje náhodné číslo(*nroll 5 10 - vygeneruje číslo od 5 do 10).");
                embed.addField("*cicina", "Vypíše ti veľkosť tvojej ciciny.");
                embed.addField("*iq", "Vypíše ti tvoje IQ.");
                embed.addField("*map-mm/wm/a", "Vygeneruje ti náhodnú mapu, wm-wingman, mm-matchmaking, a-active map pool; map-r Mirage Inferno ... - vygeneruje mapu podľa toho aké tam zadáš");
                embed.addField("*2-team", "V tíme budú 2 hráči (*2-team @a @b ... alebo *3-team/*4-team/*5-team)");
                embed.addField("*otazka", "Vytvorí otázku s reakciami 👍👎 (*otazka°text)");
                embed.addField("*2otazka", "Vytvorí otázku s reakciami ✅❌ (*2otazka°text)");
                embed.addField("*corona", "Zobrazí ti ifnormácie o koronavíruse v danom štáte (*corona slovakia)");
                embed.addField("*economy", "Zobrazí ti economy príkazy");
                embed.addField("*play", "Pustí ti pieseň z databázy (*play z-Kuky - pre pustenie playlistu kuky)");
    
                if (message.member.roles.cache.get(helper) || message.member.roles.cache.get(sbs)) {
                    embed.addField("*ban", "Zabanuješ hráča zo serveru (*ban @someone)");
                    embed.addField("*kick", "Vyhodíš hráča zo serveru (*kick @someone)");
                    embed.addField("*prune", "Vymažeš určitý počet správ napr. 5 (*prune 5)");
                }
                if (message.author.id === '421391887698755587'){//wasia
                    embed.addField("*addrole", "Hráčovi dáš práva do wasia room voice aj text roomky (*addrole @someone)");
                    embed.addField("*deleterole", "Hráčovi odoberieš práva do wasia room voice aj text roomky (*deleterole @someone)");
                }
    
                message.reply("Všetky príkazy na bota máš v DM.");
                message.author.send({ embeds: [embed] });  
            }
        }
    
    }
}