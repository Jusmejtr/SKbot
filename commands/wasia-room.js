module.exports = {
    name: 'wasia-room',
    description: 'permission to wasia room',
    execute(message, config){
        const PREFIX = (config.prefix);
        const admin = (config.admin);
        const helper = (config.helper);

        if (message.content.startsWith(PREFIX + "addrole")) {
            message.delete();
            let author = message.member;
            let args = message.content.split(" ");
            let uzivatel = args[1];

            if (author.roles.cache.get(admin) || author.roles.cache.get(helper)){
                uzivatel = message.mentions.members.first();
                if (uzivatel) {
                    let hrac = message.guild.members.resolve(uzivatel);
                    if (hrac) {
                        hrac.roles.add("654364963376332841");
                    } else {
                        message.reply("Tento užívateľ neexistuje")
                    }
                } else {
                    message.reply("Chybné údaje");
                }

            }
        else{
            message.channel.send("Na tento príkaz nemáš pŕava");
            }
        }
        if (message.content.startsWith(PREFIX + "deleterole")) {
            message.delete();
            let author = message.member;
            let args = message.content.split(" ");
            let uzivatel = args[1];

            if (author.roles.cache.get(admin) || author.roles.cache.get(helper)){
            uzivatel = message.mentions.members.first();
            if (uzivatel) {
                let hrac = message.guild.members.resolve(uzivatel);
                if (hrac) {
                    hrac.roles.remove("654364963376332841");
                } else {
                    message.reply("Tento užívateľ neexistuje")
                }
            } else {
                message.reply("Chybné údaje");
            }

            }
            else{
                message.channel.send("Na tento príkaz nemáš pŕava");
            }
        }


    }
}