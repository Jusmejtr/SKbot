// Načítanie slash commandov a ich registrácia na Discorde.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Collection, REST, Routes } = require('discord.js');
const config = require('../config');

function loadFolder(folder) {
    const dir = path.join(__dirname, '..', folder);
    const commands = new Collection();
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
        const command = require(path.join(dir, file));
        commands.set(command.data.name, command);
    }
    return commands;
}

function loadCommands() {
    return {
        guild: loadFolder('guild_slash_commands'),
        global: loadFolder('global_slash_commands'),
    };
}

// Zaregistruje príkazy. Bez force=true to urobí len vtedy, keď sa ich definícia zmenila
// (hash sa ukladá v DB), takže bežný reštart bota nič neposiela na Discord.
async function deployCommands(commands, { force = false } = {}) {
    const db = require('./db');
    const body = {
        guild: commands.guild.map(c => c.data.toJSON()),
        global: commands.global.map(c => c.data.toJSON()),
    };
    const hash = crypto.createHash('sha256').update(JSON.stringify({ body, guildId: config.guildId })).digest('hex');
    if (!force && db.getMeta('commands_hash') === hash) {
        console.log('Slash commandy sú aktuálne, registrácia preskočená.');
        return false;
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    const guildData = await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: body.guild });
    console.log(`Zaregistrovaných ${guildData.length} serverových príkazov.`);
    const globalData = await rest.put(Routes.applicationCommands(config.clientId), { body: body.global });
    console.log(`Zaregistrovaných ${globalData.length} globálnych príkazov.`);

    db.setMeta('commands_hash', hash);
    return true;
}

module.exports = { loadCommands, deployCommands };
