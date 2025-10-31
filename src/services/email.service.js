import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getConfig } from '../config/env.js';
import { logger } from '../config/logger.js';

const DEFAULT_FROM_NAME = 'GridSpace';

export class EmailService {
  constructor({ config = getConfig(), transporter } = {}) {
    this.config = config;
    this.mailConfig = config.mail ?? {};
    this.resendApiKey = this.mailConfig.resend?.apiKey;
    this.transporter = this.resendApiKey
      ? null
      : transporter ?? this.#createTransporter();
    this.resendClient = this.resendApiKey ? new Resend(this.resendApiKey) : null;
  }

  async sendEmailVerificationEmail({ to, code, userName }) {
    if (!this.#isConfigured()) {
      logger.warn('Email verification skipped: mail transport not configured');
      return { success: false, error: 'Mail transport not configured' };
    }

    const from = this.#getFrom();

    const mailOptions = {
      from,
      to,
      subject: 'Verify your email - GridSpace',
      html: this.#buildVerificationHtml(code, userName),
      text: this.#buildVerificationText(code, userName),
    };

    return this.#send(mailOptions, 'verification');
  }

  async sendPasswordResetEmail({ to, code, userName }) {
    if (!this.#isConfigured()) {
      logger.warn('Password reset email skipped: mail transport not configured');
      return { success: false, error: 'Mail transport not configured' };
    }

    const from = this.#getFrom();

    const mailOptions = {
      from,
      to,
      subject: 'Reset your password - GridSpace',
      html: this.#buildPasswordResetHtml(code, userName),
      text: this.#buildPasswordResetText(code, userName),
    };

    return this.#send(mailOptions, 'password reset');
  }

  #isConfigured() {
    if (this.resendApiKey) {
      return Boolean(this.resendClient && this.mailConfig.fromAddress);
    }

