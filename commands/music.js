module.exports = {
    name: "music",
    description: "play a music",

    async execute(bot, message, config, server_music, fs){
        const PREFIX = (config.prefix);
        const ytdl = require("ytdl-core");
        const ytSearch = require("yt-search");

        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, getVoiceConnection, generateDependencyReport } = require('@discordjs/voice');

        async function play(connection){
            let resource;
            const player = createAudioPlayer();

            let stream = ytdl(server_music[message.guild.id].queue[0], { filter: 'audioonly' });
            resource = createAudioResource(stream);

            player.play(resource);
            connection.subscribe(player);
        
            server_music[message.guild.id].queue.shift();
            server_music[message.guild.id].currentlyPlaying = server_music[message.guild.id].song_names[0];
            server_music[message.guild.id].song_names.shift();
            server_music[message.guild.id].type = "music";

            player.on(AudioPlayerStatus.Idle, function(){
                if(server_music[message.guild.id].queue[0]){
                    play(connection);
                }else{
                    connection.destroy();
                    remove_queue();
                }
            });
        }
        
        async function play_radio(connection){
            let resource;
            const player = createAudioPlayer();
            resource = createAudioResource(server_music[message.guild.id].queue[0]);
            //console.log(generateDependencyReport());
            connection.subscribe(player);
            player.play(resource);
        
            server_music[message.guild.id].queue.shift();
            server_music[message.guild.id].currentlyPlaying = server_music[message.guild.id].song_names[0];
            server_music[message.guild.id].song_names.shift();
            server_music[message.guild.id].type = "radio";

            player.on(AudioPlayerStatus.Idle, function(){
                if(server_music[message.guild.id].queue[0]){
                    play_radio(connection);
                }else{
                    connection.destroy();
                    remove_queue();
                }
            });
        }
        // SHUFFLING QUEUE
        function shuffleArray(song, song_name) {
            for (var i = song.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var song_temp = song[i];
                var song_name_temp = song_name[i];

                song[i] = song[j];
                song_name[i] = song_name[j];

                song[j] = song_temp;
                song_name[j] = song_name_temp;
            }
        }
        // JOINING CHANNEL IF REQUIRED
        function run_play(type='music'){
            if(message.guild.members.cache.get(bot.user.id).voice.channel) return;
            const pripojenie = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            if(type == 'radio'){
                play_radio(pripojenie);
            }else{
                play(pripojenie);
            }
        }
        //CHECK IF QUEUE EXISTS
        function check_queue(){
            if(!server_music[message.guild.id]){
                server_music[message.guild.id] = {
                    queue: [],
                    song_names: [],
                    currentlyPlaying: "Nothing",
                    type: "None"
                };
            }
        }
        //REMOVE OBJECT
        function remove_queue(){
            if(server_music[message.guild.id]){
                delete server_music[message.guild.id];
            }
        }
        //CHECK IF CAN PLAY RESOURCE
        function check_availability_to_play(audio_type){
            if(server_music[message.guild.id].type == "None") return true;
            if(server_music[message.guild.id]){
                if(server_music[message.guild.id].type == audio_type){
                    return true;
                }
            }
            return false;
        }

        if(message.content.startsWith(PREFIX + "radio")){
            let voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.reply("You need to be in voice channel");

            let args = message.content.split(" ");
            if(!args[1]) return message.reply("You need to specify stream");

            check_queue();
            let availability = check_availability_to_play('radio');
            if(availability == false){
                return message.reply("You cannot add radio station while music from bot is playing");
            }

            server_music[message.guild.id].queue.push(args[1]);
            server_music[message.guild.id].song_names.push(args[1]);
            message.reply(`Playing radio: ${args[1]}`);
            return run_play('radio');
        }

        if(message.content.startsWith(PREFIX + "play")){
            let voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.reply("You need to be in voice channel");

            let args = message.content.split(" ");
            if(!args[1]) return message.reply("You need to specify song");

            check_queue();
            let availability = check_availability_to_play('music');
            if(availability == false){
                return message.reply("You cannot play music while radio from bot is playing");
            }

            if(isNaN(args[1])){
                if(args[1].startsWith("https://www.youtube.com/watch?v=") || args[1].startsWith("https://youtube.com/watch?v=") || args[1].startsWith("https://youtu.be/")){
                    server_music[message.guild.id].queue.push(args[1]);
                    server_music[message.guild.id].song_names.push(args[1]);
                    message.reply(`Added to queue: ${args[1]}`);
                    return run_play();
                }else{
                    let yt_songy = message.content.split("play ")[1];
                    let yt_info = await ytSearch(yt_songy);
                    let videos = yt_info.videos.slice(0, 5);
                    let embed = new EmbedBuilder();
                    embed.setTitle("MUSIC SEARCH");
                    embed.setColor("#431529");
                    
                    for(let i=0; i<videos.length; i++){
                        embed.addFields({name: `**${i+1}.**`, value: `${videos[i].title} (${videos[i].duration.timestamp})`});
                    }

                    const filter = i => i.user.id === message.author.id;

                    const buttonComponents = [];
                    for (let i = 0; i < videos.length; i++) {
                        const customId = `${i + 1}`;
                        buttonComponents.push(
                            new ButtonBuilder()
                                .setCustomId(customId)
                                .setLabel(`${i + 1}.`)
                                .setStyle(ButtonStyle.Primary)
                        );
                    }

                    const row = new ActionRowBuilder().addComponents(...buttonComponents);

                    message.reply({ embeds: [embed], components: [row]}).then(reac => {

                        const collector = reac.createMessageComponentCollector({ filter, max:1, time: 8000 });
                        collector.on('collect', reaction => {
                            reaction.deferUpdate();
                            const index = parseInt(reaction.customId) - 1;
                            if (videos[index]) {
                                message.reply(`Added to queue: ${videos[index].title} (${videos[index].duration.timestamp})`);
                                server_music[message.guild.id].queue.push(videos[index].url);
                                server_music[message.guild.id].song_names.push(videos[index].title);
                                return run_play();
                            }
                            reac.delete();
                        });
                        collector.on('end', collected => {
                            if(collected.size == 0) return message.reply("You have not added any reaction");
                        });
                    });     
                }
            }else{
                if(args[1] <= 0) return message.reply("Neexistujúca pozícia");
                let riadok = 1;
                var files = fs.readFileSync('./songs/songy.txt', 'utf-8');
                let find = false;
                files.split(/\r?\n/).forEach(line =>  {
                    if(args[1] == riadok){
                        let riadek = line.split("¤");
                        server_music[message.guild.id].queue.push(riadek[0]);
                        server_music[message.guild.id].song_names.push(riadek[1]);
                        message.reply(`Added to queue: ${riadek[1]}`);
                        find = true;
                    }
                    riadok+=1;
                });
                if(find == false) return message.reply("Neexistujúca pozícia");
                return run_play();
            }
        }

        if(message.content === PREFIX + "skip"){
            if(!server_music[message.guild.id].queue[0]) return message.reply("Cannot skip because queue is empty");
            message.reply(`Skipping <:PepeOK:861282743488741418>`);
            const connection = getVoiceConnection(message.guild.id);

            if(server_music[message.guild.id].type == "music"){
                play(connection);
            }else if(server_music[message.guild.id].type == "radio"){
                play_radio(connection)
            }
        }

        if(message.content === PREFIX + "queue"){
            let sum;
            if(server_music[message.guild.id]){
                if(server_music[message.guild.id].queue.length > 5){
                    sum = 5;
                }else{
                    sum = server_music[message.guild.id].queue.length;

                }
            }else{
                sum = 0;
            }
            let embed = new EmbedBuilder();
            embed.setTitle("QUEUE");
            embed.setColor("#4a48b9");
            if(sum > 0){
                for(let i = 0; i<sum; i++){
                    embed.addFields({name: "Song:", value: server_music[message.guild.id].song_names[i].toString()});
                }
                embed.setFooter({text:`Songs in queue: ${server_music[message.guild.id].queue.length}`});
            }else{
                embed.setDescription("EMPTY");
                return message.reply({embeds: [embed]});
            } 
            message.reply({embeds: [embed]});
        }

        if(message.content === PREFIX + "leave"){
            if(!message.guild.members.cache.get(bot.user.id).voice.channel)return message.reply("Nesom v roomke pepeg");
            message.reply("<a:peepoHey:763500258520072202>");
            const connection = getVoiceConnection(message.guild.id);
            connection.destroy();
            remove_queue();
        }

        if(message.content === PREFIX + "shuffle"){
            message.reply("Shuffling queue");
            shuffleArray(server_music[message.guild.id].queue, server_music[message.guild.id].song_names);
        }

        if(message.content === PREFIX + "now playing" || message.content === PREFIX + "np"){
            let embed = new EmbedBuilder();
            embed.setTitle("NOW PLAYING");
            embed.setColor("ab45af");
            if(!server_music[message.guild.id]){
                embed.setDescription("Nothing");
            }else{
                embed.setDescription(server_music[message.guild.id].currentlyPlaying);
            }
            message.reply({embeds: [embed]});
        }
    }
}
