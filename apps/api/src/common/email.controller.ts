import { Body, Controller, Logger, Post } from '@nestjs/common';

import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
    private readonly logger = new Logger(EmailController.name);

    constructor(private readonly emailService: EmailService) {}

    @Post('test')
    async sendTestEmail(@Body() body: { email: string }) {
        try {
            this.logger.log(`Sending test email to: ${body.email}`);
            const result = await this.emailService.sendTestEmail(body.email);
            return {
                success: true,
                message: 'Test email sent successfully',
                data: result,
            };
        } catch (error) {
            this.logger.error('Failed to send test email:', error);
            return {
                success: false,
                message: 'Failed to send test email',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    @Post('password-reset')
    async sendPasswordResetEmail(@Body() body: { email: string; resetToken: string }) {
        try {
            this.logger.log(`Sending password reset email to: ${body.email}`);
            const result = await this.emailService.sendPasswordResetEmail(body.email, body.resetToken);
            return {
                success: true,
                message: 'Password reset email sent successfully',
                data: result,
            };
        } catch (error) {
            this.logger.error('Failed to send password reset email:', error);
            return {
                success: false,
                message: 'Failed to send password reset email',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
