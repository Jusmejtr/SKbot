const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
require('dotenv').config();

module.exports = {
    name: "music",
    description: "play a music",

    async execute(bot, message, server_music) {
        const PREFIX = process.env.PREFIX;

        async function play(connection) {
            const player = createAudioPlayer();

            try {
                const stream = ytdl(server_music[message.guild.id].queue[0], { filter: 'audioonly' });
                const resource = createAudioResource(stream);
                player.play(resource);
                connection.subscribe(player);

                server_music[message.guild.id].queue.shift();
                server_music[message.guild.id].currentlyPlaying = server_music[message.guild.id].song_names.shift();
                server_music[message.guild.id].type = "music";

                player.on(AudioPlayerStatus.Idle, () => {
                    if (server_music[message.guild.id].queue.length > 0) {
                        play(connection);
                    } else {
                        connection.destroy();
                        removeQueue();
                    }
                });

                player.on('error', error => {
                    console.error('Error:', error.message);
                    connection.destroy();
                    removeQueue();
                });

            } catch (error) {
                console.error('Error playing music:', error.message);
                connection.destroy();
                removeQueue();
            }
        }

        async function playRadio(connection) {
            const player = createAudioPlayer();
            try {
                const resource = createAudioResource(server_music[message.guild.id].queue[0]);
                player.play(resource);
                connection.subscribe(player);

                server_music[message.guild.id].queue.shift();
                server_music[message.guild.id].currentlyPlaying = server_music[message.guild.id].song_names.shift();
                server_music[message.guild.id].type = "radio";

                player.on(AudioPlayerStatus.Idle, () => {
                    if (server_music[message.guild.id].queue.length > 0) {
                        playRadio(connection);
                    } else {
                        connection.destroy();
                        removeQueue();
                    }
                });

                player.on('error', error => {
                    console.error('Error:', error.message);
                    connection.destroy();
                    removeQueue();
                });

            } catch (error) {
                console.error('Error playing radio:', error.message);
                connection.destroy();
                removeQueue();
            }
        }

        function shuffleArray(array1, array2) {
            for (let i = array1.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array1[i], array1[j]] = [array1[j], array1[i]];
                [array2[i], array2[j]] = [array2[j], array2[i]];
            }
        }

        function runPlay(type = 'music') {
            if (message.guild.members.cache.get(bot.user.id).voice.channel) return;
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            if (type === 'radio') {
                playRadio(connection);
            } else {
                play(connection);
            }
        }

        function checkQueue() {
            if (!server_music[message.guild.id]) {
                server_music[message.guild.id] = {
                    queue: [],
                    song_names: [],
                    currentlyPlaying: "Nothing",
                    type: "None"
                };
            }
        }

        function removeQueue() {
            if (server_music[message.guild.id]) {
                delete server_music[message.guild.id];
            }
        }

        function checkAvailabilityToPlay(audioType) {
            if (server_music[message.guild.id].type === "None") return true;
            if (server_music[message.guild.id]) {
                if (server_music[message.guild.id].type === audioType) {
                    return true;
                }
            }
            return false;
        }

        if (message.content.startsWith(PREFIX + "radio")) {
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.reply("You need to be in a voice channel");

            const args = message.content.split(" ");
            if (!args[1]) return message.reply("You need to specify a stream");

            checkQueue();
            const availability = checkAvailabilityToPlay('radio');
            if (!availability) {
                return message.reply("You cannot add a radio station while music from the bot is playing");
            }

            server_music[message.guild.id].queue.push(args[1]);
            server_music[message.guild.id].song_names.push(args[1]);
            message.reply(`Playing radio: ${args[1]}`);
            return runPlay('radio');
        }

        if (message.content.startsWith(PREFIX + "play")) {
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.reply("You need to be in a voice channel");

            const args = message.content.split(" ");
            if (!args[1]) return message.reply("You need to specify a song");

            checkQueue();
            const availability = checkAvailabilityToPlay('music');
            if (!availability) {
                return message.reply("You cannot play music while radio from the bot is playing");
            }

            if (isNaN(args[1])) {
                if (args[1].startsWith("https://www.youtube.com/watch?v=") || args[1].startsWith("https://youtube.com/watch?v=") || args[1].startsWith("https://youtu.be/")) {
                    server_music[message.guild.id].queue.push(args[1]);
                    server_music[message.guild.id].song_names.push(args[1]);
                    message.reply(`Added to queue: ${args[1]}`);
                    return runPlay();
                } else {
                    const ytSong = message.content.split("play ")[1];
                    const ytInfo = await ytSearch(ytSong);
                    const videos = ytInfo.videos.slice(0, 5);
                    const embed = new EmbedBuilder()
                        .setTitle("MUSIC SEARCH")
                        .setColor("#431529");

                    for (let i = 0; i < videos.length; i++) {
                        embed.addFields({ name: `**${i + 1}.**`, value: `${videos[i].title} (${videos[i].duration.timestamp})` });
                    }

                    const buttonComponents = videos.map((video, i) => 
                        new ButtonBuilder()
                            .setCustomId(`${i + 1}`)
                            .setLabel(`${i + 1}.`)
                            .setStyle(ButtonStyle.Primary)
                    );

                    const row = new ActionRowBuilder().addComponents(buttonComponents);

                    message.reply({ embeds: [embed], components: [row] }).then(reac => {
                        const collector = reac.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, max: 1, time: 8000 });
                        collector.on('collect', reaction => {
                            reaction.deferUpdate();
                            const index = parseInt(reaction.customId) - 1;
                            if (videos[index]) {
                                message.reply(`Added to queue: ${videos[index].title} (${videos[index].duration.timestamp})`);
                                server_music[message.guild.id].queue.push(videos[index].url);
                                server_music[message.guild.id].song_names.push(videos[index].title);
                                return runPlay();
                            }
                            reac.delete();
                        });
                        collector.on('end', collected => {
                            if (collected.size === 0) return message.reply("You have not added any reaction");
                        });
                    });
                }
            } else {
                if (args[1] <= 0) return message.reply("Invalid position");
                let lineNum = 1;
                const files = fs.readFileSync('./songs/songy.txt', 'utf-8');
                let found = false;
                files.split(/\r?\n/).forEach(line => {
                    if (args[1] == lineNum) {
                        const [url, name] = line.split("¤");
                        server_music[message.guild.id].queue.push(url);
                        server_music[message.guild.id].song_names.push(name);
                        message.reply(`Added to queue: ${name}`);
                        found = true;
                    }
                    lineNum++;
                });
                if (!found) return message.reply("Invalid position");
                return runPlay();
            }
        }

        if (message.content === PREFIX + "skip") {
            if (!server_music[message.guild.id] || server_music[message.guild.id].queue.length === 0) {
                return message.reply("Cannot skip because the queue is empty");
            }

            message.reply(`Skipping <:PepeOK:861282743488741418>`);

            const connection = getVoiceConnection(message.guild.id);

            if (server_music[message.guild.id].type === "music") {
                play(connection);
            } else if (server_music[message.guild.id].type === "radio") {
                playRadio(connection);
            }
        }

        if (message.content === PREFIX + "queue") {
            const sum = server_music[message.guild.id] ? Math.min(server_music[message.guild.id].queue.length, 5) : 0;
            const embed = new EmbedBuilder()
                .setTitle("QUEUE")
                .setColor("#4a48b9");

            if (sum > 0) {
                for (let i = 0; i < sum; i++) {
                    embed.addFields({ name: "Song:", value: server_music[message.guild.id].song_names[i].toString() });
                }
                embed.setFooter({ text: `Songs in queue: ${server_music[message.guild.id].queue.length}` });
            } else {
                embed.setDescription("EMPTY");
                return message.reply({ embeds: [embed] });
            }
            message.reply({ embeds: [embed] });
        }

        if (message.content === PREFIX + "leave") {
            if (!message.guild.members.cache.get(bot.user.id).voice.channel) return message.reply("I'm not in a room");
            message.reply("<a:peepoHey:763500258520072202>");
            const connection = getVoiceConnection(message.guild.id);
            connection.destroy();
            removeQueue();
        }

        if (message.content === PREFIX + "shuffle") {
            message.reply("Shuffling queue");
            shuffleArray(server_music[message.guild.id].queue, server_music[message.guild.id].song_names);
        }

        if (message.content === PREFIX + "now playing" || message.content === PREFIX + "np") {
            const embed = new EmbedBuilder()
                .setTitle("NOW PLAYING")
                .setColor("ab45af");

            embed.setDescription(server_music[message.guild.id]?.currentlyPlaying || "Nothing");
            message.reply({ embeds: [embed] });
        }
    }
};
