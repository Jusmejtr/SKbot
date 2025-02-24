const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');

const musicQueue = new Map(); // Using Map instead of an object for better memory handling

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

        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel!', flags: MessageFlags.Ephemeral });

        switch (subcommand) {
            case 'play': {
                const query = interaction.options.getString('query');
                await playMusic(interaction, guildId, voiceChannel, query);
                break;
            }
            case 'skip': {
                await skipMusic(interaction, guildId);
                break;
            }
            case 'queue': {
                await showQueue(interaction, guildId);
                break;
            }
            case 'shuffle': {
                await shuffleQueue(interaction, guildId);
                break;
            }
            case 'leave': {
                await leaveChannel(interaction, guildId);
                break;
            }
            case 'nowplaying': {
                await nowPlaying(interaction, guildId);
                break;
            }
        }
    }
};

// Function to play music
async function playMusic(interaction, guildId, voiceChannel, query) {
    await interaction.deferReply();

    let serverQueue = musicQueue.get(guildId);
    if (!serverQueue) {
        serverQueue = { queue: [], currentlyPlaying: null, player: createAudioPlayer() };
        musicQueue.set(guildId, serverQueue);
    }

    // If it's a direct YouTube link, play it immediately
    if (query.startsWith('https://www.youtube.com') || query.startsWith('https://youtube.com') || query.startsWith('https://youtu.be/')) {
        return await addSongToQueue(interaction, guildId, voiceChannel, { url: query, title: query });
    }

    // Perform YouTube search
    const ytResults = await ytSearch(query);
    const videos = ytResults.videos.slice(0, 5); // Get top 5 results

    if (videos.length === 0) {
        return interaction.followUp({ content: 'No results found.', flags: MessageFlags.Ephemeral });
    }

    // Create an embed with search results
    const embed = new EmbedBuilder()
        .setTitle("🎵 Select a Song")
        .setColor("#431529")
        .setDescription("Type the number of the song you want to play.");

    videos.forEach((video, index) => {
        embed.addFields({ name: `**${index + 1}.**`, value: `[${video.title}](${video.url}) (${video.duration.timestamp})` });
    });

    // Create buttons for the user to select a song
    const row = new ActionRowBuilder();
    videos.forEach((video, index) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`${index}`)
                .setLabel(`${index + 1}.`)
                .setStyle(ButtonStyle.Primary)
        );
    });

    // Send a message with the embed and buttons
    const selectionMessage = await interaction.followUp({
        embeds: [embed],
        components: [row]
    });

    // Create a collector to listen for button interactions
    const filter = i => i.user.id === interaction.user.id;
    const collector = selectionMessage.createMessageComponentCollector({ filter, max: 1, time: 8000 });

    collector.on('collect', async i => {
        const selectedIndex = parseInt(i.customId);
        const selectedSong = videos[selectedIndex];

        await addSongToQueue(i, guildId, voiceChannel, selectedSong);
        await i.update({ content: `Added to queue: **${selectedSong.title}** (${selectedSong.timestamp})`, embeds: [], components: [] });
        collector.stop();
    });

    collector.on('end', () => {
        selectionMessage.edit({ components: [] }).catch(() => { });
    });
}

// Helper function to add a song to the queue and start playing if necessary
async function addSongToQueue(interaction, guildId, voiceChannel, song) {
    let serverQueue = musicQueue.get(guildId);
    serverQueue.queue.push(song);

    if (!serverQueue.currentlyPlaying) {
        playNextSong(guildId, voiceChannel);
    }
}

// Function to play the next song in the queue
function playNextSong(guildId, voiceChannel) {
    const serverQueue = musicQueue.get(guildId);
    if (!serverQueue || !serverQueue.queue.length) {
        const connection = getVoiceConnection(guildId);
        if (connection) connection.destroy();
        musicQueue.delete(guildId);
        return;
    }

    const connection = getVoiceConnection(guildId) || joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    const song = serverQueue.queue.shift();
    serverQueue.currentlyPlaying = song;

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    serverQueue.player.play(resource);
    connection.subscribe(serverQueue.player);

    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        playNextSong(guildId, voiceChannel);
    });

    serverQueue.player.on('error', error => {
        console.error('Error:', error);
        playNextSong(guildId, voiceChannel);
    });
}

// Function to skip the current song
async function skipMusic(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    if (!serverQueue || !serverQueue.currentlyPlaying) {
        return interaction.reply({ content: 'No song is currently playing.', flags: MessageFlags.Ephemeral });
    }

    interaction.reply({ content: 'Skipping song...' });
    playNextSong(guildId, interaction.member.voice.channel);
}

// Function to show the queue
async function showQueue(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    if (!serverQueue || serverQueue.queue.length === 0) {
        return interaction.reply({ content: 'The queue is empty.', flags: MessageFlags.Ephemeral });
    }

    const queueList = serverQueue.queue.slice(0, 5).map((song, index) => `**${index + 1}.** [${song.title}](${song.url})`).join('\n');
    const embed = new EmbedBuilder()
        .setTitle('Music Queue')
        .setColor('#4a48b9')
        .setDescription(queueList)
        .setFooter({ text: `Total songs in queue: ${serverQueue.queue.length}` });

    interaction.reply({ embeds: [embed] });
}

// Function to shuffle the queue
async function shuffleQueue(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    if (!serverQueue || serverQueue.queue.length < 2) {
        return interaction.reply({ content: 'Not enough songs to shuffle.', flags: MessageFlags.Ephemeral });
    }

    for (let i = serverQueue.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [serverQueue.queue[i], serverQueue.queue[j]] = [serverQueue.queue[j], serverQueue.queue[i]];
    }

    interaction.reply({ content: 'Queue shuffled!' });
}

// Function to leave the voice channel
async function leaveChannel(interaction, guildId) {
    const connection = getVoiceConnection(guildId);
    if (!connection) return interaction.reply({ content: 'Not connected to a voice channel.', flags: MessageFlags.Ephemeral });

    connection.destroy();
    musicQueue.delete(guildId);
    interaction.reply({ content: 'Disconnected from voice channel.' });
}

// Function to show the currently playing song
async function nowPlaying(interaction, guildId) {
    const serverQueue = musicQueue.get(guildId);
    const currentlyPlaying = serverQueue?.currentlyPlaying || { title: 'Nothing' };

    const embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setColor('#ab45af')
        .setDescription(`[${currentlyPlaying.title}](${currentlyPlaying.url})`)

    interaction.reply({ embeds: [embed] });
}