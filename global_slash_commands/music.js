const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, getVoiceConnection, StreamType } = require('@discordjs/voice');
const ytdlp = require('youtube-dl-exec');
const { spawn } = require('child_process');
const path = require('path');

// Get yt-dlp binary path - works on both Windows and Linux
const isWindows = process.platform === 'win32';
const ytdlpPath = path.join(
    __dirname, '..', 'node_modules', 'youtube-dl-exec', 'bin', 
    isWindows ? 'yt-dlp.exe' : 'yt-dlp'
);

const musicQueue = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Music player commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a song')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('YouTube URL or search term')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skip the current song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Show the current queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Shuffle the queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Disconnect from the voice channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('Show the currently playing song')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You must be in a voice channel!', flags: MessageFlags.Ephemeral });
        }

        switch (subcommand) {
            case 'play':
                await playMusic(interaction, guildId, voiceChannel);
                break;
            case 'skip':
                await skipMusic(interaction, guildId);
                break;
            case 'queue':
                await showQueue(interaction, guildId);
                break;
            case 'shuffle':
                await shuffleQueue(interaction, guildId);
                break;
            case 'leave':
                await leaveChannel(interaction, guildId);
                break;
            case 'nowplaying':
                await nowPlaying(interaction, guildId);
                break;
        }
    }
};

// Format duration from seconds to mm:ss
function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Search YouTube using yt-dlp
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

// Get video info using yt-dlp
async function getVideoInfo(url) {
    try {
        const result = await ytdlp(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
        });
        return result;
    } catch (error) {
        console.error('Video info error:', error);
        return null;
    }
}

// Create audio stream using yt-dlp
function createYtdlpStream(url) {
    const process = spawn(ytdlpPath, [
        url,
        '-o', '-',
        '-f', 'bestaudio[ext=webm][acodec=opus]/bestaudio/best',
        '--no-playlist',
        '-q'
    ], {
        stdio: ['ignore', 'pipe', 'ignore']
    });

    process.on('error', (err) => {
        console.error('yt-dlp process error:', err);
    });

    return process.stdout;
}

// Function to play music
async function playMusic(interaction, guildId, voiceChannel) {
    await interaction.deferReply();

    const query = interaction.options.getString('query');

    let serverQueue = musicQueue.get(guildId);
    if (!serverQueue) {
        const player = createAudioPlayer();
        serverQueue = { 
            queue: [], 
            currentlyPlaying: null, 
            player,
            voiceChannel
        };
        musicQueue.set(guildId, serverQueue);

        // Set up player event listeners once
        player.on(AudioPlayerStatus.Idle, () => {
            playNextSong(guildId);
        });

        player.on('error', error => {
            console.error('Player error:', error);
            playNextSong(guildId);
        });
    }

    try {
        // Check if it's a YouTube URL
        const isURL = query.includes('youtube.com') || query.includes('youtu.be');
        
        if (isURL) {
            const videoInfo = await getVideoInfo(query);
            
            if (!videoInfo) {
                return interaction.followUp({ content: 'Could not get video info.', flags: MessageFlags.Ephemeral });
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
                content: `🎵 Added to queue: **${song.title}** by ${song.author} (${song.duration})`
            });
        }

        // Search YouTube
        const searchResults = await searchYouTube(query, 5);

        if (!searchResults || searchResults.length === 0) {
            return interaction.followUp({ content: 'No results found.', flags: MessageFlags.Ephemeral });
        }

        const results = searchResults.slice(0, 5);

        // Create embed with search results
        const embed = new EmbedBuilder()
            .setTitle('🎵 Select a Song')
            .setColor('#FF0000')
            .setDescription('Click a button to select a song.');

        results.forEach((video, index) => {
            const duration = formatDuration(video.duration);
            const author = video.uploader || video.channel || 'Unknown';
            embed.addFields({ 
                name: `**${index + 1}.** ${video.title}`, 
                value: `by ${author} (${duration})` 
            });
        });

        // Create selection buttons
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

        // Collector for button interactions
        const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('music_');
        const collector = selectionMessage.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
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

            await i.update({ 
                content: `🎵 Added to queue: **${song.title}** by ${song.author} (${song.duration})`, 
                embeds: [], 
                components: [] 
            });
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                selectionMessage.edit({ content: 'Selection timed out.', embeds: [], components: [] }).catch(() => {});
            }
        });

    } catch (error) {
        console.error('Error in playMusic:', error);
        return interaction.followUp({ content: 'An error occurred while searching for the song.', flags: MessageFlags.Ephemeral });
    }
}

