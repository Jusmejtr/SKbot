const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, getVoiceConnection, StreamType, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytdlp = require('youtube-dl-exec');
const { spawn } = require('child_process');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

const isWindows = process.platform === 'win32';
const ytdlpPath = path.join(
    __dirname, '..', 'node_modules', 'youtube-dl-exec', 'bin',
    isWindows ? 'yt-dlp.exe' : 'yt-dlp'
);

const musicQueue = new Map();

function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function searchYouTube(query, limit = 5) {
    try {
        const result = await ytdlp(`ytsearch${limit}:${query}`, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            flatPlaylist: true,
        });

        return result.entries || [];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

async function getVideoInfo(url) {
    try {
        const result = await ytdlp(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            skipDownload: true,
            noPlaylist: true,
        });
        return result;
    } catch (error) {
        console.error('Video info error:', error);
        return null;
    }
}

function createYtdlpStream(url) {
    const process = spawn(ytdlpPath, [
        url,
        '-o', '-',
        '-f', 'bestaudio/best',
        '--no-playlist',
        '--extractor-args', 'youtube:player_client=android,ios',
        '--no-check-certificate',
        '--geo-bypass'
    ], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    process.on('error', (err) => {
        console.error('yt-dlp process error:', err);
    });

    process.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('Broken pipe') || message.includes('Errno 32')) return;

        if (message.includes('ERROR:') && !message.includes('[download]')) {
            console.error('yt-dlp error:', message);
        }
    });

    process.on('close', (code) => {
        if (code !== 0 && code !== null && code !== 1) {
            console.error(`yt-dlp exited with code ${code}`);
        }
    });

    return process;
}

// Spawn ffmpeg ourselves instead of letting @discordjs/voice use prism-media's
// FFmpeg wrapper, which breaks on newer Node.js (ERR_METHOD_NOT_IMPLEMENTED _write).
function createAudioPipeline(url) {
    const ytdlpProcess = createYtdlpStream(url);
    const ffmpegProcess = spawn(ffmpegPath || 'ffmpeg', [
        '-hide_banner', '-loglevel', 'error',
        '-i', 'pipe:0',
        '-analyzeduration', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1'
    ], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    ffmpegProcess.on('error', (err) => console.error('ffmpeg process error:', err));
    ffmpegProcess.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('Broken pipe')) return;
        console.error('ffmpeg:', message.trim());
    });
    // Ignore EPIPE when ffmpeg is killed while yt-dlp is still writing
    ffmpegProcess.stdin.on('error', () => { });
    ytdlpProcess.stdout.on('error', () => { });

    ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);

    return {
        stream: ffmpegProcess.stdout,
        kill() {
            try { ytdlpProcess.kill(); } catch { }
            try { ffmpegProcess.kill(); } catch { }
        }
    };
}

async function playNextSong(guildId) {
    const serverQueue = musicQueue.get(guildId);

    if (!serverQueue || serverQueue.queue.length === 0) {
        if (serverQueue) {
            serverQueue.currentlyPlaying = null;
            if (serverQueue.audioProcess) {
                serverQueue.audioProcess.kill();
                serverQueue.audioProcess = null;
            }
        }

        // No more songs: stop player, destroy connection and remove queue
        try {
            const connection = getVoiceConnection(guildId);
            if (connection) {
                serverQueue?.player?.stop(true);
                connection.destroy();
            }
        } catch (err) {
            console.error('Error while cleaning up connection:', err);
        }

        musicQueue.delete(guildId);
        return;
    }

    const song = serverQueue.queue.shift();
    serverQueue.currentlyPlaying = song;

    try {
        let connection = getVoiceConnection(guildId);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: serverQueue.voiceChannel.id,
                guildId,
                adapterCreator: serverQueue.voiceChannel.guild.voiceAdapterCreator
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    console.error('Connection disconnected:', error);
                    connection.destroy();
                    musicQueue.delete(guildId);
                }
            });
        }

        if (serverQueue.audioProcess) {
            serverQueue.audioProcess.kill();
        }

        const audioProcess = createAudioPipeline(song.url);
        serverQueue.audioProcess = audioProcess;
        const stream = audioProcess.stream;

        stream.on('error', (error) => {
            if (error.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
            console.error('Stream error:', error);
        });

        const resource = createAudioResource(stream, {
            inputType: StreamType.Raw
        });

        resource.playStream.on('error', (error) => {
            if (error.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
            console.error('Resource stream error:', error);
        });

        serverQueue.player.play(resource);
        connection.subscribe(serverQueue.player);

    } catch (error) {
        console.error('Error playing song:', error);
        await playNextSong(guildId);
    }
}

