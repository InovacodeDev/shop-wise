import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { EmailService } from '../src/common/email.service';

describe('EmailService sendEmail (mock Resend)', () => {
    it('calls resend.emails.send with compiled html', async () => {
        const config = new ConfigService({
            RESEND_API_KEY: 'test',
            EMAIL_FROM: 'noreply@example.com',
        }) as unknown as ConfigService;
        const svc = new EmailService(config);

        // create a mock resend client with typed shapes to avoid unsafe-any
        const sent: Array<Record<string, unknown>> = [];
        const mockResend = {
            emails: {
                // no need for `async` here (no await inside)
                send: (data: Record<string, unknown>) => {
                    sent.push(data);
                    return Promise.resolve({ data: { id: 'mock-id' } });
                },
            },
        } as unknown as Resend;

        // inject mock (setResendClient exists on EmailService)
        svc.setResendClient(mockResend);

        const result = await svc.sendTestEmail('user@example.com');
        expect(result).toBeDefined();
        expect(sent.length).toBe(1);
        const payload = sent[0] as {
            to: string[] | string;
            subject?: string;
            html?: string;
        };

        // normalize `to` to an array for the assertion
        const recipients = Array.isArray(payload.to) ? payload.to : [String(payload.to)];
        expect(recipients).toContain('user@example.com');
        expect(payload.subject).toBeDefined();
        expect(payload.subject).toContain('Teste de Email');
        expect(payload.html).toBeDefined();
    });
});
