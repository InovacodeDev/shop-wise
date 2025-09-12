// import { MongoClient } from 'mongodb';

// import { migrateTokenHashes } from './migration-utils';

// async function run() {
//     const url = process.env.MONGO_URL || 'mongodb://localhost:27017/shop-wise';
//     const client = new MongoClient(url);
//     await client.connect();
//     const db = client.db();

//     const hmacSecret = process.env.TOKEN_HMAC_SECRET || process.env.JWT_SECRET || 'dev-secret';

//     const count = await migrateTokenHashes(db, hmacSecret);
//     console.log('Migrated', count, 'users');
//     await client.close();
// }

// run().catch((err) => {
//     console.error(err);
//     process.exit(1);
// });
