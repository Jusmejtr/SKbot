require('dotenv').config();

module.exports = {
    name: 'help',
    description: 'send bots commands',
    execute(message){

        const PREFIX = process.env.PREFIX;

        const helper = process.env.MODERATOR_ROLE_ID;
        const sbs = process.env.SBS_ROLE_ID;
        const skplayers = process.env.SERVER_ID;

        const { EmbedBuilder } = require('discord.js');

        if (message.content === PREFIX + "help") {
            //message.delete();
            if (message.guild.id !== skplayers){
                let embed = new EmbedBuilder();
                embed.setTitle("Príkazy pre SKbot");
                embed.setColor("ff0000");
                embed.addFields(
                    {name: '*ping', value: 'Vypíše aktuálnu odozvu bota.'},
                    {name: '*nroll', value: 'Vygeneruje náhodné číslo(*nroll 5 10 - vygeneruje číslo od 5 do 10).'},
                    {name: '*cicina', value: 'Vypíše ti veľkosť tvojej ciciny.'},
                    {name: '*iq', value: 'Vypíše ti tvoje IQ.'},
                    {name: '*2/3/4/5-team', value: 'Vygeneruje náhodný tím, prvé číslo je podľa počtu hráčov v tíme. (*2-team @name @name @name @name)'},
                    {name: '*otazka', value: 'Vytvorí otázku s reakciami 👍👎 (*otazka°text)'},
                    {name: '*2otazka', value: 'Vytvorí otázku s reakciami ✅❌ (*2otazka°text)'},
                    {name: '*map-mm/wm/a', value: '"Vygeneruje ti náhodnú mapu, wm-wingman, mm-matchmaking, a-active map pool; map-r Mirage Inferno ... - vygeneruje mapu podľa toho aké tam zadáš'},
                    {name: '*prune', value: 'Vymažeš určitý počet správ napr. 5 (*prune 5)'},
                    {name: '*setup-updates', value: 'Zobrazíš príkazy pre nastavenie herných noviniek alebo corony'},
                    {name: '*play', value: 'Pustí ti pieseň z databázy (*play z-Kuky - pre pustenie playlistu kuky)'}
                )
                //message.channel.send(`<@${message.author.id}> Všetky príkazy na bota máš v DM.`);
                message.reply("Všetky príkazy na bota máš v DM.");
                message.author.send({ embeds: [embed] });   
            }else{
                let embed = new EmbedBuilder();
                embed.setTitle("Príkazy pre SKbot");
                embed.setColor("ff0000");
                embed.addFields(
                    {name: '*ping', value: 'Vypíše aktuálnu odozvu bota.'},
                    {name: '*nroll', value: 'Vygeneruje náhodné číslo(*nroll 5 10 - vygeneruje číslo od 5 do 10).'},
                    {name: '*cicina', value: 'Vypíše ti veľkosť tvojej ciciny.'},
                    {name: '*iq', value: 'Vypíše ti tvoje IQ.'},
                    {name: '*2/3/4/5-team', value: 'Vygeneruje náhodný tím, prvé číslo je podľa počtu hráčov v tíme. (*2-team @name @name @name @name)'},
                    {name: '*otazka', value: 'Vytvorí otázku s reakciami 👍👎 (*otazka°text)'},
                    {name: '*2otazka', value: 'Vytvorí otázku s reakciami ✅❌ (*2otazka°text)'},
                    {name: '*map-mm/wm/a', value: '"Vygeneruje ti náhodnú mapu, wm-wingman, mm-matchmaking, a-active map pool; map-r Mirage Inferno ... - vygeneruje mapu podľa toho aké tam zadáš'},
                    {name: '*prune', value: 'Vymažeš určitý počet správ napr. 5 (*prune 5)'},
                    {name: '*setup-updates', value: 'Zobrazíš príkazy pre nastavenie herných noviniek alebo corony'},
                    {name: '*economy', value: 'Zobrazí ti economy príkazy'},
                    {name: '*play', value: 'Pustí ti pieseň z databázy (*play z-Kuky - pre pustenie playlistu kuky)'}
                )
    
                if (message.member.roles.cache.get(helper) || message.member.roles.cache.get(sbs)) {
                    embed.addFields(
                        {name: '*ban', value: 'Zabanuješ hráča zo serveru (*ban @someone)'},
                        {name: '*kick', value: 'Vyhodíš hráča zo serveru (*kick @someone)'},
                        {name: '*prune', value: 'Vymažeš určitý počet správ napr. 5 (*prune 5)'}
                    )
                }
                if (message.author.id === '421391887698755587'){//wasia
                    embed.addFields(
                        {name: '*addrole', value: 'Hráčovi dáš práva do wasia room voice aj text roomky (*addrole @someone)'},
                        {name: '*deleterole', value: 'Hráčovi odoberieš práva do wasia room voice aj text roomky (*deleterole @someone)'}
                    )
                }
    
                message.reply("Všetky príkazy na bota máš v DM.");
                message.author.send({ embeds: [embed] });  
            }
        }
    
    }
}