import { Request } from 'express';

export interface AuthenticatedUser {
    uid: string;
    email?: string;
    [k: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
