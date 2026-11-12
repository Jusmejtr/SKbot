// Ručná registrácia slash commandov:  npm run deploy
// (bot to robí aj sám pri štarte, keď zistí zmenu príkazov)
require('dotenv').config();
const { loadCommands, deployCommands } = require('./utils/commands');

deployCommands(loadCommands(), { force: true })
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
