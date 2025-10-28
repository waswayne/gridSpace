import nodemailer from 'nodemailer';
import { getConfig } from '../config/env.js';
import { logger } from '../config/logger.js';

const DEFAULT_FROM_NAME = 'GridSpace';

export class EmailService {
  constructor({ config = getConfig(), transporter } = {}) {
    this.config = config;
    this.mailConfig = config.mail ?? {};
    this.transporter = transporter ?? this.#createTransporter();
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
    return `
      <p>Hello ${userName},</p>
      <p>Your GridSpace verification code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:6px;">${code}</p>
      <p>This code expires soon. If you did not request it, please ignore this email.</p>
    `;
  }

  #buildVerificationText(code, userName = 'there') {
    return `Hello ${userName},\n\nYour GridSpace verification code is: ${code}\nThis code expires soon. If you did not request it, please ignore this email.`;
  }

  #buildPasswordResetHtml(code, userName = 'there') {
    const supportLink = this.mailConfig.frontendBaseUrl
      ? `<p>You can also head to <a href="${this.mailConfig.frontendBaseUrl}">${this.mailConfig.frontendBaseUrl}</a> to finish resetting your password.</p>`
      : '';

    return `
      <p>Hello ${userName},</p>
      <p>We received a request to reset your GridSpace password. Use this code:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:6px;">${code}</p>
      <p>This code expires in one hour. If you did not request this, you can safely ignore this email.</p>
      ${supportLink}
    `;
  }

  #buildPasswordResetText(code, userName = 'there') {
    const base = this.mailConfig.frontendBaseUrl
      ? ` Visit ${this.mailConfig.frontendBaseUrl} to finish resetting your password.`
      : '';

    return `Hello ${userName},\n\nUse this GridSpace password reset code: ${code}. It expires in one hour.${base}\nIf you did not request this, you can ignore this email.`;
  }
}
