import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_SECRET } from './constants';

type JwtPayload = { uid: string; email?: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    validate(payload: JwtPayload) {
        // payload contains { uid, email }
        return { uid: payload.uid, email: payload.email };
    }
}
