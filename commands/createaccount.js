require('dotenv').config();

module.exports = {
    name: 'createaccount',
    description: 'vytvorenie uctu',
    async execute(message, db){

        const PREFIX = process.env.PREFIX;
        if (message.content === PREFIX + "createaccount") {
            //message.delete();

            let uzivatel = message.author.id;
            
            const a = db.collection('economy').doc(uzivatel);
            const b = await a.get();
            if(b.exists) return message.reply("už máš vytvorený účet");
            
            db.collection('economy').doc(uzivatel).set({
                'ID': message.member.user.id,
                'money': 0,
                'daily': 0,
                'meno': message.author.tag
            });
            db.collection('statistiky').doc(uzivatel).set({
                'gamble_lose': 0,
                'gamble_win': 0,
                'givnute': 0,
                'meno': message.member.user.tag,
                'pregamblene': 0,
                'suma_prehra': 0,
                'suma_vyhra': 0,
                'gamble_count': 1000
            });
            message.member.roles.add("790184496208150589");//economy role
            message.reply("Úspešne si si vytvoril svoj účet");  
                
        }
    }
}