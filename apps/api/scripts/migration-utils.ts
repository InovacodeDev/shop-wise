/* eslint-disable */
import * as argon2 from 'argon2';
import { createHmac } from 'crypto';

/**
 * @param {any} db - mongodb Db instance
 */
export async function migrateTokenHashes(db: any, hmacSecret: string) {
    const users = db.collection('users');
    const backups = db.collection('users_token_migration_backups');

    const cursor = users.find({
        $or: [{ emailVerificationToken: { $exists: true } }, { passwordResetToken: { $exists: true } }],
    });
    let count = 0;
    while (await cursor.hasNext()) {
        const doc: any = await cursor.next();
        if (!doc) continue;
        const update: any = {};
        if (doc.emailVerificationToken) {
            const backupDoc = {
                originalUserId: doc._id,
                original: {
                    passwordResetToken: doc.passwordResetToken,
                    emailVerificationToken: doc.emailVerificationToken,
                },
                migratedAt: new Date(),
            };
            await backups.insertOne(backupDoc);

            const token = String(doc.emailVerificationToken);
            update.emailVerificationTokenHash = String(await argon2.hash(token));
            const hmac = createHmac('sha256', hmacSecret).update(token).digest('hex');
            update.emailVerificationTokenHmacPrefix = hmac.slice(0, 8);
        }
        if (doc.passwordResetToken) {
            const token = String(doc.passwordResetToken);
            update.passwordResetTokenHash = String(await argon2.hash(token));
            const hmac = createHmac('sha256', hmacSecret).update(token).digest('hex');
            update.passwordResetTokenHmacPrefix = hmac.slice(0, 8);
        }
        if (Object.keys(update).length > 0) {
            const set: any = {};
            const unset: any = {};
            for (const k of Object.keys(update)) {
                set[k] = update[k];
            }
            // remove legacy raw fields
            unset.passwordResetToken = '';
            unset.emailVerificationToken = '';
            await users.updateOne({ _id: doc._id }, { $set: set, $unset: unset });
            count += 1;
        }
    }
    return count;
}

/**
 * @param {any} db - mongodb Db instance
 */
export async function revertTokenHashes(db: any) {
    const users = db.collection('users');
    const backups = db.collection('users_token_migration_backups');
    const cursor = backups.find({});
    let restored = 0;
    while (await cursor.hasNext()) {
        const b: any = await cursor.next();
        if (!b || !b.originalUserId) continue;
        const orig = b.original || {};
        const set: any = {};
        const unset: any = {};
        if (orig.passwordResetToken) set.passwordResetToken = orig.passwordResetToken;
        if (orig.emailVerificationToken) set.emailVerificationToken = orig.emailVerificationToken;

        unset.passwordResetTokenHash = '';
        unset.passwordResetTokenHmacPrefix = '';
        unset.emailVerificationTokenHash = '';
        unset.emailVerificationTokenHmacPrefix = '';

        if (Object.keys(set).length === 0) continue;

        await users.updateOne({ _id: b.originalUserId }, { $set: set, $unset: unset });
        restored += 1;
    }
    return restored;
}
