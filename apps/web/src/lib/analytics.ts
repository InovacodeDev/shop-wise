import { track } from '@vercel/analytics';

type AllowedPropertyValues = string | number | boolean | null;

// Configuration for Vercel Analytics
export const analyticsConfig = {
    // Event filtering - events to ignore
    filteredEvents: [
        'pageview', // Default pageview events are handled automatically
    ],

    // Sensitive data patterns to redact
    sensitivePatterns: [
        /password/i,
        /token/i,
        /key/i,
        /secret/i,
        /auth/i,
        /session/i,
        /cookie/i,
        /credit.?card/i,
        /cnpj/i,
        /cpf/i,
        /rg/i,
        /phone/i,
        /email/i,
        /address/i,
        /zip.?code/i,
        /postal.?code/i,
    ],

    // Custom event tracking functions
    trackUserAction: (action: string, properties?: Record<string, AllowedPropertyValues>) => {
        track(action, {
            ...properties,
            timestamp: new Date().toISOString(),
        });
    },

    trackNavigation: (from: string, to: string, properties?: Record<string, AllowedPropertyValues>) => {
        track('navigation', {
            from,
            to,
            ...properties,
        });
    },

    trackError: (error: Error, context?: Record<string, AllowedPropertyValues>) => {
        const errorData: Record<string, AllowedPropertyValues> = {
            message: error.message,
            ...context,
        };
        if (error.stack) {
            errorData.stack = error.stack.substring(0, 500);
        }
        track('error', errorData);
    },

    trackPurchase: (type: 'manual' | 'nfce' | 'import', properties: Record<string, AllowedPropertyValues>) => {
        track('purchase_created', {
            type,
            ...properties,
        });
    },

    // Redact sensitive data from objects
    redactSensitiveData: (data: any): any => {
        if (typeof data === 'string') {
            let redacted = data;
            analyticsConfig.sensitivePatterns.forEach((pattern) => {
                redacted = redacted.replace(pattern, '[REDACTED]');
            });
            return redacted;
        }

        if (Array.isArray(data)) {
            return data.map((item) => analyticsConfig.redactSensitiveData(item));
        }

        if (typeof data === 'object' && data !== null) {
            const redacted: any = {};
            for (const [key, value] of Object.entries(data)) {
                const isSensitive = analyticsConfig.sensitivePatterns.some((pattern) => pattern.test(key));
                redacted[key] = isSensitive ? '[REDACTED]' : analyticsConfig.redactSensitiveData(value);
            }
            return redacted;
        }

        return data;
    },
};

// Export track function with redaction
export const safeTrack = (event: string, properties?: Record<string, AllowedPropertyValues>) => {
    const redactedProperties = properties ? analyticsConfig.redactSensitiveData(properties) : undefined;
    track(event, redactedProperties);
};
