declare module 'speakeasy' {
    export function generateSecret(opts: { name?: string }): {
        ascii: string;
        hex: string;
        base32: string;
        otpauth_url?: string;
    };
    export const totp: {
        verify(opts: { secret: string; encoding: 'base32' | 'ascii' | 'hex'; token: string; window?: number }): boolean;
    };
}
