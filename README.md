
# SK bot

My project, which I created during high school in my free time for my Discord server.

The Discord bot was made with JavaScript on Node.js.

Bot currently running on discord.js v14. All commands are slash commands (no more `*` prefix).

Functions:

- economy system
- game updates (Steam news)
- mod functions (kick/ban)
- play music

# How to run

Requires **Node.js 22.13 or newer** (uses the built-in `node:sqlite` database).

1. Run `npm install` to install all dependencies.
2. Rename `.env.example` to `.env` and edit all fields.
3. Edit `config.js` (role / channel IDs, birthdays, game list, prices).
4. Start bot with `npm start`. Slash commands are registered automatically when they change (`npm run deploy` forces it).

Data are stored in `data/skbot.db` (SQLite). Back up this one file.

## Migrating from Firestore (one time)

1. Put your `serviceAccount.json` into the project root.
2. Run `npm run migrate` (while `firebase-admin` is still installed).
3. Uninstall the old dependencies: `npm uninstall firebase firebase-admin node-fetch`
4. Delete `serviceAccount.json` and the migration script if you want.
