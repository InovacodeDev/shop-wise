import * as speakeasy from 'speakeasy';

export type TotpSecret = { ascii: string; hex: string; base32: string; otpauth_url?: string };

// Create a small typed wrapper around speakeasy to avoid unsafe-typed external calls
const speakeasyLib = speakeasy as unknown as {
    generateSecret(opts: { name?: string }): TotpSecret;
    totp: {
        verify(opts: { secret: string; encoding: 'base32' | 'ascii' | 'hex'; token: string; window?: number }): boolean;
    };
};

export function generateTotpSecret(accountName: string): TotpSecret {
    const secret = speakeasyLib.generateSecret({ name: accountName });
    return secret;
}

export function verifyTotp(token: string, base32secret: string): boolean {
    return speakeasyLib.totp.verify({ secret: base32secret, encoding: 'base32', token, window: 1 });
}
