/**
 * Email Service
 * 邮件服务封装层
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface ResetPasswordEmailOptions {
  to: string;
  resetLink: string;
  username?: string;
  expiryMinutes?: number;
}

export interface VerificationEmailOptions {
  to: string;
  verificationLink: string;
  username?: string;
}

// Email templates
const templates = {
  resetPassword: ({ resetLink, username, expiryMinutes = 60 }: Omit<ResetPasswordEmailOptions, 'to'>) => {
    return {
      subject: 'Password Reset Request - CMAMSys',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #1e40af;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1e3a8a;
            }
            .warning {
              color: #dc2626;
              background-color: #fef2f2;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 CMAMSys</div>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              
              <p>Hello${username ? ` ${username}` : ''},</p>
              
              <p>We received a request to reset your password for your CMAMSys account. Click the button below to reset your password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1e40af;">${resetLink}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 20px;">
                  <li>This link will expire in ${expiryMinutes} minutes</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your password won't change until you access the link above</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated email from CMAMSys.</p>
              <p>If you have questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request - CMAMSys

Hello${username ? ` ${username}` : ''},

We received a request to reset your password for your CMAMSys account.

Click the link below to reset your password:
${resetLink}

Important:
- This link will expire in ${expiryMinutes} minutes
- If you didn't request this password reset, please ignore this email
- Your password won't change until you access the link above

This is an automated email from CMAMSys.
If you have questions, please contact our support team.
      `,
    };
  },

  emailVerification: ({ verificationLink, username }: Omit<VerificationEmailOptions, 'to'>) => {
    return {
      subject: 'Verify Your Email - CMAMSys',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #1e40af;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 CMAMSys</div>
            </div>
            
            <div class="content">
              <h2>Verify Your Email Address</h2>
              
              <p>Hello${username ? ` ${username}` : ''},</p>
              
              <p>Thank you for signing up for CMAMSys! Please verify your email address by clicking the button below:</p>
              
              <a href="${verificationLink}" class="button">Verify Email</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1e40af;">${verificationLink}</p>
              
              <p style="margin-top: 20px; color: #6b7280;">
                If you didn't create an account with CMAMSys, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Email Verification - CMAMSys

Hello${username ? ` ${username}` : ''},

Thank you for signing up for CMAMSys! Please verify your email address by clicking the link below:

${verificationLink}

If you didn't create an account with CMAMSys, you can safely ignore this email.
      `,
    };
  },
};

// Create email transporter
function createTransporter() {
  const mailerHost = process.env.MAILER_HOST || 'localhost';
  const mailerPort = parseInt(process.env.MAILER_PORT || '1025');

  // For development/testing with MailDev
  if (process.env.NODE_ENV === 'development' || process.env.MAILER_HOST) {
    return nodemailer.createTransport({
      host: mailerHost,
      port: mailerPort,
      ignoreTLS: true,
    });
  }

  // For production (configure with your SMTP server)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost) {
    throw new Error('SMTP configuration is missing for production environment');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser ? {
      user: smtpUser,
      pass: smtpPassword,
    } : undefined,
  });
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailTransporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@cmamsys.com',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendResetPasswordEmail(options: ResetPasswordEmailOptions): Promise<boolean> {
  const expiryMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || '60');
  const template = templates.resetPassword({
    resetLink: options.resetLink,
    username: options.username,
    expiryMinutes,
  });

  return sendEmail({
    to: options.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(options: VerificationEmailOptions): Promise<boolean> {
  const template = templates.emailVerification({
    verificationLink: options.verificationLink,
    username: options.username,
  });

  return sendEmail({
    to: options.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    const mailTransporter = getTransporter();
    await mailTransporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server configuration error:', error);
    return false;
  }
}

/**
 * Close email transporter
 */
export function closeEmailTransporter(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}

// Graceful shutdown
process.on('beforeExit', closeEmailTransporter);
