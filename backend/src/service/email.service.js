import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

if (process.env.EMAIL_PASS) {
    transporter.verify((error, success) => {
        if (error) {
            console.error('Transporter verification failed:', error);
        }
    });
}

export class EmailService {
    async sendOtpEmail(email, otpCode, type) {
        try {
            let templatePath;
            let subject;

            switch (type) {
                case 'verification':
                    templatePath = path.join(__dirname, '../templates/otpVerification.html');
                    subject = 'Verify Your Account - OTP Code';
                    break;
                case 'forgotPassword':
                    templatePath = path.join(__dirname, '../templates/forgotPassword.html');
                    subject = 'Reset Your Password - OTP Code';
                    break;
                case 'resetPassword':
                    templatePath = path.join(__dirname, '../templates/resetPassword.html');
                    subject = 'Password Reset Successful';
                    break;
                default:
                    throw new Error('Invalid OTP type');
            }

            const template = fs.readFileSync(templatePath, 'utf8');
            const html = template.replace('{{OTP_CODE}}', otpCode);
            
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: subject,
                html: html,
            };

            const info = await transporter.sendMail(mailOptions);
            return { messageId: info.messageId, status: 'sent' };
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendResetPasswordEmail(email) {
        try {
            const templatePath = path.join(__dirname, '../templates/resetPassword.html');
            const template = fs.readFileSync(templatePath, 'utf8');
            const html = template.replace('{{EMAIL}}', email);

            const mailOptions = {
                from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Password Reset Successful',
                html: html,
            };

            const info = await transporter.sendMail(mailOptions);
            return { messageId: info.messageId, status: 'sent' };
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}
