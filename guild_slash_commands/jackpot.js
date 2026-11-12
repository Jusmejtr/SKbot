const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/db');

const BET_WINDOW_MS = 30000;
const MAX_PLAYERS = 3;
const COLOR = '#9032df';

// Rozbehnuté kolo jackpotu (len v pamäti; stávky sú navyše v DB, aby sa po páde bota vrátili)
let kolo = null; // { channel, bets: Map<userId, { tag, amount }>, closesAt, vyhodnocuje }

const spolu = () => [...kolo.bets.values()].reduce((s, b) => s + b.amount, 0);

async function vyhodnot() {
    const { channel, bets } = kolo;
    kolo.vyhodnocuje = true;
    const hraci = [...bets.entries()];
    const pot = spolu();

    try {
        if (hraci.length < 2) {
            const [userId, b] = hraci[0];
            db.addMoney(userId, b.amount);
            await channel.send({ embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Nikto ďalší sa nepripojil, jackpot skončil').setDescription(`${b.tag}, coiny ti boli vrátené`)] });
            return;
        }

        // vážený náhodný výber – kto stavil viac, má väčšiu šancu
        let los = Math.random() * pot;
        let vyherca = hraci[hraci.length - 1];
        for (const h of hraci) {
            los -= h[1].amount;
            if (los < 0) { vyherca = h; break; }
        }
        db.addMoney(vyherca[0], pot);

        const embed = new EmbedBuilder()
            .setColor(COLOR)
            .setTitle('VÝHERCA')
            .setDescription(`**${vyherca[1].tag}** vyhral **${pot}** coinov`)
            .addFields(hraci.map(([, b], i) => ({
                name: `${i + 1}. ${b.tag}`,
                value: `stávka: ${b.amount}, šanca: ${(b.amount / pot * 100).toFixed(2)}%`,
            })));
        await channel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Chyba pri vyhodnotení jackpotu:', err);
    } finally {
        db.clearJackpotBets();
        kolo = null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jackpot')
        .setDescription(`Jackpot hra (2-${MAX_PLAYERS} hráči, kto stavil viac, má väčšiu šancu)`)
        .addIntegerOption(o => o.setName('bet').setDescription('Stávka (minimálne 20)').setRequired(true).setMinValue(20)),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const user = interaction.user;

        if (kolo?.vyhodnocuje) return interaction.reply('Jackpot sa práve vyhodnocuje, skús to o chvíľu');
        if (kolo && kolo.channel.id !== interaction.channel.id) {
            return interaction.reply(`Jackpot práve beží v roomke ${kolo.channel}`);
        }
        if (kolo && !kolo.bets.has(user.id) && kolo.bets.size >= MAX_PLAYERS) {
            return interaction.reply(`Dosiahol sa maximálny počet hráčov (${MAX_PLAYERS})`);
        }

        const r = db.takeMoney(user.id, bet);
        if (r === 'no_account') return interaction.reply('Nemáš vytvorený účet');
        if (r === 'insufficient') return interaction.reply('Nemáš toľko peňazí');
        db.addJackpotBet(user.id, bet);

        const novy = !kolo;
        if (novy) {
            kolo = { channel: interaction.channel, bets: new Map(), closesAt: Date.now() + BET_WINDOW_MS, vyhodnocuje: false };
            setTimeout(vyhodnot, BET_WINDOW_MS);
        }
        const predtym = kolo.bets.get(user.id)?.amount ?? 0;
        kolo.bets.set(user.id, { tag: user.tag, amount: predtym + bet });

        const zostava = Math.max(0, Math.round((kolo.closesAt - Date.now()) / 1000));
        const embed = new EmbedBuilder()
            .setTitle('Jackpot stávka')
            .setColor(COLOR)
            .addFields({ name: user.tag, value: `stavil: ${bet}, celkom stavených: ${predtym + bet}` })
            .setFooter({ text: `V banku: ${spolu()} coinov • hráči: ${kolo.bets.size}/${MAX_PLAYERS} • koniec o ${zostava} s` });
        if (novy) embed.setDescription(`Jackpot začal! Ak sa do ${BET_WINDOW_MS / 1000} sekúnd nikto nepripojí, coiny sa vrátia.`);

        return interaction.reply({ embeds: [embed] });
    }
}
