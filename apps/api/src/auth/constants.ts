export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? '7d';
// Ensure JWT secret is provided in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me';

export const PASSWORD_RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 60; // 1 hour
export const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours
