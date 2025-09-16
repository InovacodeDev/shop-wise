import { FamiliesService } from '@/families/families.service';
import { FamilySchema } from '@/families/schemas/family.schema';
import { UserSchema } from '@/users/schemas/user.schema';
import { Module, NestModule, OnModuleInit, Provider } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Connection } from 'mongoose';

// RateLimitMiddleware removed - Fastify-level rate limiting is used instead
import { EmailModule } from '../common/email.module';
import { MONGO_DB } from '../mongo/mongo.constants';
import { UsersService } from '../users/users.service';
import { TokenMetricsService } from './';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from './mail.service';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';

// RateLimitMiddleware removed - Fastify-level rate limiting is used instead

const optionalProviders: Provider[] = [];
if (process.env.GOOGLE_CLIENT_ID) {
    optionalProviders.push(GoogleStrategy as Provider);
}

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Family', schema: FamilySchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        EmailModule,
    ],
    providers: [
        {
            provide: MONGO_DB,
            useFactory: (connection: Connection) => {
                if (!connection) {
                    throw new Error('Mongoose connection is not available');
                }
                return connection;
            },
            inject: [getConnectionToken()],
        },
        AuthService,
        TokenMetricsService,
        UsersService,
        JwtStrategy,
        FamiliesService,
        MailService,
        OauthService,
        ...optionalProviders,
    ],
    controllers: [AuthController, OauthController],
    exports: [AuthService, TokenMetricsService],
})
export class AuthModule implements NestModule, OnModuleInit {
    constructor(private readonly mailService: MailService) {}

    async onModuleInit() {
        try {
            await this.mailService.ensureTransporter();
        } catch (err) {
            // In production, if SMTP is configured but verification fails, throw to fail fast
            if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
                throw err;
            }
            // otherwise log silently (tests/dev may not have SMTP)
            const msg = err instanceof Error ? err.message : String(err);
            console.warn('MailService transporter verify skipped or failed:', msg);
        }
    }

    // Rate limiting for auth endpoints is handled by Fastify's @fastify/rate-limit at the HTTP server level.
    // Keep configure stub if future Nest middleware is required.
    configure() {
        // intentionally empty - Fastify-level rate limiting is used instead of Nest middleware
    }
}
