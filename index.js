const { Client, Collection, EmbedBuilder, GatewayIntentBits, PermissionsBitField, ActivityType, REST, Routes } = require('discord.js');
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

const PREFIX = process.env.PREFIX;
const vip = process.env.VIP_ROLE_ID;
const helper = process.env.MODERATOR_ROLE_ID;
const sbs = process.env.SBS_ROLE_ID;

const skplayersID = process.env.SERVER_ID;

bot.login(process.env.DISCORD_TOKEN);

const fs = require('fs');
bot.commands = new Collection();

const guild_slash_commands = [];
bot.guild_slash_commands = new Collection();

const global_slash_commands = [];
bot.global_slash_commands = new Collection();


const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    bot.commands.set(command.name, command);
}
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



bot.on("ready", () => {
    console.log(`Bot is online! (${bot.guilds.cache.size} servers)`);

    bot.user.setPresence({ activities: [{ name: '*help | skplayers.eu', type: ActivityType.Watching }], status: 'online' });
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
        //refresh_trading();
    }, null, true, 'Europe/Bratislava');

    //skplayers shop
    // var nakup = new CronJob('0 */2 * * *', async function() {
    //     update_shop_items();
    // }, null, true, 'Europe/Bratislava');

});
bot.on('messageCreate', message => {
    if (message.guild && message.guild.id === skplayersID) {//sk players server

        bot.commands.get('wasia-room').execute(message);

        bot.commands.get('balance').execute(bot, message, db);

        bot.commands.get('createaccount').execute(message, db);

        bot.commands.get('daily').execute(message, db);

        bot.commands.get('buy-vip').execute(bot, message, db);

        bot.commands.get('addmoney').execute(bot, message, db);

        bot.commands.get('removemoney').execute(bot, message, db);

        bot.commands.get('buy-name').execute(bot, message, db);

        bot.commands.get('shop').execute(message);

        bot.commands.get('economy').execute(message);

        bot.commands.get('buy-mute').execute(message, db);

        bot.commands.get('gamble').execute(message, db);

        bot.commands.get('pay').execute(message, db);

        bot.commands.get('jackpot').execute(message, db);

        bot.commands.get('statistiky').execute(bot, message, db);

        bot.commands.get('top').execute(message, db);

        bot.commands.get('buy-voicemute').execute(message, db);

        bot.commands.get('web').execute(message, db, fielddb);

        bot.commands.get('multiply').execute(message, db);

        bot.commands.get('blackjack').execute(message);


        /*
        if(message.content === "*generujkody"){
            message.delete();
            if (!message.member.roles.cache.get("472823586693054464")) return message.reply("Na tento príkaz nemáš práva");
    
            function makeid(length) {
                var result           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                   result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }
            for(var i = 1;i<=50;i++){
                i =i.toString();
                kluc = makeid(5);
                db.collection('redeem').doc(i).set({
                    'kluc': kluc,
                    'poradie': i,
                });
                const fs = require('fs');
    
                fs.appendFileSync('data.txt', `${kluc}\n`);
            }
            
        }*/
        if (message.content === PREFIX + "prepacte") {
            message.delete();

            message.channel.createWebhook({
                name: 'SK-bot-webhook',
                avatar: bot.user.avatarURL(),
            }).then(webhook => {
                webhook.send({
                    content: "🇵 🇷 🇪 🇵 🇦 🇨 🇹 🇪",
                    username: message.author.username,
                    avatarURL: message.author.avatarURL()
                });
                setTimeout(() => {
                    webhook.delete();
                }, 500);
            });
        }
        if (message.content === PREFIX + "move") {
            let roomka = message.member.voice.channel;
            if (!roomka) return message.reply("Musíš byť vo voice roomke");
            message.reply({ files: ['./emotes/move.gif'] });
            let roomky = ["472823396674174986", "476403298505850891", "760055283451035719", "682975722146758747", "472841212664086529", "476110496357941252", "476110732635930624"];
            for (let i = 0; i < roomky.length; i++) {
                message.member.voice.setChannel(roomky[i]);
            }
            message.member.voice.setChannel(roomka);

        }

        // if (message.author.id == "202878106472546305") {
        //     message.react("🇦");
        //     message.react("🇯");
        //     message.react("🅰");
        //     message.react("🇽");
        //     message.react("🇧");
        //     message.react("<:OMEGALUL:801386090270556182>");
        //     message.react("🇹");
        // }
        /*
        if(message.content === PREFIX + "shop udpate"){
            if(message.member.permissions.has(PermissionsBitField.Flags.Administrator)){
                update_shop_items();
                message.reply("updating shop");
            }else{
                message.reply("You don't have permission **ADMINISTRATOR**");
            }
        }*/


        /*if(message.content === "*EKFHV"){
            message.delete();
            db.collection('economy').doc(message.author.id).get().then((odmeny) => {
                if(!odmeny.exists) return message.reply("Nemáš vytvorený účet");
                db.collection('odmeny').doc(message.author.id).get().then((k) =>{
                    if(k.exists) return message.reply("Svoju Vianočnú odmenu si si už vybral");
                    db.collection('odmeny').doc(message.author.id).set({
                        "meno": message.author.tag
                    });
                    var coiny = odmeny.data().money;
                    coiny += 10000;
                    db.collection('economy').doc(message.author.id).update({
                        'money': coiny
                    });
                    message.reply("Úspešne si si vybral svoju Vianočnú odmenu");
                });
    
            });
        }*/
        // if(message.content.startsWith(PREFIX + "export")){
        //     message.delete();

        //     let args = message.content.split(" ");
        //     let idcko = args[1];

        //     db.collection('statistiky').doc(idcko).get().then((a) => {
        //         if(!a.exists) return message.reply("Takýto užívateľ neexistuje");
        //         let pregamblil = a.data().pregamblene;
        //         var suma = pregamblil / 100;
        //         suma = parseInt(suma);
        //         db.collection('economy').doc(idcko).get().then((b) => {
        //             var peniaze = b.data().money;
        //             var peniaze2 = peniaze + suma;
        //             db.collection('economy').doc(idcko).update({
        //                 'money': peniaze2,
        //             });
        //             message.channel.send(`Hráč ${b.data().meno} dostal 1% z jeho pregamblených coinov (max do 10k) (celkovo pregamblil ${pregamblil} z toho 1% = ${suma})`);
        //         });
        //         db.collection('statistiky').doc(idcko).update({
        //             'gamble_lose': 0,
        //             'gamble_win': 0,
        //             'givnute': 0,
        //             'pregamblene': 0,
        //             'suma_prehra': 0,
        //             'suma_vyhra': 0
        //         });
        //     });
        // }
    }
    bot.commands.get('help').execute(message);

    bot.commands.get('maps').execute(message);

    bot.commands.get('otazka').execute(message);

    bot.commands.get('prune').execute(bot, message);

    bot.commands.get('random-team').execute(message);

    bot.commands.get('random-cislo').execute(message);

    bot.commands.get('iq').execute(message);

    bot.commands.get('cicina').execute(message);

    bot.commands.get('global-updates').execute(message, db, fielddb);

    bot.commands.get('kick').execute(message);

    bot.commands.get('ban').execute(message);

    bot.commands.get('emote').execute(bot, message);
});