    const smtp = this.mailConfig.smtp ?? {};
    return Boolean(this.transporter && smtp.user && this.mailConfig.fromAddress);
  }

  #getFrom() {
    const name = this.mailConfig.fromName ?? DEFAULT_FROM_NAME;
    if (!this.mailConfig.fromAddress) {
      return name;
    }

    return `"${name}" <${this.mailConfig.fromAddress}>`;
  }

  #createTransporter() {
    const smtp = this.mailConfig.smtp ?? {};

    if (!smtp.user) {
      return null;
    }

    try {
      if (smtp.service) {
        const pass = smtp.appPassword || smtp.pass;
        if (!pass) {
          logger.warn('Mail transport missing password for service configuration');
          return null;
        }

        return nodemailer.createTransport({
          service: smtp.service,
          auth: {
            user: smtp.user,
            pass,
          },
        });
      }

      if (smtp.host) {
        const pass = smtp.appPassword || smtp.pass;
        if (!pass) {
          logger.warn('Mail transport missing password for host configuration');
          return null;
        }

        return nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port ?? 587,
          secure: Boolean(smtp.secure),
          auth: {
            user: smtp.user,
            pass,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to create nodemailer transport', { error: error.message });
      return null;
    }

    return null;
  }

  async #send(mailOptions, kind) {
    if (this.resendClient) {
      try {
        const { data, error } = await this.resendClient.emails.send({
          from: this.#getFrom(),
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text,
        });

        if (error) {
          throw new Error(error.message);
        }

        logger.info(`Sent ${kind} email via Resend`, {
          messageId: data?.id ?? null,
          to: mailOptions.to,
        });

        return { success: true, messageId: data?.id ?? null };
      } catch (error) {
        logger.error(`Failed to send ${kind} email via Resend`, {
          error: error.message,
          to: mailOptions.to,
        });

        return { success: false, error: error.message };
      }
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Sent ${kind} email`, { messageId: info.messageId, to: mailOptions.to });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send ${kind} email`, { error: error.message, to: mailOptions.to });
      return { success: false, error: error.message };
    }
  }

  #buildVerificationHtml(code, userName = 'there') {
    const displayName = this.mailConfig.fromName ?? DEFAULT_FROM_NAME;
    const safeBaseUrl = this.mailConfig.frontendBaseUrl?.replace(/\/$/, '') ?? '';
    const ctaMarkup = safeBaseUrl
      ? `
        <tr>
          <td align="center" style="padding: 0 24px 24px;">
            <a href="${safeBaseUrl}/verify-email" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Verify email</a>
          </td>
        </tr>
      `
      : '';

    return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;font-family:'Segoe UI',Arial,sans-serif;color:#111827;">
        <tr>
          <td style="padding:32px 24px 8px;font-size:18px;font-weight:600;">${displayName}</td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-size:16px;">Hello ${userName},</td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-size:16px;line-height:1.6;">
            Thanks for joining ${displayName}! Use the one-time code below to verify your email address and activate your account.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 24px 24px;">
            <div style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#1f2937;padding:16px 28px;border:2px dashed #2563eb;border-radius:12px;background:#f9fafb;">
              ${code}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-size:15px;line-height:1.6;">
            The code expires in 30 minutes. To keep your account secure, please don’t share it with anyone.
          </td>
        </tr>
        ${ctaMarkup}
        <tr>
          <td style="padding:0 24px 24px;font-size:13px;color:#6b7280;line-height:1.6;">
            If you didn’t request this, you can safely ignore this email. Need help? Reply to this message or contact support in the ${displayName} app.
          </td>
        </tr>
      </table>
    `;
  }

  #buildVerificationText(code, userName = 'there') {
    const displayName = this.mailConfig.fromName ?? DEFAULT_FROM_NAME;
    const safeBaseUrl = this.mailConfig.frontendBaseUrl?.replace(/\/$/, '') ?? '';
    const urlLine = safeBaseUrl
      ? `\n\nOpen ${safeBaseUrl}/verify-email to finish verifying your account.`
      : '';

    return `Hello ${userName},\n\nWelcome to ${displayName}! Use the verification code below within the next 30 minutes to activate your account:\n\n${code}\n\nKeep this code private.${urlLine}\nIf you did not request this, you can ignore this email.`;
  }

  #buildPasswordResetHtml(code, userName = 'there') {
    const displayName = this.mailConfig.fromName ?? DEFAULT_FROM_NAME;
    const safeBaseUrl = this.mailConfig.frontendBaseUrl?.replace(/\/$/, '') ?? '';
    const ctaMarkup = safeBaseUrl
      ? `
        <tr>
          <td align="center" style="padding: 0 24px 24px;">
            <a href="${safeBaseUrl}/reset-password" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Open ${displayName}</a>
          </td>
        </tr>
      `
      : '';

    return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;font-family:'Segoe UI',Arial,sans-serif;color:#111827;">
        <tr>
          <td style="padding:32px 24px 8px;font-size:18px;font-weight:600;">${displayName}</td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-size:16px;">Hello ${userName},</td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-size:16px;line-height:1.6;">
            We received a request to reset your ${displayName} password. Enter the one-time code below to continue.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 24px 24px;">
            <div style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#1f2937;padding:16px 28px;border:2px dashed #2563eb;border-radius:12px;background:#f9fafb;">
              ${code}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-size:15px;line-height:1.6;">
            This code expires in one hour and should not be shared with anyone. If you did not initiate this request, simply ignore this email and your password will remain unchanged.
          </td>
        </tr>
        ${ctaMarkup}
        <tr>
          <td style="padding:0 24px 24px;font-size:13px;color:#6b7280;line-height:1.6;">
            Need help? Reply to this message or contact support through the ${displayName} app.
          </td>
        </tr>
      </table>
    `;
  }

  #buildPasswordResetText(code, userName = 'there') {
    const displayName = this.mailConfig.fromName ?? DEFAULT_FROM_NAME;
    const safeBaseUrl = this.mailConfig.frontendBaseUrl?.replace(/\/$/, '') ?? '';
    const urlLine = safeBaseUrl
      ? `\n\nOpen ${safeBaseUrl}/reset-password to continue the reset.`
      : '';

    return `Hello ${userName},\n\nWe received a request to reset your ${displayName} password. Use the one-time code below within the next hour:\n\n${code}\n\nDo not share this code with anyone.${urlLine}\nIf you did not request this, you can safely ignore this email.`;
  }
}