// Function to play the next song
async function playNextSong(guildId) {
    const serverQueue = musicQueue.get(guildId);
    
    if (!serverQueue || serverQueue.queue.length === 0) {
        if (serverQueue) {
            serverQueue.currentlyPlaying = null;
        }
        const connection = getVoiceConnection(guildId);
        if (connection) connection.destroy();
        musicQueue.delete(guildId);
        return;
    }

    const song = serverQueue.queue.shift();
    serverQueue.currentlyPlaying = song;

    try {
        // Connect to voice channel if not connected
        let connection = getVoiceConnection(guildId);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: serverQueue.voiceChannel.id,
                guildId,
                adapterCreator: serverQueue.voiceChannel.guild.voiceAdapterCreator
            });
        }

        const stream = createYtdlpStream(song.url);
        const resource = createAudioResource(stream, {
            inputType: StreamType.WebmOpus
        });

        serverQueue.player.play(resource);
        connection.subscribe(serverQueue.player);

    } catch (error) {
        console.error('Error playing song:', error);
        await playNextSong(guildId);
    }
}

// Skip current song
async function skipMusic(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    
    if (!serverQueue || !serverQueue.currentlyPlaying) {
        return interaction.reply({ content: 'No song is currently playing.', flags: MessageFlags.Ephemeral });
    }

    serverQueue.player.stop();
    interaction.reply({ content: '⏭️ Skipped the current song.' });
}

// Show the queue
async function showQueue(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    
    if (!serverQueue || serverQueue.queue.length === 0) {
        const currentSong = serverQueue?.currentlyPlaying;
        if (currentSong) {
            return interaction.reply({ 
                content: `**Now playing:** ${currentSong.title}\n\nThe queue is empty.` 
            });
        }
        return interaction.reply({ content: 'The queue is empty.', flags: MessageFlags.Ephemeral });
    }

    const queueList = serverQueue.queue.slice(0, 10).map((song, index) => 
        `**${index + 1}.** ${song.title} - ${song.author} (${song.duration})`
    ).join('\n');

    const embed = new EmbedBuilder()
        .setTitle('🎵 Music Queue')
        .setColor('#FF0000')
        .setDescription(queueList)
        .setFooter({ text: `Total songs in queue: ${serverQueue.queue.length}` });

    if (serverQueue.currentlyPlaying) {
        embed.addFields({ 
            name: '🔊 Now Playing', 
            value: `${serverQueue.currentlyPlaying.title} - ${serverQueue.currentlyPlaying.author}` 
        });
    }

    interaction.reply({ embeds: [embed] });
}

// Shuffle the queue
async function shuffleQueue(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    
    if (!serverQueue || serverQueue.queue.length < 2) {
        return interaction.reply({ content: 'Not enough songs to shuffle.', flags: MessageFlags.Ephemeral });
    }

    for (let i = serverQueue.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [serverQueue.queue[i], serverQueue.queue[j]] = [serverQueue.queue[j], serverQueue.queue[i]];
    }

    interaction.reply({ content: '🔀 Queue shuffled!' });
}

// Leave voice channel
async function leaveChannel(interaction, guildId) {
    const connection = getVoiceConnection(guildId);
    
    if (!connection) {
        return interaction.reply({ content: 'Not connected to a voice channel.', flags: MessageFlags.Ephemeral });
    }

    const serverQueue = musicQueue.get(guildId);
    if (serverQueue) {
        serverQueue.player.stop();
    }
    
    connection.destroy();
    musicQueue.delete(guildId);
    interaction.reply({ content: '👋 Disconnected from voice channel.' });
}

// Show currently playing song
async function nowPlaying(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    const currentlyPlaying = serverQueue?.currentlyPlaying;

    if (!currentlyPlaying) {
        return interaction.reply({ content: 'Nothing is playing right now.', flags: MessageFlags.Ephemeral });
    }

    const embed = new EmbedBuilder()
        .setTitle('🔊 Now Playing')
        .setColor('#FF0000')
        .setDescription(`**${currentlyPlaying.title}**`)
        .addFields(
            { name: 'Channel', value: currentlyPlaying.author, inline: true },
            { name: 'Duration', value: currentlyPlaying.duration, inline: true }
        );

    if (currentlyPlaying.thumbnail) {
        embed.setThumbnail(currentlyPlaying.thumbnail);
    }

    interaction.reply({ embeds: [embed] });
}