async function playMusic(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query');
    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        return interaction.followUp({ content: 'Musíš byť vo voice roomke!', flags: MessageFlags.Ephemeral });
    }

    let serverQueue = musicQueue.get(guildId);
    if (!serverQueue) {
        const player = createAudioPlayer();
        serverQueue = {
            queue: [],
            currentlyPlaying: null,
            audioProcess: null,
            player,
            voiceChannel
        };
        musicQueue.set(guildId, serverQueue);

        player.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                playNextSong(guildId).catch(error => console.error('Error advancing queue:', error));
            }
        });

        player.on('error', error => {
            console.error('Player error:', error);
        });
    }

    try {
        const isURL = query.includes('youtube.com') || query.includes('youtu.be');

        if (isURL) {
            const videoInfo = await getVideoInfo(query);
            if (!videoInfo) {
                return interaction.followUp({ content: 'Nepodarilo sa načítať informácie o videu.', flags: MessageFlags.Ephemeral });
            }

            const song = {
                url: videoInfo.webpage_url || query,
                title: videoInfo.title,
                duration: formatDuration(videoInfo.duration),
                author: videoInfo.uploader || videoInfo.channel || 'Unknown',
                thumbnail: videoInfo.thumbnail
            };

            serverQueue.queue.push(song);

            if (!serverQueue.currentlyPlaying) {
                await playNextSong(guildId);
            }

            return interaction.followUp({
                content: `🎵 Pridané do poradia: **${song.title}** – ${song.author} (${song.duration})`
            });
        }

        const searchResults = await searchYouTube(query, 5);

        if (!searchResults || searchResults.length === 0) {
            return interaction.followUp({ content: 'Nič som nenašiel.', flags: MessageFlags.Ephemeral });
        }

        const results = searchResults.slice(0, 5);

        const embed = new EmbedBuilder()
            .setTitle('🎵 Vyber pesničku')
            .setColor('#FF0000')
            .setDescription('Klikni na tlačidlo a vyber pesničku.');

        results.forEach((video, index) => {
            const duration = formatDuration(video.duration);
            const author = video.uploader || video.channel || 'Unknown';
            embed.addFields({
                name: `**${index + 1}.** ${video.title}`,
                value: `by ${author} (${duration})`
            });
        });

        const row = new ActionRowBuilder();
        results.forEach((_, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`music_${index}`)
                    .setLabel(`${index + 1}`)
                    .setStyle(ButtonStyle.Danger)
            );
        });

        const selectionMessage = await interaction.followUp({
            embeds: [embed],
            components: [row]
        });

        const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('music_');
        const collector = selectionMessage.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            try {
                // Acknowledge within 3s so a slow yt-dlp spawn cannot expire the interaction
                await i.deferUpdate();

                const selectedIndex = parseInt(i.customId.split('_')[1]);
                const selectedVideo = results[selectedIndex];

                const song = {
                    url: selectedVideo.url || `https://www.youtube.com/watch?v=${selectedVideo.id}`,
                    title: selectedVideo.title,
                    duration: formatDuration(selectedVideo.duration),
                    author: selectedVideo.uploader || selectedVideo.channel || 'Unknown',
                    thumbnail: selectedVideo.thumbnail || selectedVideo.thumbnails?.[0]?.url
                };

                serverQueue.queue.push(song);

                if (!serverQueue.currentlyPlaying) {
                    await playNextSong(guildId);
                }

                await i.editReply({
                    content: `🎵 Pridané do poradia: **${song.title}** – ${song.author} (${song.duration})`,
                    embeds: [],
                    components: []
                });
            } catch (error) {
                if (error.code === 10062) return;
                console.error('Error handling song selection:', error);
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                selectionMessage.edit({ content: 'Čas na výber vypršal.', embeds: [], components: [] }).catch(() => { });
            }
        });

    } catch (error) {
        console.error('Error in playMusic:', error);
        return interaction.followUp({ content: 'Pri hľadaní pesničky nastala chyba.', flags: MessageFlags.Ephemeral });
    }
}

