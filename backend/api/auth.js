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
 */
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Purpose: Authentication API routes.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authService = require('../auth/auth-service');
const userRepo = require('../database/user-repository');
const sessionRepo = require('../database/session-repository');
const tokenRepo = require('../database/token-repository');
const { requireAuth } = require('../auth/auth-middleware');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * Helper: Hash a token for DB storage.
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Basic validation
        if (!email || !password || !role) {
            return res.status(422).json({ error: "Email, password, and role are required." });
        }
        if (password.length < 8) {
            return res.status(422).json({ error: "Password must be at least 8 characters." });
        }
        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(422).json({ error: "Invalid role." });
        }
        if (!email.includes('@')) {
            return res.status(422).json({ error: "Invalid email format." });
        }

        const exists = await userRepo.emailExists(email);
        if (exists) {
            return res.status(409).json({ error: "Email already registered." });
        }

        const userId = authService.generateUserId();
        const passwordHash = await authService.hashPassword(password);
        const createdAt = new Date().toISOString();

        const user = await userRepo.createUser({ userId, email, passwordHash, role, createdAt });

        // Generate tokens
        const token = authService.generateToken({ userId: user.userId, email: user.email, role: user.role });
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = hashToken(refreshToken);
        const familyId = crypto.randomUUID();

        // Save session
        await sessionRepo.createSession({
            sessionId: crypto.randomUUID(),
            userId: user.userId,
            refreshTokenHash,
            familyId,
            deviceHint: req.headers['user-agent'] || 'unknown',
            ipHint: req.ip || 'unknown',
            issuedAt: createdAt,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

        res.status(201).json({
            message: "User registered successfully.",
            user: { userId: user.userId, email: user.email, role: user.role },
            token,
            refreshToken,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userRepo.findByEmail(email);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const valid = await authService.verifyPassword(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = authService.generateToken({ userId: user.userId, email: user.email, role: user.role });
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = hashToken(refreshToken);
        const familyId = crypto.randomUUID();

        await sessionRepo.createSession({
            sessionId: crypto.randomUUID(),
            userId: user.userId,
            refreshTokenHash,
            familyId,
            deviceHint: req.headers['user-agent'] || 'unknown',
            ipHint: req.ip || 'unknown',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        res.status(200).json({
            user: { userId: user.userId, email: user.email, role: user.role },
            token,
            refreshToken,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
    res.status(200).json({
        user: req.user,
        attribution: ATTRIBUTION
    });
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "Refresh token required." });

        const hash = hashToken(refreshToken);
        const session = await sessionRepo.findByTokenHash(hash);

        if (!session || session.revoked || session.rotated || new Date(session.expires_at) < new Date()) {
            if (session && (session.revoked || session.rotated)) {
                // Potential reuse attack! Revoke entire family.
                await sessionRepo.revokeFamilyId(session.family_id);
            }
            return res.status(401).json({ error: "Invalid or expired session." });
        }

        const user = await userRepo.findById(session.user_id);
        if (!user) return res.status(401).json({ error: "User no longer exists." });

        const newToken = authService.generateToken({ userId: user.userId, email: user.email, role: user.role });
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const newRefreshTokenHash = hashToken(newRefreshToken);

        const newSessionId = crypto.randomUUID();
        await sessionRepo.rotateSession(session.session_id, {
            sessionId: newSessionId,
            userId: user.userId,
            refreshTokenHash: newRefreshTokenHash,
            familyId: session.family_id,
            deviceHint: req.headers['user-agent'] || 'unknown',
            ipHint: req.ip || 'unknown',
            issuedAt: new Date().toISOString(),
            expiresAt: session.expires_at
        });

        res.status(200).json({
            token: newToken,
            refreshToken: newRefreshToken,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/auth/sessions
 */
router.get('/sessions', requireAuth, async (req, res) => {
    try {
        const sessions = await sessionRepo.getActiveSessions(req.user.userId);
        res.status(200).json({ sessions, attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/auth/sessions/:id
 */
router.delete('/sessions/:id', requireAuth, async (req, res) => {
    try {
        await sessionRepo.revokeSession(req.params.id);
        res.status(200).json({ message: "Session revoked.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', requireAuth, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const hash = hashToken(refreshToken);
            const session = await sessionRepo.findByTokenHash(hash);
            if (session) {
                await sessionRepo.revokeSession(session.session_id);
            }
        }
        res.status(200).json({ message: "Logged out.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userRepo.findByEmail(email);

        // Always return 200 to avoid email enumeration
        if (!user) {
            return res.status(200).json({ message: "If that email exists, a reset link has been sent.", attribution: ATTRIBUTION });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 30 * 60000).toISOString(); // 30 mins

        await tokenRepo.createResetToken({
            tokenId: crypto.randomUUID(),
            userId: user.userId,
            tokenHash,
            expiresAt,
            createdAt: new Date().toISOString()
        });

        // In a real app, send an email here. For now, we just log the token for testing.
        console.log(`[Auth] Reset token for ${email}: ${rawToken}`);

        res.status(200).json({ message: "If that email exists, a reset link has been sent.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: "Token and new password required." });

        const hash = hashToken(token);
        const tokenRecord = await tokenRepo.findByTokenHash(hash);

        if (!tokenRecord || tokenRecord.used || new Date(tokenRecord.expires_at) < new Date()) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        const passwordHash = await authService.hashPassword(newPassword);
        await userRepo.updatePassword(tokenRecord.user_id, passwordHash);
        await tokenRepo.markTokenUsed(tokenRecord.token_id);

        res.status(200).json({ message: "Password updated successfully.", attribution: ATTRIBUTION });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
