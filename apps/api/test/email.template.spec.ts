import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';

import { EmailService } from '../src/common/email.service';

// typed accessor for renderTemplate
interface Renderer {
    renderTemplate(name: string, vars?: Record<string, unknown>): string;
}

describe('Email template rendering', () => {
    const configService = new ConfigService({
        RESEND_API_KEY: 'test',
        FRONTEND_URL: 'http://localhost:3000',
    }) as unknown as ConfigService;
    const emailService = new EmailService(configService);

    it('renders password-reset template with placeholders replaced', () => {
        const tplPath = join(__dirname, '../src/common/email-templates/password-reset.html');
        const raw = readFileSync(tplPath, 'utf8');
        // ensure template contains placeholders we expect
        expect(raw).toContain('{{resetLink}}');

        // call renderTemplate via typed interface
        const rendered = (emailService as unknown as Renderer).renderTemplate('password-reset', {
            resetLink: 'http://example.com/reset',
            validity: '1 hour',
        });
        expect(rendered).toContain('http://example.com/reset');
        expect(rendered).not.toContain('{{resetLink}}');
    });
});