bot.on("messageCreate", async message => {
    if (message.guild && message.guild.id === skplayersID) {//skplayers
        if (message.content.startsWith(PREFIX + "redeem")) {
            message.delete();
            let args = message.content.split(" ");
            let kod = args[1];
            if (!kod) {
                return message.channel.send(`<@${message.author.id}> Musíš zadať kód`);
            }
            const pozrisa = db.collection('redeem');
            const kukamsa = await pozrisa.where('kluc', '==', kod).get();
            if (kukamsa.empty) {
                return message.channel.send(`<@${message.author.id}> Zadal si zlý kód`);
            }
            kukamsa.forEach(zeby => {
                let cislo = zeby.data().poradie;
                db.collection('economy').doc(message.author.id).get().then((a) => {
                    if (a.exists) {
                        let money = a.data().money;
                        money = parseInt(money);
                        money += 100;
                        db.collection("economy").doc(message.author.id).update({
                            "money": money,
                        });
                        message.channel.send(`<@${message.author.id}> Úspešne ti bolo pripísaných 100 coinov`);
                    } else {
                        message.channel.send(`<@${message.author.id}> Nemáš vytvorený účet`);
                    }
                }).then(() => {
                    db.collection('redeem').doc(cislo).delete();
                });

            });
        }

    }
    if (message.content === PREFIX + "ping") {
        message.delete();
        let msg = await message.channel.send("Pinging...");
        msg.edit(`🏓 Pong!\nOdozva je ${Math.round(bot.ws.ping)}ms`);
    }/*
    if(message.content === "*rolesreact"){
        message.delete();
        message.channel.send("1️⃣- Corona updates\n2️⃣- CS:GO updates\n3️⃣- Valorant updates\n4️⃣- Smite updates\n5️⃣- Rocket League updates");
    }
    if(message.content === "*rolesreactoprava"){
        message.delete();
        let sprava = await message.channel.messages.fetch("816259846713114625");
        sprava.edit("1️⃣- Corona updates\n2️⃣- CS:GO updates\n3️⃣- Valorant updates\n4️⃣- Smite updates\n5️⃣- Rocket League updates\n6️⃣ - Euro Truck Simulator 2\n7️⃣ - Slapshot: Rebound updates\n8️⃣ - Dead by Daylight updates");

    }*/
});

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    //const guild_command = bot.guild_slash_commands.get(interaction.commandName);

    if (interaction.commandGuildId == null) {//global command
        bot.global_slash_commands.get(interaction.commandName).execute(interaction, db);
    } else {//guild command
        bot.guild_slash_commands.get(interaction.commandName).execute(interaction, db);
    }
    //if(!guild_command || !global_command) return;

    /*try{
        //await guild_command.execute(interaction);
        await global_command.execute(interaction);
    }catch(err){
        if(err) console.log(err);
    }*/

});
//fixnut
// bot.on("guildMemberUpdate", (oldMember, newMember) => {
//     if(newMember.nickname && oldMember.nickname !== newMember.nickname) {
//         let embed = new EmbedBuilder()
//         .setTitle("Zmena nicknamu")
//         .addField(oldMember.user.tag, `${oldMember.nickname} --> ${newMember.nickname}`)
//         .setColor("00ffff")

