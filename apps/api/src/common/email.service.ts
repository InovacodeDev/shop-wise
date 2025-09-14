import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, readdirSync } from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;
    // allow injecting a mock resend client for tests
    setResendClient(client: Resend) {
        this.resend = client;
    }

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        this.resend = new Resend(apiKey);

        // Register partials from email-templates/partials
        try {
            const partialsDir = join(__dirname, 'email-templates', 'partials');
            const files = readdirSync(partialsDir);
            for (const f of files) {
                const p = join(partialsDir, f);
                const name = f.replace(/\.hbs?$/, '');
                const raw = readFileSync(p, 'utf8');
                Handlebars.registerPartial(name, raw);
            }

            // Register a few helpers
            Handlebars.registerHelper('year', () => new Date().getFullYear());
            Handlebars.registerHelper('companyUrl', () =>
                this.configService.get<string>('FRONTEND_URL', 'https://shopwise.example'),
            );
        } catch (err) {
            // non-fatal; partial registration is best-effort
            console.warn('Could not register email partials/helpers', err);
        }
    }

    async sendEmail(options: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        from?: string;
        replyTo?: string;
        attachments?: Array<{
            filename: string;
            content: string | Buffer;
            contentType?: string;
        }>;
        tags?: Array<{ name: string; value: string }>;
        headers?: Record<string, string>;
        idempotencyKey?: string;
        scheduledAt?: string;
    }) {
        try {
            const from = options.from || this.configService.get<string>('EMAIL_FROM', '');

            const emailData = {
                from,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: options.html,
                text: options.text || '',
                reply_to: options.replyTo,
                attachments: options.attachments?.map((attachment) => ({
                    filename: attachment.filename,
                    content: attachment.content,
                    type: attachment.contentType,
                })),
                tags: options.tags,
                headers: options.headers,
            };

            const result = await this.resend.emails.send(emailData);

            if (result.error) {
                const errorMessage = result.error?.message || JSON.stringify(result.error) || 'Unknown error';
                throw new Error(`Resend API error: ${errorMessage}`);
            }

            return result.data;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }

    // Password reset email
    async sendPasswordResetEmail(email: string, resetToken: string, resetUrl?: string) {
        const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
        const resetLink = resetUrl || `${baseUrl}/reset-password?token=${resetToken}`;
        const html = this.renderTemplate('password-reset', { resetLink, validity: '1 hour' });
        const text = `Redefinir Senha - ShopWise\n\nAcesse o link abaixo para criar uma nova senha:\n${resetLink}\n\nEste link é válido por 1 hour.`;

        return this.sendEmail({ to: email, subject: 'Redefinir Senha - ShopWise', html, text });
    }

    // Email verification
    async sendEmailVerification(email: string, verificationToken: string, verificationUrl?: string) {
        const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
        const verificationLink = verificationUrl || `${baseUrl}/verify-email?token=${verificationToken}`;

        const html = this.renderTemplate('email-verification', { verificationLink, validity: '24 hours' });
        const text = `Bem-vindo ao ShopWise!\n\nAcesse: ${verificationLink} (válido por 24 hours)`;
        return this.sendEmail({ to: email, subject: 'Verificar Email - ShopWise', html, text });
    }

    // Plan purchase confirmation
    async sendPlanPurchaseConfirmation(
        email: string,
        planDetails: {
            planName: string;
            amount: number;
            currency: string;
            features: string[];
            billingCycle: string;
        },
    ) {
        const featuresHtml = `<ul>${planDetails.features.map((f) => `<li>${f}</li>`).join('')}</ul>`;
        const html = this.renderTemplate('plan-purchase-confirmation', {
            planName: planDetails.planName,
            amount: String(planDetails.amount),
            currency: planDetails.currency,
            billingCycle: planDetails.billingCycle,
            features: featuresHtml,
        });
        const text = `Compra Confirmada!\nPlano: ${planDetails.planName}\nValor: ${planDetails.currency} ${planDetails.amount}\nCiclo: ${planDetails.billingCycle}`;
        return this.sendEmail({ to: email, subject: 'Confirmação de Compra - ShopWise', html, text });
    }

    // Data deletion warning
    async sendDataDeletionWarning(email: string, userName: string, deletionDate: Date) {
        const formattedDate = deletionDate.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const html = this.renderTemplate('data-deletion-warning', { userName, deletionDate: formattedDate });
        const text = `Aviso: Seus dados serão excluídos em ${formattedDate}`;
        return this.sendEmail({ to: email, subject: 'Aviso Importante: Exclusão de Dados - ShopWise', html, text });
    }

    // Account deletion confirmation
    async sendAccountDeletionConfirmation(email: string, userName: string) {
        const html = this.renderTemplate('account-deletion-confirmation', { userName });
        const text = `Conta Excluída - ShopWise\nOlá ${userName}, sua conta foi excluída.`;
        return this.sendEmail({ to: email, subject: 'Conta Excluída - ShopWise', html, text });
    }

    // Test email for configuration verification
    async sendTestEmail(email: string) {
        const dateTime = new Date().toLocaleString('pt-BR');
        const html = this.renderTemplate('test-email', { dateTime });
        const text = `Teste de Email - ShopWise\nData/Hora: ${dateTime}`;
        return this.sendEmail({ to: email, subject: 'Teste de Email - ShopWise', html, text });
    }

    /**
     * Load and render a template from disk. Very small placeholder replacement: {{key}}
     */
    private renderTemplate(name: string, vars: Record<string, unknown> = {}) {
        // Prefer .hbs templates, fall back to .html if needed
        const baseDir = join(__dirname, 'email-templates');
        const tryPaths = [join(baseDir, `${name}.hbs`), join(baseDir, `${name}.html`)];
        for (const tplPath of tryPaths) {
            try {
                const raw = readFileSync(tplPath, 'utf8');
                const template = Handlebars.compile(raw);
                return template(vars);
            } catch {
                // try next
                continue;
            }
        }

        console.warn('Could not render template', name);
        return '';
    }
}
