require('dotenv').config();

module.exports = {
    name: 'prune',
    description: 'clear a chat',
    execute(bot, message){

    const PREFIX = process.env.PREFIX;
    const admin = process.env.ADMIN_ROLE_ID;
    const helper = process.env.MODERATOR_ROLE_ID;
    const sbs = process.env.SBS_ROLE_ID;
    const skplayersID = process.env.SERVER_ID;
    const logs_channel = process.env.LOGS_CHANNEL_ID;

    const { PermissionsBitField } = require('discord.js');

    if (message.content.startsWith(PREFIX + "prune")) {
        let args = message.content.split(" ").slice(1);
        let author = message.member;
        let meno = message.author.tag;
        if (message.guild.id !== skplayersID){
            if(!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)){
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
                    bot.channels.cache.get(logs_channel).send(`${meno} vymazal ${args[0]} sprav v roomke: ${message.channel.name}`);
                }).catch(console.error);
            }
            else {
                message.channel.send("Na tento príkaz nemáš práva.")
            }
        }
    }

    }
}