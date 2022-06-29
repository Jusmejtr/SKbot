module.exports = {
    name: "music",
    description: "play a music",

    async execute(message, config, queue, fs){
        const PREFIX = (config.prefix);
        //const ytdl = require("ytdl-core");
        const play_dl = require('play-dl');

        const { MessageEmbed } = require('discord.js');
        const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, getVoiceConnection  } = require('@discordjs/voice');

        async function play(connection){
            let resource;
            const player = createAudioPlayer();
            

            // if(queue[0].startsWith("https://www.youtube.com/watch?v=")){
            //     resource = createAudioResource(ytdl(queue[0]), {filter: 'audioonly'});
            // }else{
            //     resource = createAudioResource(`./songs/${queue[0]}`);
            // }

            //resource = createAudioResource(`./songs/${queue[0]}`);
            let lincik = queue[0];
            let args = lincik.split('¤');

            //resource = createAudioResource(ytdl(args[0]), {filter: 'audioonly'});



            let stream = await play_dl.stream(args[0]);
            resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });


            player.play(resource);
            connection.subscribe(player);
            config.currentlyPlaying = args[1];
            queue.shift();
            player.on(AudioPlayerStatus.Idle, function(){
                if(queue[0]){
                    play(connection);
                }else{
                    config.currentlyPlaying = "Nothing";
                    connection.destroy();
                }
            });
        }
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        if(message.content.startsWith(PREFIX + "play")){
            //message.delete();

            let voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.reply("You need to be in voice channel");

            let args = message.content.split(" ");
            if(!args[1]) return message.reply("You need to specify song");

            if(isNaN(args[1])){
                if(args[1].startsWith("https://www.youtube.com/watch?v=") || args[1].startsWith("https://youtu.be/")){
                    //return message.reply("Currently unsupported format");
                    queue.push(args[1]);
                    message.reply(`Added to queue: ${args[1]}`);
                }else{
                    switch (args[1]) {
                        case "z-Rocket":
                            var files = fs.readFileSync('./songs/playlist-RocketLeague.txt', 'utf-8');
                            files.split(/\r?\n/).forEach(line =>  {
                                queue.push(line);
                            });
                            message.reply("Playing playlist: **Rocket**");
                            break;
                        case "z-Kuky":
                            var files2 = fs.readFileSync('./songs/playlist-Kuky.txt', 'utf-8');
                            files2.split(/\r?\n/).forEach(line =>  {
                                queue.push(line);
                            });
                            message.reply("Playing playlist: **Kuky**");
                            break;
                        default:
                            message.reply("Wrong input");
                            break;
                    }
                }
            }else{
                if(args[1] <= 0) return message.reply("Neexistujúca pozícia");
                let riadok = 1;
                var files = fs.readFileSync('./songs/songy.txt', 'utf-8');
                let find = false;
                files.split(/\r?\n/).forEach(line =>  {
                    if(args[1] == riadok){
                        let riadek = line.split("¤");
                        queue.push(line);
                        message.reply(`Added to queue: ${riadek[1]}`);
                        find = true;
                    }
                    riadok+=1;
                });
                if(find == false) return message.reply("Neexistujúca pozícia");
            }
            if(message.guild.me.voice.channel) return;
            const pripojenie = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            play(pripojenie);
            
        }
        if(message.content === PREFIX + "skip"){
            //message.delete();
            let voiceChannel = message.member.voice.channel;
            message.reply(`Skipping <:PepeOK:861282743488741418>`);
            const connection = getVoiceConnection(message.guild.id);
            play(connection);
        }
        if(message.content === PREFIX + "queue"){
            //message.delete();
            let sum;
            if(queue.length > 5){
                sum = 5;
            }else{
                sum = queue.length;
            }
            let embed = new MessageEmbed();
            embed.setTitle("QUEUE");
            embed.setColor("ab45af");
            embed.setFooter({text:`Songs in queue: ${queue.length}`});
            if(sum != 0){
                for(let i=0; i < sum; i++){
                    let riadok = queue[i];
                    let args = riadok.split("¤");
                    embed.addField("Song:", args[1].toString());
                }
            }else{
                embed.setDescription("EMPTY");
                return message.reply({embeds: [embed]});
            } 
            message.reply({embeds: [embed]});
        }
        if(message.content === PREFIX + "leave"){
            //message.delete();
            if(!message.guild.me.voice.channel)return message.reply("Nesom v roomke pepeg");
            message.reply("<a:peepoHey:763500258520072202>");
            const connection = getVoiceConnection(message.guild.id);
            connection.destroy();
            config.currentlyPlaying = "Nothing";
            while(queue.length > 0) {
                queue.pop();
            }
        }
        if(message.content === PREFIX + "shuffle"){
            //message.delete();
            message.reply("Shuffling queue");
            shuffleArray(queue);
        }

        if(message.content === PREFIX + "now playing" || message.content === PREFIX + "np"){
            //message.delete();
            let embed = new MessageEmbed();
            embed.setTitle("NOW PLAYING");
            embed.setColor("ab45af");
            if(config.currentlyPlaying == "Nothing"){
                embed.setDescription("Nothing");
            }else{
                embed.setDescription(config.currentlyPlaying.toString());
            }
            message.reply({embeds: [embed]});
        }
        if(message.content.startsWith(PREFIX + "search")){
            //message.delete();
            let args = message.content.split(" ").slice(1).join(" ").toString().toLowerCase();
            message.reply(`Searching: ${args}`);

            let file = fs.readFileSync("./songs/songy.txt", "utf-8");
            let argv = file.split(/\r?\n/);
            let count = 0;
            var songy=[];
            var riadky=[];
            var text = "";
            argv.forEach((value, index) => {
                let text = value.toLowerCase();
                if(text.includes(args) && count < 5){
                    songy[count] = value;
                    riadky[count] = index;
                    count += 1;
                }
            });
            let embed = new MessageEmbed();
            embed.setTitle("SEARCHING");
            embed.setColor("ab45af");
            if(count == 0){
                embed.setDescription(`Nothing found...\nCheck [list of available songs](https://skplayers.cf/dcbot/music/)`);
                message.reply({embeds: [embed]});
                return;
            }
            for(let i=0; i< count; i++){
                text += `**${i+1}** ${songy[i].slice(0, -4)}\n`;
            }
            message.channel.send(text).then(reakcia => {
                switch (count) {
                    case 1:
                        reakcia.react('1️⃣');
                        break;
                    case 2:
                        reakcia.react('1️⃣');
                        reakcia.react('2️⃣');
                        break;
                    case 3:
                        reakcia.react('1️⃣');
                        reakcia.react('2️⃣');
                        reakcia.react('3️⃣');
                        break;
                    case 4:
                        reakcia.react('1️⃣');
                        reakcia.react('2️⃣');
                        reakcia.react('3️⃣');
                        reakcia.react('4️⃣');
                        break;
                    case 5:
                        reakcia.react('1️⃣');
                        reakcia.react('2️⃣');
                        reakcia.react('3️⃣');
                        reakcia.react('4️⃣');
                        reakcia.react('5️⃣');
                        break;
                    default:
                        break;
                }

                const filter = (reaction, user) => {
                    return (
                    ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && user.id === message.author.id);
                };
                const collector = reakcia.createReactionCollector({ filter, max:1, time: 15000 });
                collector.on('collect', (reaction, user) => {
                    if (reaction.emoji.name === '1️⃣') {
                        queue.push(songy[0]);
                        message.reply(`Added to queue: ${songy[0].slice(0,-4)}`);
                    }else if (reaction.emoji.name === '2️⃣') {
                        queue.push(songy[1]);
                        message.reply(`Added to queue: ${songy[1].slice(0,-4)}`);
                    }else if (reaction.emoji.name === '3️⃣') {
                        queue.push(songy[2]);
                        message.reply(`Added to queue: ${songy[2].slice(0,-4)}`);
                    }else if(reaction.emoji.name === '4️⃣'){
                        queue.push(songy[3]);
                        message.reply(`Added to queue: ${songy[3].slice(0,-4)}`);
                    }else if(reaction.emoji.name === '5️⃣'){
                        queue.push(songy[4]);
                        message.reply(`Added to queue: ${songy[4].slice(0,-4)}`);
                    }
                    let voiceChannel = message.member.voice.channel;
                    if(!voiceChannel) return message.reply("You need to be in voice channel");
                    if(message.guild.me.voice.channel) return;
                    const pripojenie = joinVoiceChannel({
                        channelId: message.member.voice.channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                    });
                    play(pripojenie);
                });

            }); 
        }
    }
}