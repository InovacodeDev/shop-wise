import { ConfigService } from '@nestjs/config';

import { EmailService } from '../src/common/email.service';

// Small interface to access the private renderTemplate in a type-safe way for tests
interface Renderer {
    renderTemplate(name: string, vars?: Record<string, unknown>): string;
}

describe('EmailService renderer (handlebars)', () => {
    it('renders template with handlebars placeholders', () => {
        const config = new ConfigService({
            RESEND_API_KEY: 'test',
            FRONTEND_URL: 'https://example.com',
        }) as unknown as ConfigService;
        const svc = new EmailService(config);
        const rendered = (svc as unknown as Renderer).renderTemplate('test-email', { dateTime: '2025-09-13 12:00' });
        expect(rendered).toContain('2025-09-13 12:00');
    });
});
