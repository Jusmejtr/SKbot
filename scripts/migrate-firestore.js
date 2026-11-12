// Jednorazový prenos dát z Firestore do SQLite.
// Spusti PRED odinštalovaním firebase-admin:  node scripts/migrate-firestore.js
// Potrebuje serviceAccount.json v koreni projektu. Ak už SQLite obsahuje účty, pridaj --force.
const path = require('path');
const admin = require('firebase-admin');
const db = require('../utils/db');
const config = require('../config');

const force = process.argv.includes('--force');
const num = (v) => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;

async function main() {
    const existing = db.raw.prepare('SELECT COUNT(*) AS n FROM accounts').get().n;
    if (existing > 0 && !force) {
        console.error(`SQLite už obsahuje ${existing} účtov. Ak ich chceš prepísať dátami z Firestore, spusti so --force.`);
        process.exit(1);
    }

    admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, '..', 'serviceAccount.json'))) });
    const fs = admin.firestore();
    const read = async (name) => (await fs.collection(name).get()).docs.map(d => ({ id: d.id, ...d.data() }));

    const [economy, statistiky, nakupy, nakupy2, globalUpdates] = await Promise.all(
        ['economy', 'statistiky', 'nakupy', 'nakupy2', 'global-updates'].map(read)
    );

    const insAccount = db.raw.prepare('INSERT OR REPLACE INTO accounts (user_id, name, money, daily_at, created_at) VALUES (?, ?, ?, ?, ?)');
    const insStats = db.raw.prepare(`INSERT OR REPLACE INTO gamble_stats
        (user_id, wins, losses, total_bet, total_won, total_lost, total_given) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const insPurchase = db.raw.prepare('INSERT OR REPLACE INTO purchases (user_id, type, role_id, expires_at) VALUES (?, ?, NULL, ?)');
    const insChannel = db.raw.prepare('INSERT OR REPLACE INTO game_update_channels (guild_id, game, channel_id) VALUES (?, ?, ?)');

    const counts = { accounts: 0, stats: 0, purchases: 0, channels: 0 };
    db.tx(() => {
        for (const e of economy) {
            insAccount.run(e.id, String(e.meno ?? e.id), num(e.money), num(e.daily), Date.now());
            counts.accounts++;
        }
        for (const s of statistiky) {
            insStats.run(s.id, num(s.gamble_win), num(s.gamble_lose), num(s.pregamblene), num(s.suma_vyhra), num(s.suma_prehra), num(s.givnute));
            counts.stats++;
        }
        for (const n of nakupy) {
            if (!n.platnostnakupu) continue;
            insPurchase.run(n.id, 'colorname', num(n.platnostnakupu));
            counts.purchases++;
        }
        for (const n of nakupy2) {
            if (!n.platnostnakupu) continue;
            insPurchase.run(n.id, 'vip', num(n.platnostnakupu));
            counts.purchases++;
        }
        for (const g of globalUpdates) {
            for (const game of config.games) {
                const channel = g[`${game.code}_channel`];
                if (channel && channel !== '0') {
                    insChannel.run(g.id, game.code, String(channel));
                    counts.channels++;
                }
            }
        }
    });

    console.log('Hotovo:', counts);
    console.log(`Databáza: ${db.DB_PATH}`);
    console.log('Teraz môžeš odinštalovať Firebase: npm uninstall firebase firebase-admin node-fetch');
    process.exit(0);
}

main().catch(err => {
    console.error('Migrácia zlyhala:', err);
    process.exit(1);
});
