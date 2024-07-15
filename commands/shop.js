require('dotenv').config();

module.exports = {
    name: 'shop',
    description: 'send shop',
    execute(message){

        const PREFIX = process.env.PREFIX;

        if (message.content === PREFIX + "shop") {
            const shopik = {
                "title": "SHOP",
                "color": 0xff0000,
                "fields": [
                  /*{
                    name: "*buy vip 1d",
                    value: "Kúpi ti VIP na jeden deň (cena: 500 coinov)",
                  },*/
                  {
                    name: "*buy vip x",
                    value: "Kúpi ti VIP na x dni (cena: 250/deň)",
                  },
                  {
                    name: "*buy colorname #------ x",
                    value: "Kúpi ti farebné meno na x dni, namiesto pomlčiek doplň svoj hex-kód farby, ktorý môžeš nájsť tu: https://htmlcolorcodes.com/ (cena: 150/deň)  zrušiť to môžeš príkazom *delete colorname",
                  },/*
                  {
                    name: "*buy 30d-colorname #------",
                    value: "Kúpi ti farebné meno na 30 dní, pomlčky nahraď hex-kódom (cena: 3000 coinov) zrušiť to môžeš príkazom *delete name"
                  },*/
                  {
                    name: "*buy text-mute @someone 5",
                    value: "Text-mutneš užívateľa na 5 minút (možnosť mute od 1 do 120 minút) (cena: 1m = 50 coinov)",
                    //"inline": true
                  },
                  {
                    name: "*buy voice-mute @someone 5",
                    value: "Voice-mutneš užívateľa na 5 minút (možnosť mute od 1 do 10 minút) (cena: 1m = 500 coinov)",
                  }

                ]
              };
            message.reply({ embeds:[shopik] });
        }
    
    }
}
