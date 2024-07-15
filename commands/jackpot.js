require('dotenv').config();

module.exports = {
    name: 'jackpot',
    description: 'jackpot game',
    execute(message, db){
        const PREFIX = process.env.PREFIX;
        
        const fs = require('fs');
        const { EmbedBuilder } = require('discord.js');
        if (message.content.startsWith(PREFIX + "jackpot")) {
            
            let uzivatel = message.member.user.id;

            let args = message.content.split(" ");
            //d,q,l,o,k,n,
            db.collection('economy').doc(uzivatel).get().then((d) => {
                if(!d.exists) return message.reply("nemáš vytvorený účet");  

                var hodnota = d.data().money;
                if(hodnota < 20) return message.reply("Nemáš dostatok financií na stávkovanie, minimálna stávka 20 coinov");
                if(isNaN(args[1])) return message.reply("Formát čísla je nesprávny");
                if(args[1] != Math.floor(args[1])) return message.reply("Musíš zadať číslo");
                if(hodnota < args[1]) return message.reply("Nemáš toľko peňazí");
                if(args[1] < 20) return message.reply("Menej ako 20 coinov nemôžeš staviť");
                try{
                    args[1] = parseInt(args[1]);
                }catch{
                    return message.reply("musíš zadať celé číslo");
                }

                db.collection('statusy').doc('status').get().then((q) => {
                    var status = q.data().stav;

                    if(status === 'off'){                                                           //OFF
                        db.collection('jackpot').doc(message.member.user.id).set({
                            'meno': message.member.user.tag,
                            'id': message.member.user.id,
                            'stavka': args[1],
                            'sanca': 0,
                        }).then(() => {
                        db.collection('statusy').doc('status').update({
                            'ludia': 1,
                            'stav': "on",
                            'celkom': args[1],
                        });
                        hodnota -= args[1];
                        db.collection('economy').doc(uzivatel).update({
                            'money': hodnota
                        });
                        fs.writeFile("temp.txt", `${message.author.id}\n`, function (err) {
                            if (err) console.log(err);
                            console.log("Successfully Written to File.");
                        });
                        let embed = new EmbedBuilder();
                        embed.setTitle("Jackpot stávka");
                        embed.setColor("#9032df");
                        embed.addFields({name: message.author.tag, value:`stavil: ${args[1]}, celkom stavených: ${args[1]}`});
                        
                        let embedik = new EmbedBuilder();
                        embedik.setTitle("Ak sa do 30 sekúnd nikto nepripojí, jackpot skončí");
                        embedik.setColor("#9032df");
                        message.reply({embeds: [embed, embedik]});

                        }).then(() => {
                            setTimeout(function(){
                                db.collection('statusy').doc('status').update({
                                    'stav': "zaver",
                                });
                            }, 30000);

                            setTimeout(function(){
                                db.collection('statusy').doc('status').get().then((b) =>{
                                    var pocet_ludi = b.data().ludia;
                                    if(pocet_ludi < 2){
                                        db.collection('jackpot').doc(message.member.user.id).get().then((jak) => {
                                            var kolko = jak.data().stavka;
                                            db.collection('economy').doc(uzivatel).get().then((o) => {
                                                var cislicko = o.data().money;
                                                cislicko = cislicko + kolko;
                                                db.collection('economy').doc(uzivatel).update({
                                                    'money': cislicko
                                                });                
                                            });
                                        }).then(() => {
                                            db.collection('jackpot').doc(message.member.user.id).delete();
                                        }).catch(console.error);
                                        db.collection('statusy').doc('status').update({
                                            'ludia': 0,
                                            'stav': "off",
                                            'celkom': 0,
                                        });
                                        fs.unlink('temp.txt', (err) => {
                                            if(err) console.log(err);
                                        });
                                        let embedos = new EmbedBuilder();
                                        embedos.setColor("#9032df");
                                        embedos.setTitle("Nikto ďalší sa nepripojil, jackpot skončil");
                                        return message.reply({embeds: [embedos]});
                                    }else if(pocet_ludi > 3){
                                        db.collection('statusy').doc('status').update({
                                            'stav': "broken",
                                        });
                                        return message.channel.send("Bol zistený prekročený limit hráčov v jackpote. Jackpot sa automaticky zablokoval. Coiny budú vrátené po príchode admina");
                                    }else{
                                        db.collection('statusy').doc('status').update({
                                            'stav': "odmeny",
                                        });
                                        //fs.writeFileSync('sance.txt', '');
                                        db.collection('statusy').doc('status').get().then((u) => {
                                            var nieco = fs.readFileSync('temp.txt').toString().split("\n");

                                            const x = [];

                                            for (i in nieco){
                                                x.push(nieco[i]);
                                            }
                                            var celkovo = u.data().ludia;
                                            var peniaze_spolu = u.data().celkom;
                                            for(let i=0; i < celkovo; i++){
                                                var menucko = x[i];//menucko = id hraca
                                                console.log(`meno ${i}: ${menucko}`);
                                                db.collection('jackpot').doc(menucko).get().then((h) =>{
                                                    var mienko = h.data().meno;
                                                    var idcko = h.data().id;
                                                    var a = h.data().stavka;
                                                    a = parseInt(a);
                                                    var sanca = 100 / peniaze_spolu;
                                                    var sancecka = sanca * a;
                                                    sancecka = sancecka.toFixed(2);
                                                    db.collection('jackpot').doc(idcko).update({
                                                        'sanca': sancecka,
                                                    }); 
                                                    message.channel.send(`${i+1} ${mienko}, stávka: ${a}, šanca: ${sancecka}%`);
                                                });
                                            }
                                            setTimeout(function(){
                                                let vyherca = new EmbedBuilder();
                                                vyherca.setColor("#9032df");
                                                vyherca.setTitle("VÝHERCA");

                                                switch (celkovo) {
                                                    case 2://1-25,26-50,51-75,76-100 10,20,30,40
                                                        //1-50,51-100
                                                        db.collection('jackpot').doc(x[0]).get().then((ew) => {
                                                            let meno = ew.data().meno;
                                                            var stavecka = ew.data().sanca;
                                                            let cisielko = Math.floor(Math.random() * 100) + 1;
                                                            message.channel.send(`random cislo: ${cisielko}`);
                                                            if(cisielko <= stavecka){
                                                                vyherca.setDescription(`${meno} vyhral ${peniaze_spolu}`);
                                                                message.channel.send({embeds: [vyherca]});
                                                                db.collection('economy').doc(`${x[0]}`).get().then((j) => {
                                                                    var peniazecky = j.data().money;
                                                                    peniazecky += peniaze_spolu;
                                                                    db.collection('economy').doc(`${x[0]}`).update({
                                                                        'money': peniazecky
                                                                    }); 
                                                                });
                                                            }else if(cisielko > stavecka){
                                                                db.collection('jackpot').doc(x[1]).get().then((t) => {
                                                                    let meno = t.data().meno;
                                                                    vyherca.setDescription(`${meno} vyhral ${peniaze_spolu}`);
                                                                    message.channel.send({embeds: [vyherca]});
                                                                    db.collection('economy').doc(`${x[1]}`).get().then((ja) => {
                                                                        var peniazecky2 = ja.data().money;
                                                                        peniazecky2 += peniaze_spolu;
                                                                        db.collection('economy').doc(`${x[1]}`).update({
                                                                            'money': peniazecky2
                                                                        }); 
                                                                    });
                                                                });
                                                            }else{
                                                                message.channel.send("Nastal error (kód 2)");
                                                                message.channel.send(`x0: ${x[0]}, x1: ${x[1]}, rnd: ${cisielkoo}`);
                                                                db.collection('statusy').doc('status').update({
                                                                    'stav': "chyby2",
                                                                });
                                                            }
                                                            
                                                        });
                                                        break;
                                                    case 3:
                                                        //1-30,31-60,61-100
                                                        db.collection('jackpot').doc(x[0]).get().then((aja) =>{
                                                            let meno = aja.data().meno;
                                                            var eno0 = aja.data().sanca;
                                                            let cisielkoo = Math.floor(Math.random() * 100) + 1;

                                                            message.channel.send(`random cislo: ${cisielkoo}`);
                                                                
                                                                db.collection('jackpot').doc(x[2]).get().then((pok) =>{
                                                                    var eno2 = pok.data().sanca;
                                                                    let cislo_minus100 = 100 - eno2;
                                                                    if(cisielkoo <= eno0){
                                                                        vyherca.setDescription(`${meno} vyhral ${peniaze_spolu}`);
                                                                        message.channel.send({embeds: [vyherca]});
                                                                        db.collection('economy').doc(`${x[0]}`).get().then((j) => {
                                                                            var peniazecky = j.data().money;
                                                                            peniazecky += peniaze_spolu;
                                                                            db.collection('economy').doc(`${x[0]}`).update({
                                                                                'money': peniazecky
                                                                            }); 
                                                                        });
                                                                    }else if(cisielkoo > cislo_minus100){
                                                                        db.collection('jackpot').doc(x[2]).get().then((b) => {
                                                                            let meno = b.data().meno;
                                                                            vyherca.setDescription(`${meno} vyhral ${peniaze_spolu}`);
                                                                            message.channel.send({embeds: [vyherca]});
                                                                            db.collection('economy').doc(`${x[2]}`).get().then((ja) => {
                                                                                var peniazecky2 = ja.data().money;
                                                                                peniazecky2 += peniaze_spolu;
                                                                                db.collection('economy').doc(`${x[2]}`).update({
                                                                                    'money': peniazecky2
                                                                                }); 
                                                                            });
                                                                        });
                                                                    }else if(cisielkoo > eno0 && cisielkoo <= cislo_minus100){
                                                                        db.collection('jackpot').doc(x[1]).get().then((c) => {
                                                                            let meno = c.data().meno;
                                                                            vyherca.setDescription(`${meno} vyhral ${peniaze_spolu}`);
                                                                            message.channel.send({embeds: [vyherca]});
                                                                            db.collection('economy').doc(`${x[1]}`).get().then((ja) => {
                                                                                var peniazecky3 = ja.data().money;
                                                                                peniazecky3 += peniaze_spolu;
                                                                                db.collection('economy').doc(`${x[1]}`).update({
                                                                                    'money': peniazecky3
                                                                                }); 
                                                                            });
                                                                        });
                                                                    }else{
                                                                        message.channel.send("Nastal error (kód 3)");
                                                                        message.channel.send(`x0: ${x[0]}, x1: ${x[1]}, x2: ${x[2]}, rnd: ${cisielkoo}`);
                                                                        db.collection('statusy').doc('status').update({
                                                                            'stav': "chyba3",
                                                                        });
                                                                    }
                                                                    
                                                                });
                                                        });
                                                        break;
                                                    default:
                                                        message.channel.send("Error, výhra nebola vyplatená z dôvodu, že v databáze sa nachádzajú viac ako traja hráči. Prosím chybu nahláste adminovi");
                                                        break;
                                                }
                                                try {
                                                    fs.unlinkSync('temp.txt')
                                                } catch(err10) {
                                                    console.error(err10)
                                                }
                                                db.collection('statusy').doc('status').update({
                                                    'ludia': 0,
                                                    'stav': "off",
                                                    'celkom': 0,
                                                });
                                            }, 500);
                                            setTimeout(function(){
                                                db.collection("jackpot").get().then(res => {
                                                    res.forEach(element => {
                                                    element.ref.delete();
                                                    });
                                                });
                                            }, 750);
                                            setTimeout(function(){
                                                db.collection('jackpot').doc('test').set({
                                                    'test': "cau",
                                                });
                                            }, 950);
                                        }).catch(console.error);
                                    }
                                });
                            }, 35000);
                        }).catch(console.error);
                    } else if(status === 'on'){                                                                     //ON
                        db.collection('jackpot').doc(message.member.user.id).get().then((k) => {
                            if(k.exists){
                                var suma = k.data().stavka;

                                hodnota -= args[1];
                                db.collection('economy').doc(message.member.user.id).update({
                                    'money': hodnota,
                                });    
                                suma += args[1];

                                let embed = new EmbedBuilder();
                                embed.setColor("#9032df");
                                embed.setTitle("Jackpot stávka");
                                embed.addFields({name: message.author.tag, value: `stavil: ${args[1]}, celkom stavených ${suma}`});
                                message.channel.send({embeds: [embed]});

                                db.collection('jackpot').doc(message.member.user.id).update({
                                    'stavka': suma,
                                });
                                db.collection('statusy').doc('status').get().then((n) => {
                                    var sumcek = n.data().celkom;
                                    sumcek += args[1];
                                    db.collection('statusy').doc('status').update({
                                        'celkom': sumcek,
                                    });    
                                });
                            }else{
                                db.collection('statusy').doc('status').get().then((ono) => {
                                    var cislo = ono.data().ludia;
                                    if(cislo > 2) return message.channel.send("Dosiahol sa maximálny počet ľudí");// max pocet ludi
                                    
                                    db.collection('economy').doc(message.member.user.id).get().then((a) => {
                                        var peniazky = a.data().money;
                                        peniazky -= args[1];
                                        db.collection('economy').doc(message.member.user.id).update({
                                            'money': peniazky,
                                        });
                                        db.collection('jackpot').doc(message.member.user.id).set({
                                            'meno': message.member.user.tag,
                                            'id': message.member.user.id,
                                            'stavka': args[1],
                                            'sanca': 0,
                                        });
                                        db.collection('statusy').doc('status').get().then((s) => {
                                            var sum = s.data().celkom;
                                            sum = parseInt(sum);
                                            sum += args[1];
                                            var lidicky = s.data().ludia;
                                            lidicky += 1;
                                            db.collection('statusy').doc('status').update({
                                                'celkom': sum,
                                                'ludia': lidicky,
                                            });   
                                        });
                                        
                                    });
                                    fs.appendFile('temp.txt', `${message.author.id}\n`, function (err) {
                                        if (err) return console.log(err);
                                        console.log('Appended!');
                                    });
                                    let embed1 = new EmbedBuilder();
                                    embed1.setColor("#9032df");
                                    embed1.setTitle("Jackpot stávka");
                                    embed1.addFields({name: message.author.tag, value: `stavil: ${args[1]}, celkom stavených ${args[1]}`});
                                    message.channel.send({embeds: [embed1]});
                                });
                            }
                        });
                    } else if(status == 'odmeny'){
                        message.reply("Jackpot práve skončil a vytvárajú sa výsledky, prosím počkaj chvíľu a tak zopakuj command");
                    } else if(status == 'zaver'){
                        message.reply("5 sekúnd pred vyhodnotením jackpotu nemôžeš dať stávku");
                    } else if(status == 'broken'){
                        message.reply("Jackpot je momentálne pozastavený pretože bola naposledy zle vyhodotená výhra. Jackpot bude znovu spustený po príchode admina");
                    }
                     else{
                        message.channel.send("Nastala chyba");
                    }
                });
            });

        }
    }
}