import * as jwt from 'jsonwebtoken';

import { JWT_EXPIRATION, JWT_SECRET } from './constants';

export type JwtPayload = { uid: string; email?: string } & Record<string, unknown>;

export function signJwt(payload: JwtPayload): string {
    const secret = JWT_SECRET as unknown as jwt.Secret;
    const options = { expiresIn: JWT_EXPIRATION } as jwt.SignOptions;
    return jwt.sign(payload as jwt.JwtPayload, secret, options);
}

export function verifyJwt(token: string): JwtPayload {
    const secret = JWT_SECRET as unknown as jwt.Secret;
    return jwt.verify(token, secret) as JwtPayload;
}
