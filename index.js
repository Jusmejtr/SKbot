const { Client, Collection, EmbedBuilder, GatewayIntentBits, ActivityType, REST, Routes, MessageFlags } = require('discord.js');
const { handleEmoteMessage } = require('./utils/emote-replacer');
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

require('dotenv').config();

const { CronJob } = require('cron');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const vip = process.env.VIP_ROLE_ID;
const helper = process.env.MODERATOR_ROLE_ID;
const sbs = process.env.SBS_ROLE_ID;

const skplayersID = process.env.SERVER_ID;

bot.login(process.env.DISCORD_TOKEN);

const fs = require('fs');

const guild_slash_commands = [];
bot.guild_slash_commands = new Collection();

const global_slash_commands = [];
bot.global_slash_commands = new Collection();


//guild slash commands
const guild_slash = fs.readdirSync('./guild_slash_commands/').filter(file => file.endsWith('.js'));

for (const guild_slash_file of guild_slash) {
    const guild_slash_command = require(`./guild_slash_commands/${guild_slash_file}`);

    guild_slash_commands.push(guild_slash_command.data.toJSON());
    bot.guild_slash_commands.set(guild_slash_command.data.name, guild_slash_command);
}
//global slash commands
const global_slash = fs.readdirSync('./global_slash_commands/').filter(file => file.endsWith('.js'));

for (const global_slash_file of global_slash) {
    const global_slash_command = require(`./global_slash_commands/${global_slash_file}`);

    global_slash_commands.push(global_slash_command.data.toJSON());
    bot.global_slash_commands.set(global_slash_command.data.name, global_slash_command);
}

