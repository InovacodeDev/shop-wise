/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastify from 'fastify';

import { AppModule } from './app.module';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';

async function bootstrap() {
    // Configure Express/Proxy trust via env (kept for parity)
    const rawTrustProxy = process.env.TRUST_PROXY;
    let trustProxy: boolean | number | string = 'loopback';
    if (typeof rawTrustProxy === 'string' && rawTrustProxy.trim() !== '') {
        const v = rawTrustProxy.trim().toLowerCase();
        if (v === 'true') trustProxy = true;
        else if (v === 'false') trustProxy = false;
        else if (!Number.isNaN(Number(v))) trustProxy = Number(v);
        else trustProxy = rawTrustProxy;
    }

    // Create a Fastify instance and register plugins
    // trustProxy is typed as boolean | number | string above, so pass it directly
    const fastifyInstance = fastify({ trustProxy, logger: false });
    // Register plugins (do not await the registration call directly to avoid turning
    // fastifyInstance into a thenable). Use .register but await Promise.all of the
    // registration promises separately if needed.
    // Ensure cookie secret is set in production
    if (process.env.NODE_ENV === 'production' && !process.env.COOKIE_SECRET) {
        throw new Error('COOKIE_SECRET must be set in production');
    }
    const cookieReg = fastifyInstance.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || undefined,
    });
    const rateLimitReg = fastifyInstance.register(fastifyRateLimit, {
        max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
        timeWindow: '15 minutes',
    });
    // Wait for plugin registrations to complete before using instance
    await Promise.all([cookieReg, rateLimitReg]);

    // Create Nest app using Fastify adapter
    // Cast the fastify instance to any to avoid a TypeScript-level server/generic mismatch
    const adapter = new FastifyAdapter(fastifyInstance as unknown as any);
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

    // Body parsing and URL-encoded handling are built-in to Fastify/Nest
    // Enable CORS (restrictive by default). Configure allowed origins via CORS_ORIGINS env var.
    // If no origins are configured, disallow cross-origin requests in non-development environments.
    const rawCors = process.env.CORS_ORIGINS ?? '';
    const allowedOrigins = rawCors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const corsOptions = {
        origin: (origin: string | undefined, callback: any) => {
            // Allow non-browser requests (no origin) like curl / server-to-server
            if (!origin) return callback(null, true);
            // In development, allow localhost if no explicit origins set
            if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'development') return callback(null, true);
            const isAllowed = allowedOrigins.some((o) => {
                if (o === origin) return true;
                if (o.includes('*')) {
                    const re = new RegExp('^' + o.replace(/\*/g, '.*') + '$');
                    return re.test(origin);
                }
                return false;
            });
            return callback(isAllowed ? null : new Error('CORS not allowed'), isAllowed);
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    };

    app.enableCors(corsOptions);

    // Use global validation pipe for DTO validation and input sanitization
    // - whitelist: strip properties that do not have decorators
    // - forbidNonWhitelisted: reject requests that contain unknown properties
    // - transform: convert payloads to DTO instances and enable implicit conversion
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Register request logger interceptor globally to log controller.handler, method, path, body and headers
    app.useGlobalInterceptors(new RequestLoggerInterceptor());

    // Register Helmet for a safe set of security headers.
    // Enable a conservative Content Security Policy (CSP) by default. This CSP is intentionally
    // restrictive: it allows resources from the same origin and secure (https:) origins only,
    // blocks plugin/object usage, and permits images from data: URIs. If your front-end needs
    // additional sources (CDNs, inline scripts/styles) you can add them via the CSP_EXTRA_* env vars.
    const extraScriptSrc = (process.env.CSP_EXTRA_SCRIPT_SRC ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const extraStyleSrc = (process.env.CSP_EXTRA_STYLE_SRC ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const extraConnectSrc = (process.env.CSP_EXTRA_CONNECT_SRC ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const cspDirectives: Record<string, Array<string>> = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https:', ...extraScriptSrc],
        styleSrc: ["'self'", 'https:', ...extraStyleSrc],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', ...extraConnectSrc],
        fontSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    };

    // Register helmet with CSP. We intentionally cast plugin types to any because
    // Fastify and @fastify/helmet typings can be incompatible in our build environment.
    await fastifyInstance.register(
        fastifyHelmet as unknown as import('fastify').FastifyPluginCallback,
        {
            contentSecurityPolicy: {
                directives: cspDirectives,
            },
        } as unknown as import('fastify').FastifyRegisterOptions<Record<string, never>>,
    );

    // Prefer explicit api prefix for routing
    (app as any).setGlobalPrefix(process.env.API_PREFIX ?? 'api');

    console.log('=== Start listening');
    const port = parseInt(process.env.PORT ?? '3001', 10);
    await (app as any).listen({ port, host: '0.0.0.0' });
    console.log('=== API started on port', port);
}

void bootstrap();
