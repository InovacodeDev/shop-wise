import * as argon2 from 'argon2';

// Argon2 options: allow tuning via env for memory/cpu; keep sane defaults
const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: Number(process.env.ARGON2_MEMORY_COST ?? '4096'), // in KiB
    timeCost: Number(process.env.ARGON2_TIME_COST ?? '3'),
    parallelism: Number(process.env.ARGON2_PARALLELISM ?? '1'),
};

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        // ignore verification errors and return false
        void err;
        return false;
    }
}
