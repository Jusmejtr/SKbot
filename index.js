require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, MessageFlags } = require('discord.js');
const { CronJob } = require('cron');

const config = require('./config');
const db = require('./utils/db');
const { loadCommands, deployCommands } = require('./utils/commands');
const { handleEmoteMessage } = require('./utils/emote-replacer');
const { runExpirations, onVoiceStateUpdate } = require('./utils/expirations');
const { checkGameUpdates } = require('./utils/game-updates');

// Jedna nezachytená chyba nesmie zhodiť celého bota
process.on('unhandledRejection', (err) => console.error('Nezachytená chyba (promise):', err));
process.on('uncaughtException', (err) => console.error('Nezachytená chyba:', err));

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent
    ]
});

const commands = loadCommands();

// ---------- štart ----------

bot.once('clientReady', async () => {
    console.log(`Bot je online! (${bot.guilds.cache.size} serverov)`);
    bot.user.setPresence({ activities: [{ name: '/ príkazy', type: ActivityType.Watching }], status: 'online' });

    await deployCommands(commands).catch(err => console.error('Registrácia príkazov zlyhala:', err));

    // jackpot stávky, ktoré ostali po páde / reštarte bota, sa vrátia hráčom
    const vratene = db.refundJackpotBets();
    if (vratene.length) console.log(`Vrátené jackpot stávky: ${vratene.map(b => `${b.user_id}=${b.amount}`).join(', ')}`);

    // vypršané VIP / farebné mená / mute – hneď a potom každú minútu
    await runExpirations(bot);
    new CronJob('* * * * *', () => runExpirations(bot), null, true, config.timezone);

    // game updates zo Steamu – každú hodinu
    new CronJob('0 * * * *', () => checkGameUpdates(bot), null, true, config.timezone);
    checkGameUpdates(bot);

    // narodeniny a výročie – každý deň o 10:00
    new CronJob('0 10 * * *', () => sendBirthdays(bot), null, true, config.timezone);
});

// Dnešný deň a mesiac v časovom pásme bota
function today() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: config.timezone, day: 'numeric', month: 'numeric', year: 'numeric' })
        .formatToParts(new Date());
    const get = (type) => Number(parts.find(p => p.type === type).value);
    return { day: get('day'), month: get('month'), year: get('year') };
}

async function sendBirthdays(bot) {
    const channel = bot.channels.cache.get(config.channels.general);
    if (!channel) return;
    const { day, month, year } = today();

    for (const b of config.birthdays.filter(b => b.day === day && b.month === month)) {
        const sprava = await channel.send(`Všetko najlepšie k narodeninám <@${b.userId}> 🎉`).catch(console.error);
        await sprava?.react('🎉').catch(() => {});
    }
    const { anniversary } = config;
    if (anniversary.day === day && anniversary.month === month) {
        await channel.send(`${year - anniversary.year}. výročie SKbota na serveri 🎉`).catch(console.error);
    }
}

// ---------- udalosti ----------

bot.on('messageCreate', (message) => {
    handleEmoteMessage(bot, message).catch(console.error);
});

bot.on('voiceStateUpdate', (oldState, newState) => {
    onVoiceStateUpdate(oldState, newState).catch(console.error);
});

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

    const command = interaction.commandGuildId == null
        ? commands.global.get(interaction.commandName)
        : commands.guild.get(interaction.commandName);
    if (!command) return;

    // ak si niekto zmenil meno, aktualizuje sa aj v rebríčku
    if (interaction.commandGuildId) db.updateName(interaction.user.id, interaction.user.tag);

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(`Chyba v príkaze /${interaction.commandName}:`, err);
        const payload = { content: 'Nastala chyba pri vykonávaní príkazu', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
        else await interaction.reply(payload).catch(() => {});
    }
});

bot.on('emojiCreate', (emoji) => emoji.guild.emojis.fetch().catch(console.error));
bot.on('emojiUpdate', (oldEmoji, newEmoji) => newEmoji.guild.emojis.fetch().catch(console.error));
bot.on('emojiDelete', (emoji) => emoji.guild.emojis.fetch().catch(console.error));

bot.login(process.env.DISCORD_TOKEN);
