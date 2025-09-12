// import { MongoClient } from 'mongodb';

// import { revertTokenHashes } from './migration-utils';

// async function run() {
//     const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/shop-wise';
//     const client = new MongoClient(MONGO);
//     try {
//         await client.connect();
//         const db = client.db();
//         const restored = await revertTokenHashes(db);
//         console.log('Restored', restored, 'users from backups');
//     } finally {
//         await client.close();
//     }
// }

// if (require.main === module) {
//     run().catch((err) => {
//         console.error(err);
//         process.exit(1);
//     });
// }
