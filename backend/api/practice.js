/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Express router for practice system.
 */

const express = require('express');
const router = express.Router();
const practiceService = require('../services/practice-service');
const { optionalAuth, requireAuth } = require('../auth/auth-middleware');
const { errorResponse } = require('../services/i18n-service');

const ATTRIBUTION = "GanitSūtram | AITDL";

/**
 * GET /api/practice
 * Generate a set of questions.
 */
router.get('/', (req, res) => {
    const { operation = 'all', difficulty = 'beginner', count = 5 } = req.query;

    try {
        const questions = practiceService.generatePracticeSet(
            operation,
            difficulty,
            parseInt(count)
        );

        // Sanitize: REMOVE correct answers before sending to client
        const sanitized = questions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
        });

        // We store the correct answers in the response but they are NOT for the user.
        // Wait, the requirement says "correctAnswer NOT included in response".
        // But how will the client check? Requirement says "checked server-side".
        // So client must send the answer back.

        res.status(200).json({
            operation,
            difficulty,
            questions: sanitized,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

/**
 * POST /api/practice/check
 * Validate an answer and log attempt if authenticated.
 */
router.post('/check', optionalAuth, (req, res) => {
    let { questionId, operation, difficulty = 'beginner', correctAnswer, userAnswer, timeTakenMs, question } = req.body;

    if (!questionId) {
        const { v4: uuidv4 } = require('uuid');
        questionId = uuidv4();
    }

    if (!userAnswer) {
        return res.status(400).json(errorResponse(req.locale, 'errors.validation.requiredField'));
    }

    // Derivation logic: if correctAnswer is missing (client-side security), regenerate it
    if (!correctAnswer) {
        correctAnswer = practiceService.calculateAnswer(operation, question);
    }

    if (!correctAnswer) {
        return res.status(400).json(errorResponse(req.locale, 'errors.practice.checkFailed'));
    }

    const result = practiceService.checkAnswer(correctAnswer, userAnswer);

    // Save attempt if logged in
    if (req.user) {
        Promise.resolve().then(() => {
            practiceService.saveAttempt(req.user.userId, {
                attemptId: questionId,
                operation,
                question: req.body.question || "N/A",
                correctAnswer,
                userAnswer,
                isCorrect: result.isCorrect,
                difficulty,
                timeTakenMs: parseInt(timeTakenMs) || 0
            });

            const leaderboardService = require('../services/leaderboard-service');
            const { POINTS, awardPoints } = leaderboardService;
            if (result.isCorrect) {
                if (parseInt(timeTakenMs) < 10000) {
                    awardPoints(req.user.userId, 'practice_correct_fast', POINTS.practice_correct_fast, operation);
                } else {
                    awardPoints(req.user.userId, 'practice_correct', POINTS.practice_correct, operation);
                }
            }
        }).catch(err => console.error('[Practice Async Hook]', err));
    }

    res.status(200).json({
        ...result,
        message: result.isCorrect ? "Correct! Well done." : "Incorrect. Keep trying!",
        attribution: ATTRIBUTION
    });
});

/**
 * GET /api/practice/stats
 * Personal performance stats.
 */
router.get('/stats', requireAuth, (req, res) => {
    try {
        const stats = practiceService.getPracticeStats(req.user.userId);
        res.status(200).json({
            stats,
            attribution: ATTRIBUTION
        });
    } catch (err) {
        res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

module.exports = router;
