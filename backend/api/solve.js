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

Purpose: Solver route handler for the GanitSūtram API.
         RULE: Only routing and response shaping. No algorithm logic.
*/

const express = require('express');
const router = express.Router();
const digitalRootModule = require('../../core/math-engine/digital-root');
const { squaresEndingFive, squaresEndingFiveWithSteps } = require('../../core/math-engine/squares-ending-5');
const { multiplyBy11, multiplyBy11WithSteps } = require('../../core/math-engine/multiply-by-11');
const { nikhilam, nikhilamWithSteps } = require('../../core/math-engine/nikhilam');
const { urdhva, urdhvaWithSteps } = require('../../core/math-engine/urdhva');
const {
    kaprekarRoutine,
    fibonacci,
    fibonacciDigitalRoots,
    detectSquarePattern,
    analyseSequence
} = require('../../core/math-engine/pattern-engine');
const { optionalAuth } = require('../auth/auth-middleware');
const { errorResponse, t } = require('../services/i18n-service');
const progressService = require('../services/progress-service');
const { validatePositiveInteger, validateNumberArray } = require('../middleware/sanitiser');

/**
 * POST /api/solve
 * Body: { "operation": string, "input": number|string, "inputA": number|string, "inputB": number|string }
 */
router.post('/', optionalAuth, (req, res) => {
    const { operation, input, inputA, inputB } = req.body;

    if (!operation) {
        return res.status(400).json(errorResponse(req.locale, 'errors.solve.unknownOperation'));
    }

    try {
        let result;
        let responseData = {
            operation,
            attribution: "GanitSūtram | AITDL"
        };

        // Preserve input(s) in response
        if (input !== undefined) responseData.input = input;
        if (inputA !== undefined) responseData.inputA = inputA;
        if (inputB !== undefined) responseData.inputB = inputB;

        // Generic massive input size guard to prevent event-loop block
        const MAX_INPUT = 1e15;

        // Validation map based on operation
        const checkInputs = {
            'digital-root': () => validatePositiveInteger(input),
            'squares-ending-5': () => validatePositiveInteger(input),
            'multiply-by-11': () => validatePositiveInteger(input),
            'kaprekar': () => {
                const cv = validatePositiveInteger(input);
                if (!cv.valid) return cv;
                if (cv.parsed < 100 || cv.parsed > 9999) return { valid: false, message: t(req.locale, 'errors.validation.invalidKaprekar') };
                const digits = new Set(String(cv.parsed).split(''));
                if (digits.size === 1) return { valid: false, message: t(req.locale, 'errors.validation.invalidKaprekar') };
                return cv;
            },
            'fibonacci': () => {
                const cv = validatePositiveInteger(input);
                if (cv.valid && cv.parsed > 50) return { valid: false, message: t(req.locale, 'errors.validation.countTooLarge') };
                return cv;
            },
            'square-pattern': () => {
                const cv = validatePositiveInteger(input);
                if (cv.valid && cv.parsed > 50) return { valid: false, message: t(req.locale, 'errors.validation.countTooLarge') };
                return cv;
            }
        };

        const validateAAndB = () => {
            const cvA = validatePositiveInteger(inputA);
            const cvB = validatePositiveInteger(inputB);

            if (!cvA.valid || !cvB.valid) return { valid: false };
            if (cvA.parsed > MAX_INPUT || cvB.parsed > MAX_INPUT) return { valid: false, message: t(req.locale, 'errors.validation.inputTooLarge') };
            return { valid: true, a: cvA.parsed, b: cvB.parsed };
        };

        switch (operation) {
            case 'digital-root':
            case 'digital-root-steps':
                const drCheck = checkInputs['digital-root']();
                if (!drCheck.valid) return res.status(422).json(errorResponse(req.locale, 'errors.validation.invalidInteger'));
                if (drCheck.parsed > MAX_INPUT) return res.status(422).json(errorResponse(req.locale, 'errors.validation.inputTooLarge'));
                if (operation === 'digital-root') {
                    responseData.result = digitalRootModule.digitalRoot(input);
                } else {
                    const drSteps = digitalRootModule.digitalRootWithSteps(input);
                    responseData.result = drSteps.result;
                    responseData.steps = drSteps.steps;
                }
                break;

            case 'squares-ending-5':
            case 'squares-ending-5-steps':
                const sqCheck = checkInputs['squares-ending-5']();
                if (!sqCheck.valid) return res.status(422).json(errorResponse(req.locale, 'errors.validation.invalidInteger'));
                if (sqCheck.parsed > MAX_INPUT) return res.status(422).json(errorResponse(req.locale, 'errors.validation.inputTooLarge'));
                if (operation === 'squares-ending-5') {
                    responseData.result = squaresEndingFive(input);
                } else {
                    const sqSteps = squaresEndingFiveWithSteps(input);
                    responseData.result = sqSteps.result;
                    responseData.steps = sqSteps.steps;
                }
                break;

            case 'multiply-by-11':
            case 'multiply-by-11-steps':
                const m11Check = checkInputs['multiply-by-11']();
                if (!m11Check.valid) return res.status(422).json(errorResponse(req.locale, 'errors.validation.invalidInteger'));
                if (m11Check.parsed > MAX_INPUT) return res.status(422).json(errorResponse(req.locale, 'errors.validation.inputTooLarge'));
                if (operation === 'multiply-by-11') {
                    responseData.result = multiplyBy11(input);
                } else {
                    const m11Steps = multiplyBy11WithSteps(input);
                    responseData.result = m11Steps.result;
                    responseData.steps = m11Steps.steps;
                }
                break;

            case 'nikhilam':
            case 'nikhilam-steps':
                const nikCheck = validateAAndB();
                if (!nikCheck.valid) return res.status(422).json({ error: nikCheck.message ? nikCheck.message : t(req.locale, 'errors.validation.requiredField') });
                if (operation === 'nikhilam') {
                    responseData.result = nikhilam(inputA, inputB);
                } else {
                    const nikSteps = nikhilamWithSteps(inputA, inputB);
                    responseData.result = nikSteps.result;
                    responseData.steps = nikSteps.steps;
                }
                break;

            case 'urdhva':
            case 'urdhva-steps':
                const urdCheck = validateAAndB();
                if (!urdCheck.valid) return res.status(422).json({ error: urdCheck.message ? urdCheck.message : t(req.locale, 'errors.validation.requiredField') });
                if (operation === 'urdhva') {
                    responseData.result = urdhva(inputA, inputB);
                } else {
                    const urdSteps = urdhvaWithSteps(inputA, inputB);
                    responseData.result = urdSteps.result;
                    responseData.steps = urdSteps.steps;
                }
                break;

            case 'kaprekar':
                const kapCheck = checkInputs['kaprekar']();
                if (!kapCheck.valid) return res.status(422).json({ error: kapCheck.message });
                responseData.result = kaprekarRoutine(input);
                break;

            case 'fibonacci':
                const fibCheck = checkInputs['fibonacci']();
                if (!fibCheck.valid) return res.status(422).json({ error: fibCheck.message ? fibCheck.message : t(req.locale, 'errors.validation.invalidInteger') });
                responseData.result = {
                    sequence: fibonacci(input),
                    roots: fibonacciDigitalRoots(input)
                };
                break;

            case 'square-pattern':
                const spCheck = checkInputs['square-pattern']();
                if (!spCheck.valid) return res.status(422).json({ error: spCheck.message ? spCheck.message : t(req.locale, 'errors.validation.invalidInteger') });
                responseData.result = detectSquarePattern(input);
                break;

            case 'analyse-sequence':
                let arr = input;
                if (typeof input === 'string') {
                    arr = String(input).split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                }
                const arrCheck = validateNumberArray(arr);
                if (!arrCheck.valid) return res.status(422).json(errorResponse(req.locale, 'errors.validation.invalidArray'));
                responseData.result = analyseSequence(arr);
                break;

            default:
                return res.status(400).json(errorResponse(req.locale, 'errors.solve.unknownOperation'));
        }

        // Auto-save progress if authenticated
        if (req.user) {
            const timeTakenMs = req.body.timeTakenMs || 0;
            const isSteps = operation.endsWith('-steps');
            const baseOp = isSteps ? operation.replace('-steps', '') : operation;

            // Fire and forget - async IIFE
            (async () => {
                try {
                    const db = require('../database/db');
                    const [progCountRes, opCountRes] = await Promise.all([
                        db.get('SELECT COUNT(*) as c FROM progress WHERE user_id = ?', req.user.userId),
                        db.get('SELECT COUNT(*) as c FROM progress WHERE user_id = ? AND operation = ?', req.user.userId, baseOp)
                    ]);
                    const progCount = progCountRes.c;
                    const opCount = opCountRes.c;

                    await progressService.addProgress(req.user.userId, {
                        operation,
                        input,
                        inputA,
                        inputB,
                        result: responseData.result,
                        steps: responseData.steps,
                        timeTakenMs
                    });

                    // Gamification hook
                    // NOTE: leaderboard-service.js appears to be missing or misnamed in the current structure.
                    // If it exists, it should be refactored to be async.
                    try {
                        const leaderboardService = require('../services/leaderboard-service');
                        const { POINTS, awardPoints } = leaderboardService;

                        // Assuming awardPoints will also be refactored to be async
                        await awardPoints(req.user.userId, 'solve', POINTS.solve, baseOp);
                        if (isSteps) {
                            await awardPoints(req.user.userId, 'solve_with_steps', POINTS.solve_with_steps - POINTS.solve, baseOp);
                        }
                        if (progCount === 0) {
                            await awardPoints(req.user.userId, 'first_solve_bonus', POINTS.first_solve_bonus, baseOp);
                        }
                        if (opCount === 0) {
                            await awardPoints(req.user.userId, 'new_operation_bonus', POINTS.new_operation_bonus, baseOp);
                        }

                        if (['kaprekar', 'fibonacci'].includes(baseOp)) await awardPoints(req.user.userId, baseOp + '_bonus', POINTS.kaprekar_solve, baseOp);
                        if (['nikhilam', 'urdhva'].includes(baseOp)) await awardPoints(req.user.userId, baseOp + '_bonus', POINTS.nikhilam_solve, baseOp);
                    } catch (serviceErr) {
                        console.error('[Solve Gamification Hook]', serviceErr.message);
                    }

                } catch (err) {
                    console.error('[Solve Async Hook]', err);
                }
            })();
        }

        return res.json(responseData);

    } catch (error) {
        // Validation error from core modules
        const isCoreError = ['[DigitalRoot]', '[SquaresEnding5]', '[MultiplyBy11]', '[Nikhilam]', '[Urdhva]']
            .some(tag => error.message.includes(tag));

        if (isCoreError) {
            return res.status(422).json({ error: error.message });
        }

        // Generic server error
        console.error("Solver Error:", error);
        return res.status(500).json(errorResponse(req.locale, 'errors.general.serverError'));
    }
});

module.exports = router;
