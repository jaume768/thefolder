/**
 * fix-self-follows.js
 * Elimina auto-seguidos: usuarios que aparecen en su propio following/followers.
 * Uso: node scripts/fix-self-follows.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function fixSelfFollows() {
    await connectDB();

    const users = await User.find({
        $or: [
            { $expr: { $in: ['$_id', '$following'] } },
            { $expr: { $in: ['$_id', '$followers'] } }
        ]
    });

    if (users.length === 0) {
        console.log('No se encontraron auto-seguidos. Base de datos limpia.');
        process.exit(0);
    }

    console.log(`Encontrados ${users.length} usuarios con auto-seguido. Limpiando...`);

    for (const user of users) {
        const idStr = user._id.toString();

        const hadSelfFollowing = user.following.some(f => f.toString() === idStr);
        const hadSelfFollower  = user.followers.some(f => f.toString() === idStr);

        await User.findByIdAndUpdate(user._id, {
            $pull: {
                following: user._id,
                followers: user._id
            }
        });

        console.log(`  - ${user.username}: following=${hadSelfFollowing}, followers=${hadSelfFollower} → eliminados`);
    }

    console.log('Listo.');
    process.exit(0);
}

fixSelfFollows().catch(err => {
    console.error(err);
    process.exit(1);
});
