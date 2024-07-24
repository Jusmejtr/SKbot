require('dotenv').config();
const { addMoney } = require('../utils/economy-db');

module.exports = {
    name: 'addmoney',
    description: 'add money to someone',
    async execute(bot, message) {
        const PREFIX = process.env.PREFIX;
        const admin = process.env.ADMIN_ROLE_ID;

        if (message.content.startsWith(PREFIX + "addmoney")) {
            let args = message.content.split(" ");
            let user = message.mentions.users.first();

            if (message.member.roles.cache.has(admin)) {
                if (!user) return message.reply("Nemôžem nájsť tohto užívateľa");
                if (!args[2]) return message.reply("Zadaj sumu, ktorú chces pripísať na účet");

                let amount = parseInt(args[2]);
                if (isNaN(amount)) return message.reply("Zadaj platnú sumu");

                let result = await addMoney(user.id, amount);
                if (result) {
                    message.reply(`Úspešne si pridal ${amount} coinov užívateľovi ${bot.users.cache.get(user.id).username}`);
                } else {
                    message.reply(`${user.tag} nemá vytvorený účet`);
                }
            } else {
                message.reply("Na tento príkaz nemáš práva");
            }
        }
    }
}
