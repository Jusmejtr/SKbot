module.exports = {
    name: "ban",
    description: "ban a user",

    execute(message, config){
        const PREFIX = (config.prefix);

        if (message.content.startsWith(PREFIX + "ban")) {
            let uzivatel = message.mentions.members.first();
            let args = message.content.split(" ");
            let sprava = args.slice(2).join(" ");
            //message.delete();

            const { Permissions } = require('discord.js');
  
            if (message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                if(uzivatel == message.author){
                    return message.reply("Nemôžeš zabanovať sámeho seba. Či?");
                }
                if (uzivatel) {
                    const hrac = message.guild.members.resolve(uzivatel);
                    if (hrac) {
                        try{
                            if(sprava){
                                hrac.ban({reason: `${sprava}`});
                                message.reply(`Úspešne si zabanoval ${uzivatel}, dôvod: ${sprava}`);
                            }else{
                                hrac.ban();
                                message.reply(`Úspešne si zabanoval ${uzivatel}`);
                            }
                        }catch{
                            return message.reply("Nastal error, tohto užívateľa nemôžeš zabanovať zo servera");
                        }
                    } else {
                        message.reply("Tento užívateľ neexistuje");
                    }
                } else {
                    message.reply("Chybné údaje");
                }
            }
            else {
                message.reply("Na tento príkaz nemáš práva.");
            }
        }
    
    }
}