//databaza
const firebase = require('firebase/app');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
const { ProjectConfig } = require('firebase-admin/auth');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
let db = admin.firestore();
let fielddb = FieldValue;

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${guild_slash_commands.length} guild application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands('662288447276580875', skplayersID),
            { body: guild_slash_commands },
        );

        console.log(`Successfully reloaded ${data.length} guild application (/) commands.`);

        console.log(`Started refreshing ${global_slash_commands.length} global application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const global_data = await rest.put(
            Routes.applicationCommands('662288447276580875'),
            { body: global_slash_commands },
        );

        console.log(`Successfully reloaded ${global_data.length} global application (/) commands.`);

    } catch (error) {
        console.error(error);
    }
})();



bot.on("clientReady", () => {
    console.log(`Bot is online! (${bot.guilds.cache.size} servers)`);

    bot.user.setPresence({ activities: [{ name: '/ príkazy | skplayers.eu', type: ActivityType.Watching }], status: 'online' });
    if (!bot.guilds.cache.get(skplayersID)) return;
    //ajax
    const narodeniny = new CronJob('00 10 24 1 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@202878106472546305> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');
    //wasia
    var narodeniny2 = new CronJob('00 10 12 1 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@421391887698755587> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //jusmejtr
    var narodeniny3 = new CronJob('00 10 26 8 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@452773419105255435> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //croxy
    var narodeniny4 = new CronJob('00 10 7 10 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@167298450973523968> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //kiko
    var narodeniny5 = new CronJob('00 10 6 8 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@650053654446997525> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');
    //richard0o
    var narodeniny6 = new CronJob('00 10 9 4 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@420237481536126988> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //milan
    var narodeniny7 = new CronJob('00 10 11 3 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@577447339036246017> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //domo
    var narodeniny8 = new CronJob('00 10 8 12 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@479222589294641154> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //dejvid
    var narodeniny9 = new CronJob('00 10 10 4 *', function () {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@696293912175706142> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');
    //skbot

    var narodeniny10 = new CronJob('00 10 2 1 *', function () {
        bot.channels.cache.get("472822895098200066").send("Šieste výročie SKbota na serveri 🎉");
    }, null, true, 'Europe/Bratislava');

    //na buy name/vip

    var nakup = new CronJob('0 */6 * * *', async function () {//farebne meno
        const pozri = db.collection('nakupy');
        let casik = Date.now();
        const kukam = await pozri.where('platnostnakupu', '<', casik).get();
        if (kukam.empty) {
            return;
        }
        kukam.forEach(tca => {
            let a = tca.data().meno;
            let b = tca.data().ID;
            let maz = bot.guilds.cache.get(skplayersID);
            maz.roles.cache.find(g => g.name === b).delete();
            db.collection('nakupy').doc(b).delete();
        });
    }, null, true, 'Europe/Bratislava');


    var nakup2 = new CronJob('0 */8 * * *', async function () {//vip
        const asi = db.collection('nakupy2');
        let casicek = Date.now();
        const opa = await asi.where('platnostnakupu', '<', casicek).get();
        if (opa.empty) return;

        opa.forEach(async (zeby) => {
            let bb = zeby.data().ID;
            let meno = zeby.data().meno;
            let server = bot.guilds.cache.get(skplayersID);
            let hrac = await server.members.fetch(bb);
            hrac.roles.remove(vip);

            db.collection('nakupy2').doc(bb).delete();

            try {
                if (hrac.roles.cache.get('472823586693054464')) {
                    db.collection('web').doc(meno).update({
                        "rola": "Owner",
                    }).catch(console.log);
                } else if (hrac.roles.cache.get(helper)) {
                    db.collection('web').doc(meno).update({
                        "rola": "Helper",
                    }).catch(console.log);
                } else if (hrac.roles.cache.get("802287093371502662")) {
                    db.collection('web').doc(meno).update({
                        "rola": "Developer",
                    }).catch(console.log);
                } else if (hrac.roles.cache.get(sbs)) {
                    db.collection('web').doc(meno).update({
                        "rola": "SBS",
                    }).catch(console.log);
                } else {
                    db.collection('web').doc(meno).update({
                        "rola": "nic",
                    }).catch(console.log);
                }
            } catch (error) {
                console.log(error);
            }
        });
    }, null, true, 'Europe/Bratislava');


    var nakup = new CronJob('0 * * * *', async function () {
        db.collection('game-updates-web').doc('ets').get().then(async (a) => {
            //ets2
            let ets_update = a.data().nazov;
            let url = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://store.steampowered.com/feeds/news/app/227300/?cc=SK&l=czech&snr=1_2108_9__2107");
            let data = await url.json();

            let nazov = data.items[0].title;

            if (nazov == ets_update) {
                return;
            } else {
                db.collection('game-updates-web').doc('ets').set({
                    "nazov": nazov,
                });
                let embed = new EmbedBuilder()
                    .setDescription(`Nový update si môžeš pozrieť tu: [${nazov}](https://skplayers.eu/game-updates/ets2/)`)
                    .setTitle(`Euro Truck Simulator 2 update`)
                    .setThumbnail('https://scssoft.com/press/euro_truck_simulator_2/images/assets/logo.png')
                    .setColor("f5dd07")

                const updates = db.collection('global-updates');
                const vyber = await updates.where('ets_channel', '!=', '0').get();
                if (vyber.empty) return;

                vyber.forEach(async (result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().ets_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({ embeds: [embed] });
                });
            }
        });
        db.collection('game-updates-web').doc('slapshot').get().then(async (a) => {
            let slapshot_update = a.data().nazov;

            let url = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://store.steampowered.com/feeds/news/app/1173370/?cc=SK&l=czech&snr=1_2108_9__2107");
            let data = await url.json();

            let nazov = data.items[0].title;

            if (nazov == slapshot_update) {
                return;
            } else {
                db.collection('game-updates-web').doc('slapshot').set({
                    "nazov": nazov,
                });
                let embed = new EmbedBuilder()
                    .setDescription(`Nový update si môžeš pozrieť tu: [${nazov}](https://skplayers.eu/game-updates/slapshot-rebound/)`)
                    .setTitle(`Slapshot: Rebound update`)
                    .setThumbnail('https://slapshot.gg/img/slapshot-rebound-logo.png')
                    .setColor("f5dd07")

                const updates = db.collection('global-updates');
                const vyber = await updates.where('slapshot_channel', '!=', '0').get();
                if (vyber.empty) return;

                vyber.forEach(async (result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().slapshot_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({ embeds: [embed] });
                });
            }
        });
        db.collection('game-updates-web').doc('dead-by-daylight').get().then(async (a) => {
            let dbd_update = a.data().nazov;

            let url = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://store.steampowered.com/feeds/news/app/381210/?cc=SK&l=czech&snr=1_2108_9__2107");
            let data = await url.json();

            let nazov = data.items[0].title;

            if (nazov == dbd_update) {
                return;
            } else {
                db.collection('game-updates-web').doc('dead-by-daylight').set({
                    "nazov": nazov,
                });
                let embed = new EmbedBuilder()
                    .setDescription(`Nový update si môžeš pozrieť tu: [${nazov}](https://skplayers.eu/game-updates/dead-by-daylight/)`)
                    .setTitle(`Dead by Daylight update`)
                    .setThumbnail('https://logos-world.net/wp-content/uploads/2021/02/Dead-by-Daylight-Logo.png')
                    .setColor("f5dd07")

                const updates = db.collection('global-updates');
                const vyber = await updates.where('dbd_channel', '!=', '0').get();
                if (vyber.empty) return;

                vyber.forEach(async (result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().dbd_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({ embeds: [embed] });
                });
            }
        });
    }, null, true, 'Europe/Bratislava');

    //max gamble za den
    var nakup = new CronJob('0 0 * * *', async function () {
        refresh_gamble();
    }, null, true, 'Europe/Bratislava');

});
bot.on('messageCreate', message => {
    handleEmoteMessage(bot, message).catch(console.error);
});

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

    const command = interaction.commandGuildId == null
        ? bot.global_slash_commands.get(interaction.commandName)
        : bot.guild_slash_commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, db);
    } catch (err) {
        console.error(`Chyba v príkaze /${interaction.commandName}:`, err);
        const payload = { content: 'Nastala chyba pri vykonávaní príkazu', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
        else await interaction.reply(payload).catch(() => {});
    }
});
bot.on('emojiCreate', (emoji) => {
    emoji.guild.emojis.fetch();
});
bot.on('emojiUpdate', (oldEmoji, newEmoji) => {
    newEmoji.guild.emojis.fetch();
    console.log(newEmoji);
});
bot.on('emojiDelete', (emoji) => {
    emoji.guild.emojis.fetch();
});


/* FUNCTIONS */

async function refresh_gamble() {
    const gamble_pocet = db.collection('statistiky');
    const vyber = await gamble_pocet.where('pregamblene', '>', 0).get();
    if (vyber.empty) return;

    vyber.forEach(async (result) => {
        db.collection('statistiky').doc(result.id).update({
            "gamble_count": 1000,
        });
    });
}
