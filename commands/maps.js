require('dotenv').config();

module.exports = {
    name: 'maps',
    description: 'generate random map from active map pool',
    execute(message){
        const PREFIX = process.env.PREFIX;
        //active
        function MapA() {
            let map_a = ["Mirage", "Inferno", "Ancient", "Nuke", "Dust II", "Anubis", "Vertigo"];
            let rnd = Math.floor(Math.random() * map_a.length);
            let output = map_a[rnd];
            return output;
        }
        if (message.content === PREFIX + "map-a") {
            //message.delete();
            message.reply(`${MapA()} (active maps)`);
        }
        //wm
        function MapWM() {
            let map_wm = ["Vertigo", "Overpass", "Inferno", "Nuke", "Memento", "Assembly"];
            let rnd = Math.floor(Math.random() * map_wm.length);
            let output = map_wm[rnd];
            return output;
        }
        if (message.content === PREFIX + "map-wm") {
            //message.delete();
            message.reply(`${MapWM()} (wingman maps)`);
        }
        //mm
        function MapMM() {
        let map_mm = ["Mirage", "Inferno", "Overpass", "Vertigo", "Nuke", "Ancient", "Dust II", "Anubis", "Thera", "Mills", "Office"];
        let rnd = Math.floor(Math.random() * map_mm.length);
        let output = map_mm[rnd];
        return output;
        }
        if (message.content === PREFIX + "map-mm") {
            //message.delete();
            message.reply(`${MapMM()} (kompetetívne mapy)`);
        }
        if(message.content.startsWith(PREFIX + "map-r")){
            let args = message.content.split(" ");
            if(!args[1]) return message.reply("You need to specify input (*map-r mirage inferno)");
            let velkost = message.content.split(" ").length;
            let map_r = [];
            for(let i=1;i<velkost;i++){
                map_r.push(args[i]);
                
            }
            let rnd = Math.floor(Math.random() * map_r.length);
            let output = map_r[rnd];
            return message.reply(output);
        }


    }
}
