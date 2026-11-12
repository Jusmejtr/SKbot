// Pomocné funkcie pre slash commandy

// Odpovie na interakciu bez ohľadu na to, či už bola odložená (deferReply) alebo zodpovedaná.
function respond(interaction, payload) {
    if (interaction.replied) return interaction.followUp(payload);
    if (interaction.deferred) return interaction.editReply(payload);
    return interaction.reply(payload);
}

// Má člen aspoň jednu z rolí? (prázdne/undefined ID sa ignorujú)
function hasAnyRole(member, ...roleIds) {
    return roleIds.filter(Boolean).some(id => member.roles.cache.has(id));
}

// Pošle správu do logs roomky, ak existuje
function sendLog(client, text) {
    const channel = client.channels.cache.get(require('../config').channels.logs);
    if (channel) channel.send(text).catch(console.error);
}

module.exports = { respond, hasAnyRole, sendLog };
