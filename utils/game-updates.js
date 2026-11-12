// Kontrola nových updatov hier cez Steam News API (bez kľúča, bez rss2json).
// Odkaz vedie priamo na oznámenie na Steame.
const { EmbedBuilder } = require('discord.js');
const db = require('./db');
const config = require('../config');

const newsUrl = (appId) => `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=1&maxlength=300&feeds=steam_community_announcements`;
const headerImage = (appId) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

// Steam používa BBCode – na krátky náhľad ho odstránime
function cleanText(text = '') {
    return text
        .replace(/\{STEAM_CLAN_IMAGE\}[^\s]*/g, '')
        .replace(/\[\/?[a-z0-9*]+(=[^\]]*)?\]/gi, ' ')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function fetchLatestNews(game) {
    const res = await fetch(newsUrl(game.appId), { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Steam API ${res.status}`);
    const data = await res.json();
    return data?.appnews?.newsitems?.[0] ?? null;
}

function buildEmbed(game, item) {
    const url = `https://store.steampowered.com/news/app/${game.appId}/view/${item.gid}`;
    const nahlad = cleanText(item.contents);
    return new EmbedBuilder()
        .setAuthor({ name: `${game.name} update` })
        .setTitle(item.title.slice(0, 256))
        .setURL(url)
        .setDescription(`${nahlad ? nahlad.slice(0, 280) + '…\n\n' : ''}[Celý update na Steame](${url})`)
        .setImage(headerImage(game.appId))
        .setColor('#f5dd07')
        .setTimestamp(item.date ? item.date * 1000 : Date.now());
}

async function checkGameUpdates(bot) {
    for (const game of config.games) {
        try {
            const item = await fetchLatestNews(game);
            if (!item) continue;

            const posledny = db.getLastGameUpdate(game.code);
            if (posledny === String(item.gid)) continue;
            db.setLastGameUpdate(game.code, item.gid);
            // pri úplne prvom spustení si len zapamätáme posledný update, aby bot nespamoval starými novinkami
            if (posledny === null) continue;

            const embed = buildEmbed(game, item);
            for (const { guild_id, channel_id } of db.getGameChannelsForGame(game.code)) {
                const channel = bot.guilds.cache.get(guild_id)?.channels.cache.get(channel_id);
                if (channel) await channel.send({ embeds: [embed] }).catch(err => console.error(`Game update do ${guild_id}/${channel_id} zlyhal:`, err.message));
            }
        } catch (err) {
            console.error(`Kontrola updatov ${game.name} zlyhala:`, err.message);
        }
    }
}

module.exports = { checkGameUpdates, fetchLatestNews, buildEmbed };
