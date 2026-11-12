// Kontrola vypršaných nákupov (VIP, farebné meno) a mute – volá sa každú minútu a pri štarte.
// Keďže všetko je v DB, nič sa nestratí pri reštarte bota.
const db = require('./db');
const config = require('../config');

async function fetchMember(guild, userId) {
    return guild.members.cache.get(userId) ?? await guild.members.fetch(userId).catch(() => null);
}

async function checkPurchases(bot) {
    const guild = bot.guilds.cache.get(config.guildId);
    if (!guild) return;

    for (const p of db.getExpiredPurchases()) {
        try {
            if (p.type === 'vip') {
                const member = await fetchMember(guild, p.user_id);
                if (member) await member.roles.remove(config.roles.vip);
            } else if (p.type === 'colorname') {
                const rola = (p.role_id && guild.roles.cache.get(p.role_id)) ?? guild.roles.cache.find(r => r.name === p.user_id);
                if (rola) await rola.delete('Vypršalo farebné meno');
            }
            db.deletePurchase(p.user_id, p.type);
        } catch (err) {
            console.error(`Nepodarilo sa ukončiť nákup ${p.type} pre ${p.user_id}:`, err);
        }
    }
}

async function checkMutes(bot) {
    for (const m of db.getExpiredMutes()) {
        const guild = bot.guilds.cache.get(m.guild_id);
        if (!guild) { db.deleteMute(m.guild_id, m.user_id, m.type); continue; }
        try {
            const member = await fetchMember(guild, m.user_id);
            if (!member) { db.deleteMute(m.guild_id, m.user_id, m.type); continue; }

            if (m.type === 'text') {
                await member.roles.remove(config.roles.textMute);
                db.deleteMute(m.guild_id, m.user_id, m.type);
            } else {
                await member.roles.remove(config.roles.voiceMute).catch(() => {});
                // server-mute sa dá zrušiť len keď je vo voice; inak ho zrušíme, keď sa pripojí (voiceStateUpdate)
                if (member.voice.channel) {
                    await member.voice.setMute(false);
                    db.deleteMute(m.guild_id, m.user_id, m.type);
                }
            }
        } catch (err) {
            console.error(`Nepodarilo sa zrušiť ${m.type}-mute pre ${m.user_id}:`, err);
        }
    }
}

// Užívateľ sa pripojil do voice a jeho voice-mute už vypršal -> odmutni ho
async function onVoiceStateUpdate(oldState, newState) {
    if (!newState.channel || !newState.serverMute) return;
    const mute = db.getMute(newState.guild.id, newState.id, 'voice');
    if (!mute || mute.expires_at > Date.now()) return;
    await newState.setMute(false).catch(console.error);
    db.deleteMute(newState.guild.id, newState.id, 'voice');
}

async function runExpirations(bot) {
    await checkPurchases(bot).catch(console.error);
    await checkMutes(bot).catch(console.error);
}

module.exports = { runExpirations, onVoiceStateUpdate };
