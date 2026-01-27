import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

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

            if (process.env.NODE_ENV !== 'production') {
                console.log(`\n=== DEVELOPMENT MODE: OTP EMAIL ===`);
                console.log(`To: ${email}`);
                console.log(`Subject: ${subject}`);
                console.log(`OTP Code: ${otpCode}`);
                console.log(`===================================\n`);
            }

            const { data, error } = await resend.emails.send({
                from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
                to: [email],
                subject: subject,
                html: html,
            });

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendResetPasswordEmail(email) {
        try {
            const templatePath = path.join(__dirname, '../templates/resetPassword.html');
            const template = fs.readFileSync(templatePath, 'utf8');
            const html = template.replace('{{EMAIL}}', email);

            const { data, error } = await resend.emails.send({
                from: 'noreply@yourdomain.com', 
                to: [email],
                subject: 'Password Reset Successful',
                html: html,
            });

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}
