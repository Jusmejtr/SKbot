// Všetky natvrdo zapísané ID a nastavenia bota na jednom mieste.
// Citlivé / serverové ID sa berú z .env.
require('dotenv').config();

module.exports = {
    clientId: '662288447276580875',
    guildId: process.env.SERVER_ID,

    roles: {
        admin: process.env.ADMIN_ROLE_ID,
        moderator: process.env.MODERATOR_ROLE_ID,
        vip: process.env.VIP_ROLE_ID,
        sbs: process.env.SBS_ROLE_ID,
        economy: '790184496208150589',
        textMute: '686618345100935381',
        voiceMute: '784018915407560745',
        skbot: '662296220328525874',
        wasia: '654364963376332841',
    },

    channels: {
        logs: process.env.LOGS_CHANNEL_ID,
        general: '472822895098200066', // sem chodia narodeniny a výročie
    },

    // /move – roomky, cez ktoré bot prehádže užívateľa
    moveRooms: ['472823396674174986', '476403298505850891', '760055283451035719', '682975722146758747', '472841212664086529', '476110496357941252', '476110732635930624'],

    // Narodeniny – bot o 10:00 (Europe/Bratislava) zablahoželá v roomke channels.general
    birthdays: [
        { name: 'ajax', userId: '202878106472546305', day: 24, month: 1 },
        { name: 'wasia', userId: '421391887698755587', day: 12, month: 1 },
        { name: 'jusmejtr', userId: '452773419105255435', day: 26, month: 8 },
        { name: 'croxy', userId: '167298450973523968', day: 7, month: 10 },
        { name: 'kiko', userId: '650053654446997525', day: 6, month: 8 },
        { name: 'richard0o', userId: '420237481536126988', day: 9, month: 4 },
        { name: 'milan', userId: '577447339036246017', day: 11, month: 3 },
        { name: 'domo', userId: '479222589294641154', day: 8, month: 12 },
        { name: 'dejvid', userId: '696293912175706142', day: 10, month: 4 },
    ],
    // Výročie SKbota na serveri (2. 1. 2020)
    anniversary: { day: 2, month: 1, year: 2020 },

    timezone: 'Europe/Bratislava',

    // Hry pre /game-updates – appId je Steam App ID
    games: [
        { code: 'dbd', name: 'Dead by Daylight', appId: 381210 },
        { code: 'ets', name: 'Euro Truck Simulator 2', appId: 227300 },
        { code: 'slapshot', name: 'Slapshot: Rebound', appId: 1173370 },
    ],

    economy: {
        dailyCooldownMs: 24 * 60 * 60 * 1000,
        dailyReward: { min: 50, max: 100 },
        dailyRewardVip: { min: 100, max: 150 },
        prices: {
            vipPerDay: 250,
            colornamePerDay: 150,
            textMutePerMinute: 50,
            voiceMutePerMinute: 500,
        },
    },
};
