require('dotenv').config();

module.exports = {
    name: "global-updates",
    description: "send game updates message to servers",
    execute(message, db, fielddb){

        const PREFIX = process.env.PREFIX;

        const { EmbedBuilder, PermissionsBitField } = require('discord.js');


        const ano = '✅';
        const nie = '❌';


        let embed = new EmbedBuilder();
        embed.setTitle(`GAME UPDATES LIST`);
        embed.setColor(`#17A7F5`);


        function send_list(db, id){
            db.collection('global-updates').doc(id).get().then((s) => {
                if(!s.exists){
                    embed.addFields(
                        {name: 'Dead by Daylight', value: nie},
                        {name: 'Euro Truck Simulator 2', value: nie},
                        {name: 'Slapshot: Rebound', value: nie}
                    )

                    //embed.addField(`Corona updates`, `${nie}`);
                    return message.reply({ embeds: [embed] });  
                }

                let db_dbd_channel = s.data().dbd_channel;

                let db_ets_channel = s.data().ets_channel;

                let db_slapshot_channel = s.data().slapshot_channel;

                let db_corona_channel = s.data().corona_channel;

                (db_dbd_channel == false || db_dbd_channel == null) ? embed.addFields({name: 'Dead by Daylight', value: nie }) : embed.addFields({name: `Dead by Daylight ${ano}`, value: `<#${db_dbd_channel}>`});
                (db_ets_channel == false || db_ets_channel == null) ? embed.addFields({name: 'Euro Truck Simulator 2', value: nie }) : embed.addFields({name: `Euro Truck Simulator 2 ${ano}`, value: `<#${db_ets_channel}>`});
                (db_slapshot_channel == false || db_slapshot_channel == null) ? embed.addFields({name: 'Slapshot: Rebound', value: nie }) : embed.addFields({name: `Slapshot: Rebound ${ano}`, value: `<#${db_slapshot_channel}>`});
                // (db_corona_channel == false || db_corona_channel == null) ? embed.addField("Corona updates", `${nie}`) : embed.addField(`Corona updates ${ano}`, `<#${db_corona_channel}>`);


                message.reply({ embeds: [embed] });  
            });
        }

        if(message.content.startsWith(PREFIX + "setupdate")){
            //message.delete();
            if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("You don't have permission **ADMINISTRATOR**");
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
                    // case 'corona':
                    //     databaza.get().then((doc) => {
                    //         if(doc.exists){
                    //             db.collection('global-updates').doc(id_of_server).update({
                    //                 'corona_channel': message.channel.id,
                    //             });
                    //         }else{
                    //             db.collection('global-updates').doc(id_of_server).set({
                    //                 'corona_channel': message.channel.id,
                    //             });
                    //         }
                    //     }).catch((error) => {
                    //         console.log("Error getting document:", error);
                    //     });
                    //     message.reply("You have successfully added **Corona updates** to the list.\n This channel will receive notifications when an update is released");
                    //     break;

                
                    default:
                        message.reply(`Game **${args[1]}** is not valid. Please check supported games on *game-code`);
                        break;
                }
            }
        }

        if(message.content.startsWith(PREFIX + "removeupdate")){
            //message.delete();
            if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("You don't have permission **ADMINISTRATOR**");
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
                    // case 'corona':
                    //     databaza.get().then((doc) => {
                    //         if(doc.exists){
                    //             db.collection('global-updates').doc(id_of_server).get().then((o) => {
                    //                 if(o.data().corona_channel == null){
                    //                     message.reply("You didn't setup this update yet");
                    //                     return;
                    //                 }
                    //                 db.collection('global-updates').doc(id_of_server).update({
                    //                     'corona_channel': fielddb.delete(),
                    //                 });
                    //                 message.reply("You have successfully removed **Corona updates** from the list.\n This channel will not receive notifications when an update is released");
                    //             });
                    //         }else{
                    //             return message.reply("You didn't setup this update yet");
                    //         }
                    //     }).catch((error) => {
                    //         console.log("Error getting document:", error);
                    //     });
                    //     break;
            
                    default:
                        message.reply(`Game **${args[1]}** is not valid. Please check supported games`);
                        break;
                }
            }
        }

        if(message.content === PREFIX + "updatelist"){
            if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("You don't have permission **ADMINISTRATOR**");
            let server_id = message.guild.id;
            send_list(db, server_id);
        }

        if(message.content === PREFIX + "help-updates"){
            let embed = new EmbedBuilder()
                .setTitle("Global updates")
                .setColor("ff0000")
                .addFields(
                    {name: '*updatelist', value: 'Shows actual game update list'},
                    {name: '*setupdate', value: 'Set channel to receive game updates'},
                    {name: '*removeupdate', value: 'Disable receiving game updates'},
                    {name: '*game-code', value: 'Shows game code for setupdate command'},
                )
            message.reply({embeds: [embed]});
        }

        if(message.content === PREFIX + "game-code"){
            //message.delete();
            let embed2 = new EmbedBuilder()
                .setTitle("Game code")
                .setColor("ff0000")
                .addFields(
                    {name: 'Dead by Daylight', value: 'code: dbd (usage: *setupdate dbd)'},
                    {name: 'Euro Truck Simulator 2', value: 'code: ets (usage: *setupdate ets)'},
                    {name: 'Slapshot: Rebound', value: 'code: slapshot (usage: *setupdate slapshot)'},
                )
                // .addField("Corona updates", "code: corona (usage: *setupdate corona)")

                message.reply({embeds: [embed2]});
        }
    }
}