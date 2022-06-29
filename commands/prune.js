module.exports = {
    name: 'prune',
    description: 'clear a chat',
    execute(bot, message, config){

    const PREFIX = (config.prefix);
    const admin = (config.admin);
    const helper = (config.helper);
    const sbs = (config.sbs);
    const skplayersID = (config.skplayersID);

    const { Permissions } = require('discord.js');

    //mazanie sprav
    if (message.content.startsWith(PREFIX + "prune")) {
        let args = message.content.split(" ").slice(1);
        let author = message.member;
        let meno = message.author.tag;
        if (message.guild.id !== skplayersID){
            //message.delete();
            if(!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){
                //message.delete();
                return message.reply("You don't have permission **MANAGE_MESSAGES**");
            }else{
                message.delete().then(() => {
                    message.channel.bulkDelete(args[0]);
                }).catch(console.error);
            }
        }else{
            if (author.roles.cache.get(admin) || author.roles.cache.get(helper) || author.roles.cache.get(sbs)) {
                message.delete().then(() => {
                    message.channel.bulkDelete(args[0]);
                    bot.channels.cache.get("686650199904616456").send(`${meno} vymazal ${args[0]} sprav v roomke: ${message.channel.name}`);
                }).catch(console.error);
            }
            else {
                //message.delete();
                message.channel.send("Na tento príkaz nemáš práva.")
            }
        }
    }

    }
}