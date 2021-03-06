module.exports = {
    name: "global-updates",
    description: "send game updates message to servers",
    execute(message, config, db, fielddb){

        const PREFIX = (config.prefix);

        const { MessageEmbed, Permissions } = require('discord.js');


        const ano = '✅';
        const nie = '❌';


        let embed = new MessageEmbed();
        embed.setTitle(`GAME UPDATES LIST`);
        embed.setColor(`#17A7F5`);


        function send_list(db, id){
            db.collection('global-updates').doc(id).get().then((s) => {
                if(!s.exists){
                    embed.addField(`Dead by Daylight`, `${nie}`);
                    embed.addField(`Euro Truck Simulator 2`, `${nie}`);
                    embed.addField(`Slapshot: Rebound`, `${nie}`);
                    embed.addField(`Corona updates`, `${nie}`);
                    return message.reply({ embeds: [embed] });  
                }

                let db_dbd_channel = s.data().dbd_channel;

                let db_ets_channel = s.data().ets_channel;

                let db_slapshot_channel = s.data().slapshot_channel;

                let db_corona_channel = s.data().corona_channel;

                (db_dbd_channel == false || db_dbd_channel == null) ? embed.addField(`Dead by Daylight`, `${nie}`) : embed.addField(`Dead by Daylight ${ano}`, `<#${db_dbd_channel}>`);
                (db_ets_channel == false || db_ets_channel == null) ? embed.addField("Euro Truck Simulator 2", `${nie}`) : embed.addField(`Euro Truck Simulator 2 ${ano}`, `<#${db_ets_channel}>`);
                (db_slapshot_channel == false || db_slapshot_channel == null) ? embed.addField("Slapshot: Rebound", `${nie}`) : embed.addField(`Slapshot: Rebound ${ano}`, `<#${db_slapshot_channel}>`);
                (db_corona_channel == false || db_corona_channel == null) ? embed.addField("Corona updates", `${nie}`) : embed.addField(`Corona updates ${ano}`, `<#${db_corona_channel}>`);


                message.channel.send({ embeds: [embed] });  
            });
        }

        if(message.content.startsWith(PREFIX + "setupdate")){
            //message.delete();
            if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply("You don't have permission **ADMINISTRATOR**");
            let args = message.content.split(" ");
            let id_of_server = message.guild.id;
            if(!args[1]){
                return message.reply('You need to specify game (\\*setupdate ets). Full list of games is on \\*game-code');
            }else{
                var databaza = db.collection("global-updates").doc(id_of_server);
                switch (args[1]) {
                    case 'dbd':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).update({
                                    'dbd_channel': message.channel.id,
                                });
                            }else{
                                db.collection('global-updates').doc(id_of_server).set({
                                    'dbd_channel': message.channel.id,
                                });
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        message.reply("You have successfully added **Dead by Daylight** the game to the list.\n This channel will receive notifications when an update is released");
                        break;
                    case 'ets':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).update({
                                    'ets_channel': message.channel.id,
                                });
                            }else{
                                db.collection('global-updates').doc(id_of_server).set({
                                    'ets_channel': message.channel.id,
                                });
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        message.reply("You have successfully added **Euro Truck Simulator 2** game to the list.\n This channel will receive notifications when an update is released")
                    break;
                    case 'slapshot':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).update({
                                    'slapshot_channel': message.channel.id,
                                });
                            }else{
                                db.collection('global-updates').doc(id_of_server).set({
                                    'slapshot_channel': message.channel.id,
                                });
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        message.reply("You have successfully added **Slapshot: Rebound** game to the list.\n This channel will receive notifications when an update is released")
                    break;
                    case 'corona':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).update({
                                    'corona_channel': message.channel.id,
                                });
                            }else{
                                db.collection('global-updates').doc(id_of_server).set({
                                    'corona_channel': message.channel.id,
                                });
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        message.reply("You have successfully added **Corona updates** to the list.\n This channel will receive notifications when an update is released");
                        break;

                
                    default:
                        message.reply(`Game **${args[1]}** is not valid. Please check supported games on *game-code`);
                        break;
                }
            }
        }

        if(message.content.startsWith(PREFIX + "removeupdate")){
            //message.delete();
            if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply("You don't have permission **ADMINISTRATOR**");
            let args = message.content.split(" ");
            let id_of_server = message.guild.id;
            if(!args[1]){
                return message.reply("You need to specify game (*removeupdate ets)");
            }else{
                var databaza = db.collection("global-updates").doc(id_of_server);
                switch (args[1]) {
                    case 'dbd':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).get().then((o) => {
                                    if(o.data().dbd_channel == null){
                                        message.reply("You didn't setup this game yet");
                                        return;
                                    }
                                    db.collection('global-updates').doc(id_of_server).update({
                                        'dbd_channel': fielddb.delete(),
                                    });
                                    message.reply("You have successfully removed **Dead by Daylight** game from the list.\n This channel will not receive notifications when an update is released");
                                });
                            }else{
                                return message.reply("You didn't setup this game yet");
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        break;
                    case 'ets':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).get().then((o) => {
                                    if(o.data().ets_channel == null){
                                        message.reply("You didn't setup this game yet");
                                        return;
                                    }
                                    db.collection('global-updates').doc(id_of_server).update({
                                        'ets_channel': fielddb.delete(),
                                    });
                                    message.reply("You have successfully removed **Euro Truck Simulator 2** game from the list.\n This channel will not receive notifications when an update is released");
                                });
                            }else{
                                return message.reply("You didn't setup this game yet");
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        break;
                    case 'slapshot':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).get().then((o) => {
                                    if(o.data().slapshot_channel == null){
                                        message.reply("You didn't setup this game yet");
                                        return;
                                    }
                                    db.collection('global-updates').doc(id_of_server).update({
                                        'slapshot_channel': fielddb.delete(),
                                    });
                                    message.reply("You have successfully removed **Slapshot: Rebound** game from the list.\n This channel will not receive notifications when an update is released");
                                });
                            }else{
                                return message.reply("You didn't setup this game yet");
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        break;
                    case 'corona':
                        databaza.get().then((doc) => {
                            if(doc.exists){
                                db.collection('global-updates').doc(id_of_server).get().then((o) => {
                                    if(o.data().corona_channel == null){
                                        message.reply("You didn't setup this update yet");
                                        return;
                                    }
                                    db.collection('global-updates').doc(id_of_server).update({
                                        'corona_channel': fielddb.delete(),
                                    });
                                    message.reply("You have successfully removed **Corona updates** from the list.\n This channel will not receive notifications when an update is released");
                                });
                            }else{
                                return message.reply("You didn't setup this update yet");
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });
                        break;
            
                    default:
                        message.reply(`Game **${args[1]}** is not valid. Please check supported games`);
                        break;
                }
            }
        }

        if(message.content === PREFIX + "updatelist"){
            //message.delete();
            if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply("You don't have permission **ADMINISTRATOR**");
            let server_id = message.guild.id;
            send_list(db, server_id);
        }

        if(message.content === PREFIX + "setup-updates"){
            //message.delete();
            let embed = new MessageEmbed()
                .setTitle("Global updates")
                .setColor("ff0000")
                .addField("*updatelist", "Shows actual game update list")
                .addField("*setupdate", "Set channel to receive game updates")
                .addField("*removeupdate", "Disable receiving game updates")
                .addField("*game-code", "Shows game code for setupdate command")

            message.channel.send({embeds: [embed]});
        }

        if(message.content === PREFIX + "game-code"){
            //message.delete();
            let embed2 = new MessageEmbed()
                .setTitle("Game code")
                .setColor("ff0000")
                .addField("Dead by Daylight", "code: dbd (usage: *setupdate dbd)")
                .addField("Euro Truck Simulator 2", "code: ets (usage: *setupdate ets)")
                .addField("Slapshot: Rebound", "code: slapshot (usage: *setupdate slapshot)")
                .addField("Corona updates", "code: corona (usage: *setupdate corona)")

                message.channel.send({embeds: [embed2]});
        }
    }
}