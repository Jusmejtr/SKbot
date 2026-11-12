// SQLite databáza bota (vstavaný node:sqlite, Node >= 22.13).
// Všetky funkcie sú synchrónne, takže kontrola zostatku a zápis prebehnú naraz
// a nedá sa nič zduplikovať rýchlym spamovaním príkazov.
// node:sqlite pri štarte vypisuje ExperimentalWarning – túto jednu hlášku potlačíme
const originalEmitWarning = process.emitWarning;
process.emitWarning = function (warning, ...args) {
    if (String(warning?.message ?? warning).includes('SQLite')) return;
    return originalEmitWarning.call(process, warning, ...args);
};
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'skbot.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS accounts (
        user_id    TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        money      INTEGER NOT NULL DEFAULT 0,
        daily_at   INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gamble_stats (
        user_id     TEXT PRIMARY KEY,
        wins        INTEGER NOT NULL DEFAULT 0,
        losses      INTEGER NOT NULL DEFAULT 0,
        total_bet   INTEGER NOT NULL DEFAULT 0,
        total_won   INTEGER NOT NULL DEFAULT 0,
        total_lost  INTEGER NOT NULL DEFAULT 0,
        total_given INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS purchases (
        user_id    TEXT NOT NULL,
        type       TEXT NOT NULL CHECK (type IN ('vip', 'colorname')),
        role_id    TEXT,
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, type)
    );
    CREATE TABLE IF NOT EXISTS mutes (
        guild_id   TEXT NOT NULL,
        user_id    TEXT NOT NULL,
        type       TEXT NOT NULL CHECK (type IN ('text', 'voice')),
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (guild_id, user_id, type)
    );
    CREATE TABLE IF NOT EXISTS jackpot_bets (
        user_id TEXT PRIMARY KEY,
        amount  INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS game_update_channels (
        guild_id   TEXT NOT NULL,
        game       TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        PRIMARY KEY (guild_id, game)
    );
    CREATE TABLE IF NOT EXISTS game_update_state (
        game     TEXT PRIMARY KEY,
        last_gid TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
        key   TEXT PRIMARY KEY,
        value TEXT
    );
`);

// Spustí fn v transakcii – buď prebehne celá, alebo nič
function tx(fn) {
    db.exec('BEGIN IMMEDIATE');
    try {
        const result = fn();
        db.exec('COMMIT');
        return result;
    } catch (err) {
        db.exec('ROLLBACK');
        throw err;
    }
}

const q = (sql) => db.prepare(sql);

// ---------- účty ----------

function getAccount(userId) {
    return q('SELECT * FROM accounts WHERE user_id = ?').get(userId);
}

// true = vytvorený, false = už existoval
function createAccount(userId, name) {
    return tx(() => {
        const r = q('INSERT OR IGNORE INTO accounts (user_id, name, created_at) VALUES (?, ?, ?)').run(userId, name, Date.now());
        if (r.changes === 0) return false;
        q('INSERT OR IGNORE INTO gamble_stats (user_id) VALUES (?)').run(userId);
        return true;
    });
}

function updateName(userId, name) {
    q('UPDATE accounts SET name = ? WHERE user_id = ? AND name != ?').run(name, userId, name);
}

function getMoney(userId) {
    return getAccount(userId)?.money ?? null;
}

// true = pripísané, false = užívateľ nemá účet
function addMoney(userId, amount) {
    return q('UPDATE accounts SET money = money + ? WHERE user_id = ?').run(amount, userId).changes > 0;
}

// Strhne coiny len ak ich má dosť. Vráti 'ok' | 'no_account' | 'insufficient'
function takeMoney(userId, amount) {
    const r = q('UPDATE accounts SET money = money - ? WHERE user_id = ? AND money >= ?').run(amount, userId, amount);
    if (r.changes > 0) return 'ok';
    return getAccount(userId) ? 'insufficient' : 'no_account';
}

// Pre admina – odoberie najviac toľko, koľko užívateľ má (nikdy nejde do mínusu)
function adminRemoveMoney(userId, amount) {
    const r = q('UPDATE accounts SET money = MAX(0, money - ?) WHERE user_id = ?').run(amount, userId);
    return r.changes > 0;
}

// Vráti 'ok' | 'no_account' | 'target_no_account' | 'insufficient'
function transfer(fromId, toId, amount) {
    return tx(() => {
        if (!getAccount(toId)) return 'target_no_account';
        const r = takeMoney(fromId, amount);
        if (r !== 'ok') return r;
        addMoney(toId, amount);
        q('INSERT INTO gamble_stats (user_id, total_given) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET total_given = total_given + excluded.total_given').run(fromId, amount);
        return 'ok';
    });
}

function getTop(limit) {
    return q('SELECT user_id, name, money FROM accounts ORDER BY money DESC LIMIT ?').all(limit);
}

// Vráti { status: 'no_account' } | { status: 'cooldown', remainingMs } | { status: 'ok', reward, money }
function claimDaily(userId, reward, cooldownMs) {
    return tx(() => {
        const acc = getAccount(userId);
        if (!acc) return { status: 'no_account' };
        const remainingMs = cooldownMs - (Date.now() - acc.daily_at);
        if (remainingMs > 0) return { status: 'cooldown', remainingMs };
        q('UPDATE accounts SET money = money + ?, daily_at = ? WHERE user_id = ?').run(reward, Date.now(), userId);
        return { status: 'ok', reward, money: acc.money + reward };
    });
}

// ---------- gamble štatistiky ----------

function getStats(userId) {
    return q('SELECT * FROM gamble_stats WHERE user_id = ?').get(userId);
}

// bet = vsadená suma, won = výhra?, profit = čistý zisk pri výhre
function recordGamble(userId, bet, won, profit = bet) {
    q(`INSERT INTO gamble_stats (user_id) VALUES (?) ON CONFLICT(user_id) DO NOTHING`).run(userId);
    if (won) {
        q('UPDATE gamble_stats SET wins = wins + 1, total_bet = total_bet + ?, total_won = total_won + ? WHERE user_id = ?').run(bet, profit, userId);
    } else {
        q('UPDATE gamble_stats SET losses = losses + 1, total_bet = total_bet + ?, total_lost = total_lost + ? WHERE user_id = ?').run(bet, bet, userId);
    }
}

// ---------- nákupy (VIP, farebné meno) ----------

function setPurchase(userId, type, roleId, expiresAt) {
    q('INSERT OR REPLACE INTO purchases (user_id, type, role_id, expires_at) VALUES (?, ?, ?, ?)').run(userId, type, roleId, expiresAt);
}
function getPurchase(userId, type) {
    return q('SELECT * FROM purchases WHERE user_id = ? AND type = ?').get(userId, type);
}
function deletePurchase(userId, type) {
    q('DELETE FROM purchases WHERE user_id = ? AND type = ?').run(userId, type);
}
function getExpiredPurchases(now = Date.now()) {
    return q('SELECT * FROM purchases WHERE expires_at < ?').all(now);
}

// ---------- mute ----------

function addMute(guildId, userId, type, expiresAt) {
    q('INSERT OR REPLACE INTO mutes (guild_id, user_id, type, expires_at) VALUES (?, ?, ?, ?)').run(guildId, userId, type, expiresAt);
}
function getMute(guildId, userId, type) {
    return q('SELECT * FROM mutes WHERE guild_id = ? AND user_id = ? AND type = ?').get(guildId, userId, type);
}
function deleteMute(guildId, userId, type) {
    q('DELETE FROM mutes WHERE guild_id = ? AND user_id = ? AND type = ?').run(guildId, userId, type);
}
function getExpiredMutes(now = Date.now()) {
    return q('SELECT * FROM mutes WHERE expires_at < ?').all(now);
}

// ---------- jackpot (stávky sa ukladajú, aby sa po páde bota dali vrátiť) ----------

function addJackpotBet(userId, amount) {
    q('INSERT INTO jackpot_bets (user_id, amount) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET amount = amount + excluded.amount').run(userId, amount);
}
function clearJackpotBets() {
    q('DELETE FROM jackpot_bets').run();
}
// Vráti všetky rozbehnuté stávky späť hráčom (volá sa pri štarte bota)
function refundJackpotBets() {
    return tx(() => {
        const bets = q('SELECT * FROM jackpot_bets').all();
        for (const b of bets) addMoney(b.user_id, b.amount);
        clearJackpotBets();
        return bets;
    });
}

// ---------- game updates ----------

function setGameChannel(guildId, game, channelId) {
    q('INSERT OR REPLACE INTO game_update_channels (guild_id, game, channel_id) VALUES (?, ?, ?)').run(guildId, game, channelId);
}
function removeGameChannel(guildId, game) {
    return q('DELETE FROM game_update_channels WHERE guild_id = ? AND game = ?').run(guildId, game).changes > 0;
}
function getGameChannelsForGuild(guildId) {
    return q('SELECT * FROM game_update_channels WHERE guild_id = ?').all(guildId);
}
function getGameChannelsForGame(game) {
    return q('SELECT * FROM game_update_channels WHERE game = ?').all(game);
}
function getLastGameUpdate(game) {
    return q('SELECT last_gid FROM game_update_state WHERE game = ?').get(game)?.last_gid ?? null;
}
function setLastGameUpdate(game, gid) {
    q('INSERT OR REPLACE INTO game_update_state (game, last_gid) VALUES (?, ?)').run(game, String(gid));
}

// ---------- meta ----------

function getMeta(key) {
    return q('SELECT value FROM meta WHERE key = ?').get(key)?.value ?? null;
}
function setMeta(key, value) {
    q('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(key, value);
}

module.exports = {
    raw: db, tx, DB_PATH,
    getAccount, createAccount, updateName, getMoney, addMoney, takeMoney, adminRemoveMoney, transfer, getTop, claimDaily,
    getStats, recordGamble,
    setPurchase, getPurchase, deletePurchase, getExpiredPurchases,
    addMute, getMute, deleteMute, getExpiredMutes,
    addJackpotBet, clearJackpotBets, refundJackpotBets,
    setGameChannel, removeGameChannel, getGameChannelsForGuild, getGameChannelsForGame, getLastGameUpdate, setLastGameUpdate,
    getMeta, setMeta,
};
