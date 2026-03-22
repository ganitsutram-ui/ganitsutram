/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Email service for sending notifications and reset links.
*/

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

function verifyConnection() {
    transporter.verify(function (error, success) {
        if (error) {
            console.warn('Email service warning: Could not connect to SMTP server.', error.message);
        } else {
            console.log('Email service connected.');
        }
    });
}

async function sendPasswordResetEmail({ toEmail, resetLink, expiresMinutes }) {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #2c3e50;">गणित GanitSūtram</h2>
            </div>
            <h1 style="color: #2c3e50;">Reset Your Password</h1>
            <p>You requested a password reset. This link expires in ${expiresMinutes} minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password &rarr;</a>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9em;">If you did not request this, ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="text-align: center; color: #95a5a6; font-size: 0.8em;">&copy; GanitSūtram | AITDL | aitdl.com</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: toEmail,
            subject: 'Reset your GanitSūtram password',
            html: html
        });
        return { success: true };
    } catch (err) {
        console.error('Failed to send reset email:', err);
        throw err;
    }
}

async function sendWelcomeEmail({ toEmail, role }) {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #2c3e50;">गणित GanitSūtram</h2>
            </div>
            <h1 style="color: #2c3e50;">Welcome to the Mathematical Universe</h1>
            <p style="text-align: center; font-style: italic; color: #7f8c8d; font-size: 1.2em;">विद्या ददाति विनयम्</p>
            <p>Your journey into Vedic mathematics begins now.</p>
            <p>You are registered as: <strong>${role}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ganitsutram.com/gate.html" style="background-color: #2ecc71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Begin Your Journey &rarr;</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="text-align: center; color: #95a5a6; font-size: 0.8em;">&copy; GanitSūtram | AITDL | aitdl.com</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: toEmail,
            subject: 'Welcome to GanitSūtram',
            html: html
        });
        return { success: true };
    } catch (err) {
        console.error('Failed to send welcome email:', err);
        throw err;
    }
}

module.exports = {
    verifyConnection,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