async function skipMusic(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = musicQueue.get(guildId);

    if (!serverQueue || !serverQueue.currentlyPlaying) {
        return interaction.reply({ content: 'Momentálne nič nehrá.', flags: MessageFlags.Ephemeral });
    }

    // If there's no next song in the queue, don't allow skipping
    if (!serverQueue.queue || serverQueue.queue.length === 0) {
        return interaction.reply({ content: 'V poradí nie je ďalšia pesnička.', flags: MessageFlags.Ephemeral });
    }

    if (serverQueue.audioProcess) {
        serverQueue.audioProcess.kill();
        serverQueue.audioProcess = null;
    }

    serverQueue.player.stop(true);
    interaction.reply({ content: '⏭️ Pesnička preskočená.' });
}

async function showQueue(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = musicQueue.get(guildId);

    if (!serverQueue || serverQueue.queue.length === 0) {
        const currentSong = serverQueue?.currentlyPlaying;
        if (currentSong) {
            return interaction.reply({
                content: `**Práve hrá:** ${currentSong.title}\n\nPoradie je prázdne.`
            });
        }
        return interaction.reply({ content: 'Poradie je prázdne.', flags: MessageFlags.Ephemeral });
    }

    const queueList = serverQueue.queue.slice(0, 10).map((song, index) =>
        `**${index + 1}.** ${song.title} - ${song.author} (${song.duration})`
    ).join('\n');

    const embed = new EmbedBuilder()
        .setTitle('🎵 Poradie pesničiek')
        .setColor('#FF0000')
        .setDescription(queueList)
        .setFooter({ text: `Pesničiek v poradí: ${serverQueue.queue.length}` });

    if (serverQueue.currentlyPlaying) {
        embed.addFields({
            name: '🔊 Práve hrá',
            value: `${serverQueue.currentlyPlaying.title || 'Unknown'} - ${serverQueue.currentlyPlaying.author || 'Unknown'}`
        });
    }

    interaction.reply({ embeds: [embed] });
}

async function shuffleQueue(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = musicQueue.get(guildId);

    if (!serverQueue || serverQueue.queue.length < 2) {
        return interaction.reply({ content: 'Na zamiešanie nie je dosť pesničiek.', flags: MessageFlags.Ephemeral });
    }

    for (let i = serverQueue.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [serverQueue.queue[i], serverQueue.queue[j]] = [serverQueue.queue[j], serverQueue.queue[i]];
    }

    interaction.reply({ content: '🔀 Poradie zamiešané!' });
}

async function leaveChannel(interaction) {
    const guildId = interaction.guild.id;
    const connection = getVoiceConnection(guildId);

    if (!connection) {
        return interaction.reply({ content: 'Nie som pripojený vo voice roomke.', flags: MessageFlags.Ephemeral });
    }

    const serverQueue = musicQueue.get(guildId);
    if (serverQueue) {
        if (serverQueue.audioProcess) {
            serverQueue.audioProcess.kill();
        }
        serverQueue.player.stop(true);
    }

    connection.destroy();
    musicQueue.delete(guildId);
    interaction.reply({ content: '👋 Odpojil som sa z voice roomky.' });
}

async function nowPlaying(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = musicQueue.get(guildId);
    const currentlyPlaying = serverQueue?.currentlyPlaying;

    if (!currentlyPlaying) {
        return interaction.reply({ content: 'Momentálne nič nehrá.', flags: MessageFlags.Ephemeral });
    }

    const embed = new EmbedBuilder()
        .setTitle('🔊 Práve hrá')
        .setColor('#FF0000')
        .setDescription(`**${currentlyPlaying.title || 'Unknown'}**`)
        .addFields(
            { name: 'Kanál', value: currentlyPlaying.author || 'Unknown', inline: true },
            { name: 'Dĺžka', value: currentlyPlaying.duration || 'Unknown', inline: true }
        );

    if (currentlyPlaying.thumbnail && currentlyPlaying.thumbnail.startsWith('http')) {
        embed.setThumbnail(currentlyPlaying.thumbnail);
    } else if (currentlyPlaying.thumbnail && currentlyPlaying.thumbnail.startsWith('//')) {
        embed.setThumbnail('https:' + currentlyPlaying.thumbnail);
    }

    interaction.reply({ embeds: [embed] });
}

module.exports = {
    musicQueue,
    formatDuration,
    playMusic,
    skipMusic,
    showQueue,
    shuffleQueue,
    leaveChannel,
    nowPlaying,
};