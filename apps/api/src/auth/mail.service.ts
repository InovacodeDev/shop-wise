import { Injectable } from '@nestjs/common';
import { EmailService } from '../common/email.service';

@Injectable()
export class MailService {
    constructor(private emailService: EmailService) {}

    async sendPasswordResetEmail(email: string, resetToken: string, resetUrl?: string) {
        return this.emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
    }

    async sendEmailVerification(email: string, verificationToken: string, verificationUrl?: string) {
        return this.emailService.sendEmailVerification(email, verificationToken, verificationUrl);
    }

    async sendTestEmail(email: string) {
        return this.emailService.sendTestEmail(email);
    }

    // Legacy method for backward compatibility
    async sendMail(opts: any) {
        return this.emailService.sendEmail({
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
            text: opts.text,
            from: opts.from,
        });
    }

    async ensureTransporter(): Promise<boolean> {
        // Resend doesn't need transporter verification
        return true;
    }
}
