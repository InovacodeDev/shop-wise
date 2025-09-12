import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        this.resend = new Resend(apiKey);
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
            const from = options.from || this.configService.get<string>('EMAIL_FROM', 'noreply@shopwise.com');

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
                throw new Error(`Resend API error: ${result.error.message}`);
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

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Redefinir Senha - ShopWise</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2563eb;">Redefinir Senha</h1>
                        <p>Olá,</p>
                        <p>Recebemos uma solicitação para redefinir sua senha no ShopWise.</p>
                        <p>Clique no botão abaixo para criar uma nova senha:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Redefinir Senha
                            </a>
                        </div>
                        <p>Este link é válido por 1 hora.</p>
                        <p>Se você não solicitou esta redefinição, ignore este email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #666;">
                            ShopWise - Gerencie suas compras de forma inteligente
                        </p>
                    </div>
                </body>
            </html>
        `;

        const text = `
            Redefinir Senha - ShopWise

            Olá,

            Recebemos uma solicitação para redefinir sua senha no ShopWise.

            Acesse o link abaixo para criar uma nova senha:
            ${resetLink}

            Este link é válido por 1 hora.

            Se você não solicitou esta redefinição, ignore este email.

            ShopWise - Gerencie suas compras de forma inteligente
        `;

        return this.sendEmail({
            to: email,
            subject: 'Redefinir Senha - ShopWise',
            html,
            text,
        });
    }

    // Email verification
    async sendEmailVerification(email: string, verificationToken: string, verificationUrl?: string) {
        const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
        const verificationLink = verificationUrl || `${baseUrl}/verify-email?token=${verificationToken}`;

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Verificar Email - ShopWise</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2563eb;">Bem-vindo ao ShopWise!</h1>
                        <p>Olá,</p>
                        <p>Obrigado por se cadastrar no ShopWise. Para completar seu registro, clique no botão abaixo para verificar seu email:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verificar Email
                            </a>
                        </div>
                        <p>Este link é válido por 24 horas.</p>
                        <p>Se você não se cadastrou no ShopWise, ignore este email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #666;">
                            ShopWise - Gerencie suas compras de forma inteligente
                        </p>
                    </div>
                </body>
            </html>
        `;

        const text = `
            Bem-vindo ao ShopWise!

            Olá,

            Obrigado por se cadastrar no ShopWise. Para completar seu registro, acesse o link abaixo para verificar seu email:
            ${verificationLink}

            Este link é válido por 24 horas.

            Se você não se cadastrou no ShopWise, ignore este email.

            ShopWise - Gerencie suas compras de forma inteligente
        `;

        return this.sendEmail({
            to: email,
            subject: 'Verificar Email - ShopWise',
            html,
            text,
        });
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
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Confirmação de Compra - ShopWise</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2563eb;">Compra Confirmada!</h1>
                        <p>Olá,</p>
                        <p>Sua compra foi processada com sucesso. Aqui estão os detalhes:</p>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">${planDetails.planName}</h3>
                            <p><strong>Valor:</strong> ${planDetails.currency} ${planDetails.amount}</p>
                            <p><strong>Ciclo de cobrança:</strong> ${planDetails.billingCycle}</p>

                            <h4>Recursos inclusos:</h4>
                            <ul>
                                ${planDetails.features.map((feature) => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>

                        <p>Obrigado por escolher o ShopWise Pro! Agora você tem acesso a todos os recursos premium.</p>
                        <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #666;">
                            ShopWise - Gerencie suas compras de forma inteligente
                        </p>
                    </div>
                </body>
            </html>
        `;

        const text = `
            Compra Confirmada!

            Olá,

            Sua compra foi processada com sucesso. Aqui estão os detalhes:

            Plano: ${planDetails.planName}
            Valor: ${planDetails.currency} ${planDetails.amount}
            Ciclo de cobrança: ${planDetails.billingCycle}

            Recursos inclusos:
            ${planDetails.features.map((feature) => `- ${feature}`).join('\n')}

            Obrigado por escolher o ShopWise Pro! Agora você tem acesso a todos os recursos premium.

            Se você tiver alguma dúvida, não hesite em nos contatar.

            ShopWise - Gerencie suas compras de forma inteligente
        `;

        return this.sendEmail({
            to: email,
            subject: 'Confirmação de Compra - ShopWise',
            html,
            text,
        });
    }

    // Data deletion warning
    async sendDataDeletionWarning(email: string, userName: string, deletionDate: Date) {
        const formattedDate = deletionDate.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Aviso de Exclusão de Dados - ShopWise</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #dc2626;">Aviso Importante: Exclusão de Dados</h1>
                        <p>Olá ${userName},</p>
                        <p>Este é um aviso importante sobre a exclusão dos seus dados no ShopWise.</p>

                        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #dc2626;">Dados serão excluídos em breve</h3>
                            <p>Seus dados serão permanentemente excluídos em: <strong>${formattedDate}</strong></p>
                            <p>Após esta data, não será possível recuperar suas informações.</p>
                        </div>

                        <p>Se você deseja manter sua conta ativa, faça login no aplicativo antes da data mencionada.</p>
                        <p>Caso tenha alguma dúvida ou precise de ajuda, entre em contato conosco.</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #666;">
                            ShopWise - Gerencie suas compras de forma inteligente
                        </p>
                    </div>
                </body>
            </html>
        `;

        const text = `
            Aviso Importante: Exclusão de Dados - ShopWise

            Olá ${userName},

            Este é um aviso importante sobre a exclusão dos seus dados no ShopWise.

            DADOS SERÃO EXCLUÍDOS EM BREVE

            Seus dados serão permanentemente excluídos em: ${formattedDate}
            Após esta data, não será possível recuperar suas informações.

            Se você deseja manter sua conta ativa, faça login no aplicativo antes da data mencionada.

            Caso tenha alguma dúvida ou precise de ajuda, entre em contato conosco.

            ShopWise - Gerencie suas compras de forma inteligente
        `;

        return this.sendEmail({
            to: email,
            subject: 'Aviso Importante: Exclusão de Dados - ShopWise',
            html,
            text,
        });
    }

    // Account deletion confirmation
    async sendAccountDeletionConfirmation(email: string, userName: string) {
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Conta Excluída - ShopWise</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2563eb;">Conta Excluída com Sucesso</h1>
                        <p>Olá ${userName},</p>
                        <p>Confirmamos que sua conta no ShopWise foi excluída conforme solicitado.</p>

                        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">O que foi excluído:</h3>
                            <ul>
                                <li>Todas as suas listas de compras</li>
                                <li>Histórico de compras e gastos</li>
                                <li>Configurações da conta</li>
                                <li>Dados pessoais</li>
                            </ul>
                        </div>

                        <p>Lamentamos vê-lo partir! Se você decidir voltar no futuro, será bem-vindo para criar uma nova conta.</p>
                        <p>Se você excluiu sua conta por engano ou tem alguma dúvida, entre em contato conosco.</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #666;">
                            ShopWise - Gerencie suas compras de forma inteligente
                        </p>
                    </div>
                </body>
            </html>
        `;

        const text = `
            Conta Excluída - ShopWise

            Olá ${userName},

            Confirmamos que sua conta no ShopWise foi excluída conforme solicitado.

            O que foi excluído:
            - Todas as suas listas de compras
            - Histórico de compras e gastos  
            - Configurações da conta
            - Dados pessoais

            Lamentamos vê-lo partir! Se você decidir voltar no futuro, será bem-vindo para criar uma nova conta.

            Se você excluiu sua conta por engano ou tem alguma dúvida, entre em contato conosco.

            ShopWise - Gerencie suas compras de forma inteligente
        `;

        return this.sendEmail({
            to: email,
            subject: 'Conta Excluída - ShopWise',
            html,
            text,
        });
    }

    // Test email for configuration verification
    async sendTestEmail(email: string) {
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Teste de Email - ShopWise</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2563eb;">Teste de Email</h1>
                        <p>Este é um email de teste para verificar a configuração do serviço de email.</p>
                        <p>Se você recebeu este email, o sistema está funcionando corretamente!</p>
                        <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #666;">
                            ShopWise - Gerencie suas compras de forma inteligente
                        </p>
                    </div>
                </body>
            </html>
        `;

        const text = `
            Teste de Email - ShopWise

            Este é um email de teste para verificar a configuração do serviço de email.

            Se você recebeu este email, o sistema está funcionando corretamente!

            Data/Hora: ${new Date().toLocaleString('pt-BR')}

            ShopWise - Gerencie suas compras de forma inteligente
        `;

        return this.sendEmail({
            to: email,
            subject: 'Teste de Email - ShopWise',
            html,
            text,
        });
    }
}
