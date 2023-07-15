module.exports = {
    name: "kick",
    description: "kick a user",

    execute(message, config){
        const PREFIX = (config.prefix);

        if (message.content.startsWith(PREFIX + "kick")) {
            let uzivatel = message.mentions.members.first();
            let args = message.content.split(" ");
            let sprava = args.slice(2).join(" ");
            //message.delete();

            const { PermissionsBitField } = require('discord.js');
  
            if (message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                if(uzivatel == message.author){
                    return message.reply("Nemôžeš kicknúť sámeho seba. Či?");
                }
                if (uzivatel) {
                    const hrac = message.guild.members.resolve(uzivatel);
                    if (hrac) {
                        try{
                            if(sprava){
                                hrac.kick(sprava);
                                message.reply(`Úspešne si vyhodil ${uzivatel}, dôvod: ${sprava}`);
                            }else{
                                hrac.kick();
                                message.reply(`Úspešne si vyhodil ${uzivatel}`);
                            }
                        }catch{
                            return message.reply("Nastal error, tohto užívateľa nemôžeš vyhodiť zo servera");
                        }
                    } else {
                        message.reply("Tento užívateľ neexistuje");
                    }
                } else {
                    message.reply("Chybné údaje");
                }
            }
            else {
                message.reply("You don't have permission **KICK_MEMBERS**");
            }
        }
    
    }
}