//         bot.channels.cache.get("686650199904616456").send({embeds:[embed]});
//     }
// });
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
/*
async function refresh_trading(){
    const trading = db.collection('web');
    const vyber = await trading.where('can_buy', '==', 0).get();
    if(vyber.empty) return;

    vyber.forEach(async(result) => {
        db.collection('web').doc(result.id).update({
            "can_buy": 1,
        });
    });
}*/
/*
function update_shop_items(){
    fetch(`https://steamcommunity.com/inventory/76561198818371905/730/2?l=english`)
    .then(response => response.json())
    .then(async(data) =>{
        let item_count = data.total_inventory_count;
        let info_count = data.descriptions.length;
        var item_list = [];

        const table = await db.collection('shop').get();
        table.forEach(async(doc) => {
            await doc.ref.delete();
        });
        setTimeout(() => {
            for(let i=0; i<item_count; i++){
                for(let j=0; j<info_count; j++){
                    if(data.assets[i].classid == data.descriptions[j].classid){
                        if ('actions' in data.descriptions[j]){//ak ma link na inspect
                            let linka = data.descriptions[j].actions[0].link;
                            linka = linka.replace("%owner_steamid%", "76561198818371905");
                            linka = linka.replace("%assetid%", data.assets[i].assetid.toString());
                            db.collection('shop').doc(data.assets[i].assetid).set({
                                "assetid": data.assets[i].assetid,
                                "classid": data.assets[i].classid,
                                "icon_url": data.descriptions[j].icon_url,
                                "tradable": data.descriptions[j].tradable,
                                "inspect_link": linka,
                                "market_hash_name": data.descriptions[j].market_hash_name,
                                "status": "available"
                            });
                        }else{
                            db.collection('shop').doc(data.assets[i].assetid).set({
                                "assetid": data.assets[i].assetid,
                                "classid": data.assets[i].classid,
                                "icon_url": data.descriptions[j].icon_url,
                                "tradable": data.descriptions[j].tradable,
                                "market_hash_name": data.descriptions[j].market_hash_name,
                                "status": "available"
                            });
                        }
                          
                        item_list[i] = data.assets[i].assetid;
                    }
                }
            }
        }, 2000);
        var i = 0;
        setTimeout(() => {
            var timer = setInterval(() => {
                db.collection('shop').doc(item_list[i]).get().then((a)=>{
                    if(a.exists){
                        fetch(`https://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=${a.data().market_hash_name}`)
                        .then(response => response.json())
                        .then((b) => {
                            let eur = b.lowest_price.split(",")[0];
                            let centy = b.lowest_price.split(",")[1].slice(0,-1);
                            eur = parseInt(eur);
                            centy = parseInt(centy);
    
                            var celkova_suma = 0;
                            if(!isNaN(eur)){
                                celkova_suma += eur*100*1000;
                            }
                            if(!isNaN(centy)){
                                celkova_suma += centy*1000;
                            }
    
                            db.collection('shop').doc(item_list[i]).update({
                                "price": celkova_suma
                            });
                            i++;
                            if(i == item_count){
                                clearInterval(timer);
                            }
    
                        });
                    }
                });
            }, 3000);
        }, 5000);
    })
    .catch(error => {
        console.error(error);
    });
}*/