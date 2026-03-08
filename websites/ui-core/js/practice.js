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
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Practice Arena Logic.
 */

(function () {
    const API_ROOT = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://api.ganitsutram.com/api';

    const API_BASE = `${API_ROOT}/practice`;
    let currentSet = [];
    let currentIndex = 0;
    let results = [];
    let startTime = 0;

    // --- API ---
    async function fetchPracticeSet(operation, difficulty, count) {
        try {
            const resp = await fetch(`${API_BASE}?operation=${operation}&difficulty=${difficulty}&count=${count}`);
            const data = await resp.json();
            return data.questions;
        } catch (e) {
            console.error("Practice fetch error:", e);
            return [];
        }
    }

    async function submitAnswer(question, userAnswer, timeTakenMs) {
        const token = window.GanitAuth ? window.GanitAuth.getToken() : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            // We need to provide the "correct answer" mock (the server would normally verify against its own state, 
            // but for this stateless logic task, we're passing it back, though in a real prod env 
            // the questionId would link to a cached answer on server).
            // NOTE: The server-side service mock in api/practice uses the req.body for correct answer validation.

            // Wait, rethink: The prompt says "correctAnswer NOT included in response".
            // If I don't have the correctAnswer on frontend, how do I send it to /check?
            // "question generation uses core math modules for computing answers".
            // Ah, I should have included a hidden answer or a way to compute it on server.
            // In my check endpoint logic: `const result = practiceService.checkAnswer(correctAnswer, userAnswer);`
            // The client must know the correct answer? No, that's bad.
            // Actually, in a better decoupled env, the server keeps it.
            // BUT, for this task, I will assume the client doesn't know it.
            // I'll adjust the API to derive it if missing OR I'll have the client fetch it in the check call.
            // Actually, I'll have the server regenerate it for the check call if questionId is provided.
            // BUT for now, let's assume the question generation logic is deterministic if I pass seed?
            // No, let's keep it simple: I will add the correctAnswer to the check request body by RE-CALCULATING it on server if not provided.

            // Correction for my api/practice.js later: it should re-calculate based on question data.
            // For now, I'll have the client try to send what it has (it has nothing).
            // I'll fix the backend check logic to be robust.

            const resp = await fetch(`${API_BASE}/check`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    questionId: question.questionId,
                    operation: question.operation,
                    difficulty: question.difficulty,
                    question: question.question,
                    userAnswer,
                    timeTakenMs,
                    // Note: In this mock, the server expects correctAnswer. 
                    // I will have to fix api/practice.js to derive it.
                })
            });
            return await resp.json();
        } catch (e) {
            console.error("Answer check error:", e);
            return { isCorrect: false, error: true };
        }
    }

    // --- FLOW ---
    async function startPractice() {
        const op = document.getElementById('practice-op').value;
        const diff = document.getElementById('practice-diff').value;
        const count = document.getElementById('practice-count').value;

        const arena = document.getElementById('arena-surface');
        arena.innerHTML = `<div style="text-align:center;padding:4rem;">Preparing your challenges...</div>`;

        currentSet = await fetchPracticeSet(op, diff, count);
        currentIndex = 0;
        results = [];

        if (currentSet.length === 0) {
            arena.innerHTML = `<div style="text-align:center;padding:4rem;color:red;">Failed to load questions. Try again.</div>`;
            return;
        }

        renderArena();
    }

    function renderArena() {
        const arena = document.getElementById('arena-surface');
        const q = currentSet[currentIndex];
        startTime = Date.now();

        const progressPercent = (currentIndex / currentSet.length) * 100;

        arena.innerHTML = `
            <div class="gs-practice-arena">
                <div class="gs-progress-meter">
                    <div class="gs-meter-text">
                        <span>Challenge ${currentIndex + 1} of ${currentSet.length}</span>
                        <span>${Math.round(progressPercent)}% Complete</span>
                    </div>
                    <div class="gs-meter-bar">
                        <div class="gs-meter-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="gs-question-card">
                    <div class="gs-q-meta">
                        <span class="gs-badge badge-op">${formatOpName(q.operation)}</span>
                        <span class="gs-badge badge-diff">${q.difficulty}</span>
                    </div>

                    <div class="gs-q-text">${q.question}</div>

                    <div class="gs-q-input-wrap">
                        <input type="text" id="practice-ans" class="gs-q-input" autocomplete="off" placeholder="?">
                        <button id="btn-submit-ans" class="gs-button gs-button-primary" style="width:100%">Submit Answer &rarr;</button>
                        
                        <button class="btn-hint" onclick="document.getElementById('practice-hint').style.display='block'">Need a hint?</button>
                        <div id="practice-hint" class="gs-hint-box">${q.hint}</div>
                    </div>

                    <div id="q-feedback" class="gs-feedback"></div>
                    
                    <button id="btn-next-q" class="gs-button" style="display:none; margin-top:2rem; width:100%">Next Question &rarr;</button>
                </div>
            </div>
        `;

        document.getElementById('practice-ans').focus();

        document.getElementById('btn-submit-ans').onclick = handleAnswer;
        document.getElementById('practice-ans').onkeypress = (e) => {
            if (e.key === 'Enter') handleAnswer();
        };
    }

    async function handleAnswer() {
        const input = document.getElementById('practice-ans');
        const userAnswer = input.value.trim();
        if (!userAnswer) return;

        const timeTakenMs = Date.now() - startTime;
        const q = currentSet[currentIndex];

        // Disable UI
        input.disabled = true;
        document.getElementById('btn-submit-ans').disabled = true;

        // Note: For this project constraints, I'll have to adjust the backend to NOT require correctAnswer in body
        // OR the generator must have provided it (which it didn't).
        // I will update the backend to calculate it.
        const result = await submitAnswer(q, userAnswer, timeTakenMs);

        results.push({
            question: q.question,
            userAnswer,
            correctAnswer: result.correctAnswer,
            isCorrect: result.isCorrect,
            timeTakenMs
        });

        const feedback = document.getElementById('q-feedback');
        feedback.style.display = 'block';
        if (result.isCorrect) {
            feedback.className = 'gs-feedback feedback-correct';
            feedback.innerHTML = `✅ Correct! ${result.message || ''}`;
        } else {
            feedback.className = 'gs-feedback feedback-wrong';
            feedback.innerHTML = `❌ Incorrect. The correct answer was <strong>${result.correctAnswer}</strong>.`;
        }

        const nextBtn = document.getElementById('btn-next-q');
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => {
            currentIndex++;
            if (currentIndex < currentSet.length) {
                renderArena();
            } else {
                renderSummary();
            }
        };
    }

    function renderSummary() {
        const arena = document.getElementById('arena-surface');
        const correctCount = results.filter(r => r.isCorrect).length;
        const accuracy = Math.round((correctCount / results.length) * 100);
        const totalTime = results.reduce((sum, r) => sum + r.timeTakenMs, 0);

        let tableRows = '';
        results.forEach(r => {
            tableRows += `
                <tr>
                    <td>${r.question}</td>
                    <td>${r.userAnswer}</td>
                    <td>${r.correctAnswer}</td>
                    <td><span class="summary-res-tag ${r.isCorrect ? 'res-correct' : 'res-wrong'}">${r.isCorrect ? '✓' : '✗'}</span></td>
                    <td>${(r.timeTakenMs / 1000).toFixed(1)}s</td>
                </tr>
            `;
        });

        arena.innerHTML = `
            <div class="gs-question-card" style="text-align:left;">
                <h2 class="gs-hero-title" style="font-size:2rem; margin-bottom:1rem;">Practice Complete!</h2>
                <div style="font-size:1.1rem; color:var(--text-dim); margin-bottom:2rem;">
                    Score: <strong>${correctCount} / ${results.length}</strong> (${accuracy}%) <br>
                    Total Time: <strong>${(totalTime / 1000).toFixed(1)}s</strong>
                </div>

                <table class="gs-summary-table">
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>You</th>
                            <th>Correct</th>
                            <th>Result</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>

                <div style="display:flex; gap:15px; margin-top:2rem;">
                    <button onclick="window.GanitPractice.start()" class="gs-button gs-button-primary">Practice Again &rarr;</button>
                    <button onclick="window.location.reload()" class="gs-button">Change Settings</button>
                </div>
            </div>
        `;
    }

    function formatOpName(slug) {
        return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // --- STATS ---
    async function loadStats() {
        const statsEl = document.getElementById('gs-practice-stats');
        if (!statsEl) return;

        if (!window.GanitAuth || !window.GanitAuth.isLoggedIn()) {
            statsEl.className = 'gs-stats-nudge';
            statsEl.innerHTML = `
                <p style="color:var(--text-dim);margin-bottom:1rem;">Sign in to track your mastery and see detailed practice stats.</p>
                <button onclick="window.GanitAuth.openModal('login')" class="gs-button">Sign In &rarr;</button>
            `;
            return;
        }

        try {
            const token = window.GanitAuth.getToken();
            const resp = await fetch(`${API_BASE}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            renderStats(data.stats, statsEl);
        } catch (e) {
            statsEl.innerHTML = "Failed to load stats.";
        }
    }

    function renderStats(stats, container) {
        if (!stats) return;

        container.className = 'gs-stats-panel';
        container.style.marginTop = '4rem';

        let breakdownHtml = '';
        stats.byOperation.forEach(op => {
            breakdownHtml += `
                <div class="gs-chart-item">
                    <div class="gs-chart-label">
                        <span>${formatOpName(op.operation)}</span>
                        <span>${op.accuracy}%</span>
                    </div>
                    <div class="gs-chart-bar-wrap">
                        <div class="gs-chart-bar" style="width: ${op.accuracy}%; background: ${getAccuracyColor(op.accuracy)}"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <h3 style="margin-bottom:2rem;">Performance Mastery</h3>
            <div class="gs-stats-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem;">
                <div class="gs-stats-card" style="background:rgba(255,255,255,0.02); padding:1.5rem; border-radius:15px; text-align:center;">
                    <div style="font-size:2.5rem; font-weight:700; color:var(--accent-primary);">${stats.accuracy}%</div>
                    <div style="font-size:0.8rem; color:var(--text-dim);">Overall Accuracy</div>
                </div>
                <div class="gs-stats-card" style="background:rgba(255,255,255,0.02); padding:1.5rem; border-radius:15px; text-align:center;">
                    <div style="font-size:2.5rem; font-weight:700; color:var(--accent-primary);">${stats.attempted}</div>
                    <div style="font-size:0.8rem; color:var(--text-dim);">Questions Attempted</div>
                </div>
            </div>
            <div style="margin-top:2rem;">
                ${breakdownHtml}
            </div>
        `;
    }

    function getAccuracyColor(acc) {
        if (acc >= 90) return '#00ff7f';
        if (acc >= 70) return '#00a3ff';
        if (acc >= 40) return '#ffc107';
        return '#ff4d4d';
    }

    window.GanitPractice = {
        start: startPractice,
        loadStats
    };

    document.addEventListener('DOMContentLoaded', loadStats);
    document.addEventListener('ganit:auth:login', loadStats);
})();
