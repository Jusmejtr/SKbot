const { Client, Collection, Intents, MessageEmbed} = require('discord.js');
const bot = new Client({ intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
    Intents.FLAGS.GUILD_VOICE_STATES, 
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_PRESENCES
    ] });
const config = require("./config.json");
const cron = require("cron");
const fetch = require("node-fetch");


const PREFIX = (config.prefix);
const vip = (config.vip);
const helper = (config.helper);
const sbs = (config.sbs);

//variables for music
var queue=[];

const skplayersID = (config.skplayersID);
//admina nedavaj, je v db line:39

bot.login(config.token);

var version = '0.5.1';
//0.1 zaklad
//0.1.1 ping
//0.1.2 na golf
//0.2 random cislo
//0.2.1 vylepseny ping
//0.3 prune
//0.4 random mapa
//0.5 kick a ban
//0.5.1 wasia room
//1.0 commandy osobitne

const fs = require('fs');
bot.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    bot.commands.set(command.name, command);
}
//databaza
const firebase = require('firebase/app');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
let db = admin.firestore();
let fielddb = FieldValue;

bot.on("ready", () => {
    console.log(`Bot is online! (${bot.guilds.cache.size} servers)`);

    bot.user.setPresence({ activities: [{ name: '*help | skplayers.eu', type: "WATCHING"}], status: 'online' });

    if(!bot.guilds.cache.get(skplayersID)) return;
    //ajax
    var narodeniny = new cron.CronJob('00 00 10 24 0 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@202878106472546305> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');
    //wasia
    var narodeniny3 = new cron.CronJob('00 00 10 12 0 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@421391887698755587> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //jusmejtr
    var narodeniny4 = new cron.CronJob('00 00 10 26 7 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@452773419105255435> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //croxy
    var narodeniny5 = new cron.CronJob('00 00 10 7 9 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@167298450973523968> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //kiko
    var narodeniny6 = new cron.CronJob('00 00 10 6 7 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@650053654446997525> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');
    //richard0o
    var narodeniny7 = new cron.CronJob('00 00 10 9 3 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@420237481536126988> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //milan
    var narodeniny8 = new cron.CronJob('00 00 10 11 2 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@577447339036246017> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //domo
    var narodeniny9 = new cron.CronJob('00 00 10 8 11 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@479222589294641154> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');

    //dejvid
    var narodeniny11 = new cron.CronJob('00 00 10 10 3 *', function() {
        bot.channels.cache.get("472822895098200066").send("Všetko najlepšie k narodeninám <@696293912175706142> 🎉").then(reakcia => {
            reakcia.react("🎉");
        });
    }, null, true, 'Europe/Bratislava');
    //skbot
    /*
    var narodeniny12 = new cron.CronJob('00 00 10 2 0 *', function() {
        bot.channels.cache.get("472822895098200066").send("Druhé výročie SKbota na serveri 🎉");
    }, null, true, 'Europe/Bratislava');
    */
   
    //na buy name/vip
    var nakup = new cron.CronJob('0 */4 * * *', async function() {//farebne meno
        const pozri = db.collection('nakupy');
        let casik = Date.now();
        const kukam = await pozri.where('platnostnakupu', '<', casik).get();
        if(kukam.empty){
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
    
    var nakup2 = new cron.CronJob('0 */3 * * *', async function() {//vip
        const asi = db.collection('nakupy2');
        let casicek = Date.now();
        const opa = await asi.where('platnostnakupu', '<', casicek).get();
        if(opa.empty) return;

        opa.forEach(async(zeby) => {
            let bb = zeby.data().ID;
            let meno = zeby.data().meno;
            let server = bot.guilds.cache.get(skplayersID);
            let hrac = await server.members.fetch(bb);
            hrac.roles.remove(vip);

            db.collection('nakupy2').doc(bb).delete();

            try {
                if(hrac.roles.cache.get('472823586693054464')){
                    db.collection('web').doc(meno).update({
                        "rola": "Owner",
                    }).catch(console.log);
                }else if(hrac.roles.cache.get(helper)){
                    db.collection('web').doc(meno).update({
                        "rola": "Helper",
                    }).catch(console.log);
                }else if(hrac.roles.cache.get("802287093371502662")){
                    db.collection('web').doc(meno).update({
                        "rola": "Developer",
                    }).catch(console.log);
                }else if(hrac.roles.cache.get(sbs)){
                    db.collection('web').doc(meno).update({
                        "rola": "SBS",
                    }).catch(console.log);
                }else{
                    db.collection('web').doc(meno).update({
                        "rola": "nic",
                    }).catch(console.log);
                }
            } catch (error) {
                console.log(error);
            }
        });
    }, null, true, 'Europe/Bratislava');
    //corona
    var corona = new cron.CronJob('*/15 10-14 * * *', async function(){
        
        db.collection('statusy').doc('corona').get().then(async(g) =>{
            let res = await fetch("https://api.apify.com/v2/key-value-stores/GlTLAdXAuOz6bLAIO/records/LATEST?disableRedirect=true");
            let data = await res.json();

            let ress = await fetch("https://data.korona.gov.sk/api/vaccinations/in-slovakia");
            let datas = await ress.json();

            let ag_api = await fetch("https://data.korona.gov.sk/api/ag-tests/in-slovakia");
            let ag = await ag_api.json();

            function numberWithSpaces(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }

            var db_agt = g.data().agt;//pribudlo vykonanych testov
            var db_pcr = g.data().pcr;//pribudlo pcr testov
            //var db_ock = g.data().ock;//pribudlo prvou davkou, ockovanie
            var db_bj = g.data().bj;


            var pcr_testy = data.testedPCR;
            pcr_testy=parseInt(pcr_testy);
            var pcr_pribudlotestov = data.newTestedPCR;
            pcr_pribudlotestov = parseInt(pcr_pribudlotestov);
            var pcr_pozitiv = data.infectedPCR;
            pcr_pozitiv = parseInt(pcr_pozitiv);
            var pcr_pozitiv_pribudlo = data.newInfectedPCR;
            pcr_pozitiv_pribudlo = parseInt(pcr_pozitiv_pribudlo);
            var pozitivita_PCR = pcr_pozitiv_pribudlo/pcr_pribudlotestov*100;

            
            var ag_testy = ag.page[0].negatives_sum;
            ag_testy = parseInt(ag_testy);
            var ag_testy_pribudlo = ag.page[0].negatives_count;
            ag_testy_pribudlo = parseInt(ag_testy_pribudlo);
            var ag_pozitiv = ag.page[0].positives_sum;
            ag_pozitiv = parseInt(ag_pozitiv);
            var ag_pozitiv_pribudlo = ag.page[0].positives_count;
            ag_pozitiv_pribudlo = parseInt(ag_pozitiv_pribudlo);
            var pozitivita = ag.page[0].positivity_rate;
            pozitivita = parseFloat(pozitivita);

            
            var smr = data.deceased;
            smr=parseInt(smr);
            var smr_pribudlo = data.newDeceased;
            smr_pribudlo = parseInt(smr_pribudlo);


            var ock1 = datas.page[0].dose1_sum;
            ock1 = parseInt(ock1);
            var ock1_pribudlo = datas.page[0].dose1_count;
            ock1_pribudlo = parseInt(ock1_pribudlo);

            var ock2 = datas.page[0].dose2_sum;
            ock2 = parseInt(ock2);
            var ock2_pribudlo = datas.page[0].dose2_count;
            ock2_pribudlo = parseInt(ock2_pribudlo);

            //bj
            var bj_pripady = parseInt(data.districts[3].newInfected);
            var bj_nazov = data.districts[3].town;
            var bj_celkovo = data.districts[3].totalInfected;

            const datum = new Date();
            let embed = new MessageEmbed()
            .setTitle("Corona updates Slovensko")
            .setDescription(`${datum.getDate()}.${(datum.getMonth())+1}.${datum.getFullYear()}`)
            .setColor("00ffff")
            .addField("**----------**", "PCR testy")
            .addField("Počet vykonaných testov", `${numberWithSpaces(pcr_testy)} [+${numberWithSpaces(pcr_pribudlotestov)}]`)
            .addField("Počet pozitívnych", `${numberWithSpaces(pcr_pozitiv)} [+${numberWithSpaces(pcr_pozitiv_pribudlo)}]`)
            .addField("Pozitivita", `${Math.round(pozitivita_PCR * 100) / 100}%`)
            .addField("Počet úmrtí", `${numberWithSpaces(smr)} [+${numberWithSpaces(smr_pribudlo)}]`)
            .addField("**----------**", "AG testy")
            .addField("Počet vykonaných testov", `${numberWithSpaces(ag_testy)} [+${numberWithSpaces(ag_testy_pribudlo)}]`)
            .addField("Počet pozitívnych", `${numberWithSpaces(ag_pozitiv)} [+${numberWithSpaces(ag_pozitiv_pribudlo)}]`)
            .addField("Pozitivita", `${Math.round(pozitivita * 100) / 100}%`)
            .addField("**----------**", "Očkovanie")
            .addField("Počet ľudí zaočkovaných prvou dávkou", `${numberWithSpaces(ock1)} [+${numberWithSpaces(ock1_pribudlo)}]`)
            .addField("Počet ľudí zaočkovaných druhou dávkou", `${numberWithSpaces(ock2)} [+${numberWithSpaces(ock2_pribudlo)}]`)


            let embed2 = new MessageEmbed()
            .setTitle(`Corona updates ${bj_nazov}`)
            .setDescription(`${datum.getDate()}.${(datum.getMonth())+1}.${datum.getFullYear()}`)
            .setColor("00ffff")
            .addField("Počet nových prípadov", `${bj_pripady}`)
            .addField("Celkový počet prípadov", `${numberWithSpaces(bj_celkovo)}`)

            if(ag_testy_pribudlo != db_agt && pcr_pribudlotestov != db_pcr){
                db.collection('statusy').doc('corona').update({
                    "pcr": pcr_pribudlotestov,
                    "agt": ag_testy_pribudlo
                    //"ock": ock1_pribudlo
                });    
                const updates = db.collection('global-updates');
                const vyber = await updates.where('corona_channel', '!=', '0').get();
                if(vyber.empty) return;
        
                vyber.forEach(async(result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().corona_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({embeds: [embed]});
                });
            }

            if(db_bj != bj_pripady && bj_pripady != 0){
                db.collection('statusy').doc('corona').update({
                    "bj": bj_pripady
                }); 

                const updates2 = db.collection('global-updates');
                const vyber2 = await updates2.where('corona_channel', '!=', '0').get();
                if(vyber2.empty) return;
        
                vyber2.forEach(async(result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().corona_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({embeds: [embed2]});
                });
            }

        });
        
    }, null,true, 'Europe/Bratislava');

    var nakup = new cron.CronJob('0 * * * *', async function() {
        db.collection('game-updates-web').doc('ets').get().then(async(a) => {
            //ets2
            let ets_update = a.data().nazov;
            let url = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://store.steampowered.com/feeds/news/app/227300/?cc=SK&l=czech&snr=1_2108_9__2107");
            let data = await url.json();
    
            let nazov = data.items[0].title;

            if(nazov == ets_update){
                return;
            }else{
                db.collection('game-updates-web').doc('ets').set({
                    "nazov": nazov,
                });
                let embed = new MessageEmbed()
                .setDescription(`Nový update si môžeš pozrieť tu: [${nazov}](https://skplayers.eu/game-updates/ets2/)`)
                .setTitle(`Euro Truck Simulator 2 update`)
                .setThumbnail('https://scssoft.com/press/euro_truck_simulator_2/images/assets/logo.png')
                .setColor("f5dd07")

                const updates = db.collection('global-updates');
                const vyber = await updates.where('ets_channel', '!=', '0').get();
                if(vyber.empty) return;
        
                vyber.forEach(async(result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().ets_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({embeds: [embed]});
                });
            }
        });
        db.collection('game-updates-web').doc('slapshot').get().then(async(a) => {
            let slapshot_update = a.data().nazov;

            let url = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://store.steampowered.com/feeds/news/app/1173370/?cc=SK&l=czech&snr=1_2108_9__2107");
            let data = await url.json();
    
            let nazov = data.items[0].title;

            if(nazov == slapshot_update){
                return;
            }else{
                db.collection('game-updates-web').doc('slapshot').set({
                    "nazov": nazov,
                });
                let embed = new MessageEmbed()
                .setDescription(`Nový update si môžeš pozrieť tu: [${nazov}](https://skplayers.eu/game-updates/slapshot-rebound/)`)
                .setTitle(`Slapshot: Rebound update`)
                .setThumbnail('https://slapshot.gg/img/slapshot-rebound-logo.png')
                .setColor("f5dd07")

                const updates = db.collection('global-updates');
                const vyber = await updates.where('slapshot_channel', '!=', '0').get();
                if(vyber.empty) return;
        
                vyber.forEach(async(result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().slapshot_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({embeds: [embed]});
                });
            }
        });
        db.collection('game-updates-web').doc('dead-by-daylight').get().then(async(a) => {

            let dbd_update = a.data().nazov;

            let url = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://store.steampowered.com/feeds/news/app/381210/?cc=SK&l=czech&snr=1_2108_9__2107");
            let data = await url.json();
    
            let nazov = data.items[0].title;

            if(nazov == dbd_update){
                return;
            }else{
                db.collection('game-updates-web').doc('dead-by-daylight').set({
                    "nazov": nazov,
                });
                let embed = new MessageEmbed()
                .setDescription(`Nový update si môžeš pozrieť tu: [${nazov}](https://skplayers.eu/game-updates/dead-by-daylight/)`)
                .setTitle(`Dead by Daylight update`)
                .setThumbnail('https://logos-world.net/wp-content/uploads/2021/02/Dead-by-Daylight-Logo.png')
                .setColor("f5dd07")

                const updates = db.collection('global-updates');
                const vyber = await updates.where('dbd_channel', '!=', '0').get();
                if(vyber.empty) return;
        
                vyber.forEach(async(result) => {
                    let id_of_server = result.id;
                    let id_of_room = result.data().dbd_channel;
                    bot.guilds.cache.get(id_of_server).channels.cache.get(id_of_room).send({embeds: [embed]});
                });
            }
        });
    }, null, true, 'Europe/Bratislava');

    //max gamble za den
    var nakup = new cron.CronJob('0 10 * * *', async function() {
        const gamble_pocet = db.collection('statistiky');
        const vyber = await gamble_pocet.where('pregamblene', '>', 0).get();
        if(vyber.empty) return;

        vyber.forEach(async(result) => {
            let id_of_doc = result.id;
            db.collection('statistiky').doc(id_of_doc).update({
                "gamble_count": 1000,
            });
        });
    }, null, true, 'Europe/Bratislava');

});
bot.on('messageCreate', message => {
    if (message.guild && message.guild.id === skplayersID){//sk players server
        bot.commands.get('wasia-room').execute(message, config);

        bot.commands.get('balance').execute(bot, message, config, db);

        bot.commands.get('createaccount').execute(message, config, db);
    
        bot.commands.get('daily').execute(message, config, db);
    
        bot.commands.get('buy-vip').execute(bot, message, config, db);
    
        bot.commands.get('addmoney').execute(bot, message, config, db);
    
        bot.commands.get('removemoney').execute(bot, message, config, db);
    
        bot.commands.get('buy-name').execute(bot, message, config, db);
    
        bot.commands.get('shop').execute(message, config);
    
        bot.commands.get('economy').execute(message, config);
    
        bot.commands.get('buy-mute').execute(message, config, db);

        bot.commands.get('gamble').execute(message, config, db);
    
        bot.commands.get('pay').execute(message, config, db);
    
        bot.commands.get('jackpot').execute(bot, message, config, db);   
        
        bot.commands.get('statistiky').execute(bot, message, config, db);

        bot.commands.get('top').execute(message, config, db);
    
        bot.commands.get('buy-voicemute').execute(message, config, db);
    
        bot.commands.get('music').execute(message, config, queue, fs);//
        
        bot.commands.get('web').execute(message, config, db, fielddb);
    
        bot.commands.get('multiply').execute(message, config, db);  
     

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
        if(message.content === PREFIX + "prepacte"){
            message.delete();
            //message.channel.send("🇵 🇷 🇪 🇵 🇦 🇨 🇹 🇪");
            message.channel.createWebhook('SK-bot-webhook',{
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
        if(message.content === PREFIX + "move"){
            let roomka = message.member.voice.channel;
            //message.delete();
            if(!roomka) return message.reply("Musíš byť vo voice roomke");
            message.reply({files: ['./emotes/move.gif'] });
            //channel.send({files: ['./image1.png', './image2.jpg'] });
            let roomky = ["472823396674174986", "476403298505850891", "760055283451035719", "682975722146758747", "472841212664086529", "476110496357941252", "476110732635930624"];
            for(let i=0; i< roomky.length; i++){
                message.member.voice.setChannel(roomky[i]);
            }
            message.member.voice.setChannel(roomka);

        }


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
    
    }
    bot.commands.get('help').execute(message, config);

    bot.commands.get('maps').execute(message, config);

    bot.commands.get('otazka').execute(message, config);

    bot.commands.get('prune').execute(bot, message, config);

    bot.commands.get('random-team').execute(message, config);

    bot.commands.get('random-cislo').execute(message, config);

    bot.commands.get('iq').execute(message, config);

    bot.commands.get('cicina').execute(message, config);
    
    bot.commands.get('corona').execute(message, config, fetch);

    bot.commands.get('global-updates').execute(message, config, db, fielddb);

    bot.commands.get('kick').execute(message, config);

    bot.commands.get('ban').execute(message, config);

    bot.commands.get('emote').execute(bot, message, config);
});
//na ping
bot.on("messageCreate", async message => {
    if (message.guild && message.guild.id === skplayersID){//skplayers
        if (message.content.startsWith(PREFIX + "redeem")){
            message.delete();
            let args = message.content.split(" ");
            let kod = args[1];
            if(!kod){
                return message.channel.send(`<@${message.author.id}> Musíš zadať kód`);
            }
            const pozrisa = db.collection('redeem');
            const kukamsa = await pozrisa.where('kluc', '==', kod).get();
            if(kukamsa.empty){
                return message.channel.send(`<@${message.author.id}> Zadal si zlý kód`);
            }
            kukamsa.forEach(zeby => {
                let cislo = zeby.data().poradie;
                db.collection('economy').doc(message.author.id).get().then((a) => {
                    if(a.exists){
                        let money = a.data().money;
                        money = parseInt(money);
                        money+= 100;
                        db.collection("economy").doc(message.author.id).update({
                            "money": money,
                        });
                        message.channel.send(`<@${message.author.id}> Úspešne ti bolo pripísaných 100 coinov`);
                    }else{
                        message.channel.send(`<@${message.author.id}> Nemáš vytvorený účet`);
                    }
                }).then(() => {
                    db.collection('redeem').doc(cislo).delete();
                });
                
            });
        }
       
    }else{

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
//fixnut
bot.on("guildMemberUpdate", (oldMember, newMember) => {
    if(newMember.nickname && oldMember.nickname !== newMember.nickname) {
        let embed = new MessageEmbed()
        .setTitle("Zmena nicknamu")
        .addField(oldMember.user.tag, `${oldMember.nickname} --> ${newMember.nickname}`)
        .setColor("00ffff")

        bot.channels.cache.get("686650199904616456").send({embeds:[embed]});
    }
});
bot.on('emojiCreate' , (emoji) => {
    emoji.guild.emojis.fetch();
});
bot.on('emojiUpdate' , (oldEmoji, newEmoji) => {
    newEmoji.guild.emojis.fetch();
});
bot.on('emojiDelete' , (emoji) => {
    emoji.guild.emojis.fetch();
});