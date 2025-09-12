import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 }); // 10 requests per minute

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RateLimitMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        const isProduction = process.env.NODE_ENV === 'production';

        if (!isProduction) {
            // Running locally / non-production: skip rate limiting to ease development and testing
            this.logger.debug('Skipping rate limiting because NODE_ENV is not "production"');
            return next();
        }

        return limiter(req, res, next);
    }
}
