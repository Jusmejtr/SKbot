require('dotenv').config();

module.exports = {
    name: 'emote',
    description: 'emotky',
    async execute(bot, message){
        const PREFIX = process.env.PREFIX;
        const skplayers = process.env.SERVER_ID;
        let regex = /\:[a-zA-z0-9]{2,}\:/g;

        const { EmbedBuilder, WebhookClient, MessageType } = require('discord.js');


        async function send_edited_message(webhooh_id, webhook_token, message, text_spravy, odpoved){
            var emoteName = '';
            var editedmsg = '';
            let needSend = true;
            let animatedEmojiCount = 0;
            let error = false;

            for(let i=0; i< text_spravy.length; i++){
                if(text_spravy[i] == ':'){
                    editedmsg += "<";
                    for(let j = i+1; j< text_spravy.length; j++){
                        if(text_spravy[j] == ':'){
                            let emotikon = bot.emojis.cache.find(e => e.name == emoteName);
                            if(emotikon){
                                if(emotikon.animated == false && emotikon.guild.id == message.guild.id){
                                    needSend = false;
                                }
                                if(emotikon.animated){
                                    editedmsg += "a";
                                    animatedEmojiCount += 1;
                                }
                                editedmsg += ":";
                                editedmsg += emoteName;
                                editedmsg += ":";
                                editedmsg += emotikon.id.toString();
                                editedmsg += ">";
                                i = j;
                                emoteName = '';
                            }else{
                                error = true;
                                return;
                            }
                            
                            break;
                        }else{
                            emoteName += text_spravy[j];
                        }
                    }
                }else{
                    editedmsg += text_spravy[i];
                }            
            }

            //post clean up
            let temp = '';
            for(let i=0; i< editedmsg.length; i++){
                if(editedmsg[i] == "<" && editedmsg[i+1] == "<"){
                    temp += "<";
                    i += 1;
                    continue;
                }
                if(editedmsg[i] == ">"){
                    let score = 0;
                    for(let a=1; a<19; a++){
                        if(isNaN(editedmsg[i+a])){

                        }else{
                            score += 1;
                        }
                        if(score == 18){
                            i += 19;
                        }
                    }

                }
                temp += editedmsg[i];
            }

            if((animatedEmojiCount > 0 || needSend == true) && error == false){
                const webhookClient = new WebhookClient({ id: webhooh_id, token: webhook_token });
                setTimeout(() => {
                    message.delete();
                }, 100);
                if(odpoved == false){
                    webhookClient.send({
                        content: temp,
                        username: message.author.username,
                        avatarURL: message.author.avatarURL()
                    });
                }else{
                    let originalna_sprava = await message.fetchReference();
                    let autor_originalnej_spravy = originalna_sprava.author;
                    let autor_url = bot.users.cache.find(user => user.username == autor_originalnej_spravy.username);

                    let embed = new EmbedBuilder()
                        .setAuthor({ name: autor_originalnej_spravy.username, iconURL: `${autor_url.displayAvatarURL()}`, url: originalna_sprava.url})
                        .setDescription(`[Reply to: ](${originalna_sprava.url}) ${originalna_sprava.content}`)
                        .setColor('#0BC2FB')
                    webhookClient.send({
                        content: temp,
                        username: message.author.username,
                        avatarURL: message.author.avatarURL(),
                        embeds: [embed]
                    });
                }
                return;
            }else{
                return;
            }

        }
        if(message.content.startsWith(PREFIX + "react") && message.type == 'REPLY'){
            let args = message.content.split(" ");
            let emoteText = args[1];
            if(!emoteText) return message.reply("You need to specify emote");
            if(regex.test(emoteText)){
                let emoteName;
                if(emoteText[0] == "<" && emoteText[emoteText.length-1] == ">"){
                    emoteName = emoteText.slice(2).slice(0,-20);
                }else{
                    emoteName = emoteText.slice(1).slice(0,-1);
                }
                let emotikon = bot.emojis.cache.find(e => e.name == emoteName);
                if(!emotikon) return message.reply("Cannot find emote");
                message.delete();
                const repliedTo = await message.channel.messages.fetch(message.reference.messageId).then(message => {
                    message.react(emotikon);
                    setTimeout(() => {
                        message.reactions.resolve(emotikon.id).users.remove(bot.user.id);
                    }, 4000);
                });
            }else{
                return message.reply("Invalid emote");
            }
        }

        if(regex.test(message.content)){
            if(message.author.bot) return;
            if(message.content.startsWith(PREFIX + "react")) return;
            if(message.member.premiumSinceTimestamp) return;

            const webhooks = await message.channel.fetchWebhooks();
            const webhook = webhooks.find(wh => wh.name == 'SKbot');

            var webhoocikId;
            var webhoocikToken;

            if(webhook){
                webhoocikId = webhook.id;
                webhoocikToken = webhook.token;
            }else{
                var novywebhook = await message.channel.createWebhook({
                    name: 'SKbot',
                    avatar: bot.user.avatarURL(),
                });
                webhoocikId = novywebhook.id;
                webhoocikToken = novywebhook.token;
            }
            if(message.type == MessageType.Reply){
                send_edited_message(webhoocikId, webhoocikToken, message, message.content, true);
                return;
            }
            send_edited_message(webhoocikId, webhoocikToken, message, message.content, false);

        }
    }
}
