import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// A small, explicit shape for the parts of SentMessageInfo we use.
type SafeSentMessageInfo = {
    accepted: string[];
    rejected: string[];
    response: string;
    envelopeTime?: number;
    messageTime?: number;
    messageSize?: number;
    messageId?: string;
};

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        // transporter is lazily initialized on first sendMail to avoid async constructor work
    }

    async sendMail(opts: nodemailer.SendMailOptions): Promise<{ info: SafeSentMessageInfo; preview?: string | false }> {
        if (!this.transporter) {
            const host = process.env.SMTP_HOST;
            if (host) {
                this.transporter = nodemailer.createTransport({
                    host,
                    port: Number(process.env.SMTP_PORT || 587),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: process.env.SMTP_USER
                        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                        : undefined,
                });
            } else {
                const acc = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: acc.smtp.host,
                    port: acc.smtp.port,
                    secure: acc.smtp.secure,
                    auth: { user: acc.user, pass: acc.pass },
                });
            }
        }

        const transporter = this.transporter;
        const sendResult = (await transporter.sendMail(opts)) as unknown;

        // Note: we avoid assigning the raw send result directly to a typed shape.
        // Instead we extract expected fields below using runtime guards.

        // Build a fully-typed SentMessageInfo by extracting fields from the send result
        const acceptedFromResult: string[] = [];
        const rejectedFromResult: string[] = [];
        let responseFromResult = '';
        let envelopeTimeFromResult: number | undefined;
        let messageTimeFromResult: number | undefined;
        let messageSizeFromResult: number | undefined;
        let messageIdFromResult: string | undefined;

        if (typeof sendResult === 'object' && sendResult !== null) {
            const r = sendResult as Record<string, unknown>;
            if (Array.isArray(r.accepted)) {
                for (const v of r.accepted) if (typeof v === 'string') acceptedFromResult.push(v);
            }
            if (Array.isArray(r.rejected)) {
                for (const v of r.rejected) if (typeof v === 'string') rejectedFromResult.push(v);
            }
            if (typeof r.response === 'string') responseFromResult = r.response;
            if (typeof r.envelopeTime === 'number') envelopeTimeFromResult = r.envelopeTime;
            if (typeof r.messageTime === 'number') messageTimeFromResult = r.messageTime;
            if (typeof r.messageSize === 'number') messageSizeFromResult = r.messageSize;
            if (typeof r.messageId === 'string') messageIdFromResult = r.messageId;
        }

        const safeInfo: SafeSentMessageInfo = {
            accepted: acceptedFromResult,
            rejected: rejectedFromResult,
            response: responseFromResult,
            envelopeTime: envelopeTimeFromResult,
            messageTime: messageTimeFromResult,
            messageSize: messageSizeFromResult,
            messageId: messageIdFromResult,
        };
        const maybeGetTestUrl: ((info: unknown) => string | false | undefined) | undefined = (
            nodemailer as unknown as { getTestMessageUrl?: (info: unknown) => string | false | undefined }
        ).getTestMessageUrl;
        let previewLocal: string | false | undefined = undefined;
        if (maybeGetTestUrl) {
            const p = maybeGetTestUrl(sendResult);
            previewLocal = typeof p === 'string' ? p : p === false ? false : undefined;
        }
        const result: { info: nodemailer.SentMessageInfo; preview?: string | false } = { info: safeInfo };
        if (previewLocal !== undefined) result.preview = previewLocal;
        return result;
    }

    async ensureTransporter(): Promise<boolean> {
        if (!this.transporter) {
            // initialize transporter without sending
            const host = process.env.SMTP_HOST;
            if (host) {
                this.transporter = nodemailer.createTransport({
                    host,
                    port: Number(process.env.SMTP_PORT || 587),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: process.env.SMTP_USER
                        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                        : undefined,
                });
            } else {
                const acc = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: acc.smtp.host,
                    port: acc.smtp.port,
                    secure: acc.smtp.secure,
                    auth: { user: acc.user, pass: acc.pass },
                });
            }
        }
        // If SMTP_HOST provided, verify transporter (fail-fast in production)
        if (process.env.SMTP_HOST && this.transporter) {
            await this.transporter.verify();
        }
        return true;
    }
}
