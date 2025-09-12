/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TokenMetricsService implements OnModuleInit {
    // Use `any` for external prom-client objects to avoid depending on external typings
    private registry: any;
    private lookupCounter: any;
    private lookupHitCounter: any;
    private lookupDuration: any;

    async onModuleInit(): Promise<void> {
        // Load prom-client dynamically; metrics are best-effort
        let prom: any;
        try {
            prom = await import('prom-client');
        } catch (e) {
            // prom-client not installed or failed to load; metrics disabled
            this.registry = undefined;
            this.lookupCounter = undefined;
            this.lookupHitCounter = undefined;
            this.lookupDuration = undefined;
            return;
        }

        try {
            const { Registry, collectDefaultMetrics, Counter, Histogram } = prom;
            this.registry = new Registry();
            try {
                collectDefaultMetrics({ register: this.registry });
            } catch (_ignored) {
                // ignore
            }

            this.lookupCounter = new Counter({
                name: 'token_lookup_total',
                help: 'Total number of token lookup attempts',
                registers: [this.registry],
            });

            this.lookupHitCounter = new Counter({
                name: 'token_lookup_hits_total',
                help: 'Total number of successful token lookups (hits)',
                registers: [this.registry],
            });

            this.lookupDuration = new Histogram({
                name: 'token_lookup_duration_seconds',
                help: 'Histogram of token lookup durations in seconds',
                buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
                registers: [this.registry],
            });
        } catch (_err) {
            // fallback: disable metrics
            this.registry = undefined;
            this.lookupCounter = undefined;
            this.lookupHitCounter = undefined;
            this.lookupDuration = undefined;
        }
    }

    recordLookup(durationMs: number, hit: boolean) {
        const sec = durationMs / 1000;
        try {
            if (this.lookupCounter) this.lookupCounter.inc();
            if (hit && this.lookupHitCounter) this.lookupHitCounter.inc();
            if (this.lookupDuration) this.lookupDuration.observe(sec);
        } catch (_e) {
            // ignore
        }
    }

    async metricsContent(): Promise<string> {
        if (!this.registry) return '';
        try {
            // metrics() may return string-like; coerce to string
            const m = await this.registry.metrics();
            return String(m);
        } catch (_e) {
            return '';
        }
    }
}
