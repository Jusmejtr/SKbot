require('dotenv').config();

module.exports = {
    name: 'web',
    description: 'connection with web',
    execute(message, db, fielddb){

        const PREFIX = process.env.PREFIX;
        const helper = process.env.MODERATOR_ROLE_ID;
        const sbs = process.env.SBS_ROLE_ID;
        const vip = process.env.VIP_ROLE_ID;


        if(message.content.startsWith(PREFIX + "web-reset")){
            let args = message.content.split(" ");
            let kod = args[1];
            let kto = message.author.tag;
            db.collection('web').doc(kto).get().then((a) => {
                if(!a.exists) return message.reply("Tvoje meno sa nezhoduje s menom účtu v databáze");
                let code = a.data().reset;
                let men = a.data().meno;
                let heslo_zmena = a.data().heslo_na_zmenu;

                if(!code) return message.reply("Nepožiadal si o zmenu hesla");
                if(code == kod && men == message.author.tag){
                    db.collection('web').doc(kto).set({
                        "meno": message.author.tag,
                        "heslo": heslo_zmena,
                        "idcko": message.author.id,
                        "rola": "nic",
                        "daily": Date.now() + 7200000,//+2h
                        "can_buy": 1,
                    });
                    return message.reply("Úspešne si si obnovil heslo pre web");
                }else{
                    return message.reply("Zadal si zlý kód, alebo nie si vlastníkom tohto web účtu");
                }
            });
        }

        if(message.content.startsWith(PREFIX + "web-register")){
            let args = message.content.split(" ");
            let kod = args[1];
            let kto = message.author.tag;
            db.collection('web').doc(kto).get().then((a) => {
                if(!a.exists) return message.reply("Tvoje meno ešte nie je zaregistrované na našom webe");
                let meno = a.data().meno;
                let kodis = a.data().reg_kod;
                let hesielko = a.data().heslo;
                if(kod == kodis && kto == meno){
                    if(message.member.roles.cache.get(helper)){
                        db.collection('web').doc(message.author.tag).set({
                            "meno": message.author.tag,
                            "heslo": hesielko,
                            "idcko": message.author.id,
                            "rola": "Helper",
                            "daily": 0,
                            "can_buy": 0,
                        });
                    }else if(message.member.roles.cache.get("802287093371502662")){
                        db.collection('web').doc(message.author.tag).set({
                            "meno": message.author.tag,
                            "heslo": hesielko,
                            "idcko": message.author.id,
                            "rola": "Developer",
                            "daily": 0,
                            "can_buy": 0,
                        });
                    }else if(message.member.roles.cache.get(sbs)){
                        db.collection('web').doc(message.author.tag).set({
                            "meno": message.author.tag,
                            "heslo": hesielko,
                            "idcko": message.author.id,
                            "rola": "SBS",
                            "daily": 0,
                            "can_buy": 0,
                        });
                    }else if(message.member.roles.cache.get(vip)){
                        db.collection('web').doc(message.author.tag).set({
                            "meno": message.author.tag,
                            "heslo": hesielko,
                            "idcko": message.author.id,
                            "rola": "VIP",
                            "daily": 0,
                            "can_buy": 0,
                        });
                    }else{
                        db.collection('web').doc(message.author.tag).set({
                            "meno": message.author.tag,
                            "heslo": hesielko,
                            "idcko": message.author.id,
                            "rola": "nic",
                            "daily": 0,
                            "can_buy": 0,
                        });
                    }
                    return message.reply("Úspešne si si aktivoval svoj web účet");
                }else{
                    return message.reply("Zadal si zlý kód, alebo nie si vlastníkom tohto web účtu");
                }
            });

        }

    }
}