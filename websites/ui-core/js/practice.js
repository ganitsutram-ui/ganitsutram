/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 */

(function () {
    'use strict';

    // RULE: Always use GanitConfig, fallback only for safety
    const API_BASE = (window.GanitConfig && window.GanitConfig.API_BASE)
        ? `${window.GanitConfig.API_BASE.replace('/api', '')}/api/practice`
        : '/api/practice';

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
            const resp = await fetch(`${API_BASE}/check`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    questionId: question.questionId,
                    operation: question.operation,
                    difficulty: question.difficulty,
                    question: question.question,
                    userAnswer,
                    timeTakenMs
                })
            });
            return await resp.json();
        } catch (e) {
            console.error("Answer check error:", e);
            return { isCorrect: false, error: true };
        }
    }

    const SUTRA_MAP = {
        'digital-root': { name: 'Ekānyūnena Pūrveṇa', sa: 'एकाप्यनूनेन पूर्वेण', desc: 'By one less than the previous.' },
        'squares-ending-5': { name: 'Ekādhikena Pūrveṇa', sa: 'एकाधिकेन पूर्वेण', desc: 'By one more than the previous.' },
        'multiply-by-11': { name: 'Antyayordaśake’pi', sa: 'अन्त्ययोर्दशकेऽपि', desc: 'The product of the sum...' },
        'nikhilam': { name: 'Nīkhilaṃ Navataścaramaṃ Daśataḥ', sa: 'निखिलं नवतश्चरमं दशतः', desc: 'All from 9, last from 10.' },
        'urdhva-tiryak': { name: 'Ūrdhva-Tiryagbhyām', sa: 'ऊर्ध्वतिर्यग्भ्याम्', desc: 'Vertically and crosswise.' }
    };

    // --- FLOW ---
    async function startPractice() {
        const op = document.getElementById('practice-op').value;
        const diff = document.getElementById('practice-diff').value;
        const count = document.getElementById('practice-count').value;

        const arena = document.getElementById('arena-surface');
        
        // Premium Loading State
        arena.innerHTML = `
            <div style="text-align:center; padding:10rem 0; animation: fadeIn 0.5s;">
                <div class="gs-gate-loader" style="margin: 0 auto 2rem;"></div>
                <div class="gs-label">Initializing Arena</div>
                <p style="color:rgba(255,255,255,0.4); margin-top:1rem;">Preparing the "Mind Reset" session...</p>
            </div>
        `;

        // Scroll to arena
        const offset = arena.offsetTop - 150;
        window.scrollTo({ top: offset, behavior: 'smooth' });

        // Step 1: FETCH DATA
        currentSet = await fetchPracticeSet(op, diff, count);
        currentIndex = 0;
        results = [];

        if (currentSet.length === 0) {
            arena.innerHTML = `<div style="text-align:center;padding:4rem;color:var(--accent-primary);">Failed to load questions. Please check your connection.</div>`;
            return;
        }

        // Step 2: STILLNESS PROTOCOL (If not skipped recently)
        if (window.GanitStillness) {
            window.GanitStillness.init(() => {
                renderArena('SEE');
            });
        } else {
            renderArena('SEE');
        }
    }

    function renderArena(phase = 'SEE') {
        const arena = document.getElementById('arena-surface');
        const q = currentSet[currentIndex];
        const sutra = SUTRA_MAP[q.operation] || { name: 'Vedic Pattern', sa: 'गणितसूत्रम्' };
        
        if (phase === 'SEE') startTime = Date.now();

        const progressPercent = (currentIndex / currentSet.length) * 100;

        arena.innerHTML = `
            <div class="gs-practice-arena phase-${phase.toLowerCase()}">
                <div class="gs-progress-meter">
                    <div class="gs-meter-text">
                        <span>Challenge ${currentIndex + 1} of ${currentSet.length}</span>
                        <span>${Math.round(progressPercent)}%</span>
                    </div>
                    <div class="gs-meter-bar">
                        <div class="gs-meter-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="gs-question-card glass-card">
                    <div class="gs-q-meta">
                        <span class="gs-badge badge-op">${formatOpName(q.operation)}</span>
                        <div class="gs-phase-indicator">
                            <span class="${phase === 'SEE' ? 'active' : ''}">SEE</span>
                            <span class="${phase === 'UNDERSTAND' ? 'active' : ''}">UNDERSTAND</span>
                            <span class="${phase === 'SOLVE' ? 'active' : ''}">SOLVE</span>
                        </div>
                    </div>

                    <div class="gs-q-text-wrap">
                        <div class="gs-q-text">${q.question}</div>
                        ${phase === 'SEE' ? '<div class="gs-observation-status">Observing numerical structure... (3s)</div>' : ''}
                    </div>

                    <div class="gs-q-interactive">
                        ${renderPhaseContent(phase, q, sutra)}
                    </div>

                    <div id="q-feedback"></div>
                    <button id="btn-next-q" class="gs-button gs-button-primary" style="display:none; margin-top:3rem; width:100%">Next Challenge &rarr;</button>
                </div>
            </div>
        `;

        // PHASE LOGIC
        if (phase === 'SEE') {
            setTimeout(() => renderArena('UNDERSTAND'), 3000);
        } else if (phase === 'SOLVE') {
            const input = document.getElementById('practice-ans');
            if (input) {
                input.focus();
                input.onkeypress = (e) => { if (e.key === 'Enter') handleAnswer(); };
            }
            const submitBtn = document.getElementById('btn-submit-ans');
            if (submitBtn) submitBtn.onclick = handleAnswer;
        }
    }

    function renderPhaseContent(phase, q, sutra) {
        if (phase === 'UNDERSTAND') {
            return `
                <div class="gs-understand-overlay">
                    <div class="gs-label">Identify the Governing Sūtra</div>
                    <p style="color:rgba(255,255,255,0.5); font-size:0.9rem; margin-bottom:2rem;">Which principle handles this pattern?</p>
                    <div class="gs-sutra-options">
                        <button class="sutra-opt" onclick="window.GanitPractice.checkSutra('${sutra.name}')">${sutra.name}</button>
                        <button class="sutra-opt" onclick="window.GanitPractice.checkSutra('Wrong')">Ūrdhva-Tiryagbhyām</button>
                        <button class="sutra-opt" onclick="window.GanitPractice.checkSutra('Wrong')">Parāvartya Yojayet</button>
                    </div>
                    <div id="sutra-feedback" style="margin-top:1rem;"></div>
                </div>
            `;
        }

        if (phase === 'SOLVE') {
            return `
                <div class="gs-q-input-wrap">
                    <div class="gs-active-sutra">${sutra.sa} <br> <span>${sutra.name}</span></div>
                    <input type="text" id="practice-ans" class="gs-q-input" autocomplete="off" placeholder="?" maxlength="10">
                    <div style="margin-top: 2rem;">
                        <button id="btn-submit-ans" class="gs-button gs-button-primary" style="width:100%">Final Solve &rarr;</button>
                    </div>
                </div>
            `;
        }
        return '';
    }

    function checkSutra(choice) {
        const q = currentSet[currentIndex];
        const sutra = SUTRA_MAP[q.operation];
        const feedback = document.getElementById('sutra-feedback');
        
        if (choice === sutra.name) {
            feedback.innerHTML = `<span style="color:#00ff7f">✓ Exact. Proceed to SOLVE.</span>`;
            setTimeout(() => renderArena('SOLVE'), 800);
        } else {
            feedback.innerHTML = `<span style="color:#ff4d4d">Pattern Mismatch. Observe again.</span>`;
        }
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
            feedback.innerHTML = `✓ CORRECT: ${result.message || 'Excellent mastery.'}`;
            input.style.color = '#00ff7f';
            input.style.borderBottomColor = '#00ff7f';
        } else {
            feedback.className = 'gs-feedback feedback-wrong';
            feedback.innerHTML = `✗ INCORRECT. THE ANSWER WAS ${result.correctAnswer}`;
            input.style.color = '#ff4d4d';
            input.style.borderBottomColor = '#ff4d4d';
        }

        const nextBtn = document.getElementById('btn-next-q');
        nextBtn.style.display = 'block';
        nextBtn.focus();
        
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
                    <td style="font-family:'Unbounded'">${r.question}</td>
                    <td>${r.userAnswer}</td>
                    <td style="color:var(--accent-primary)">${r.correctAnswer}</td>
                    <td><span class="${r.isCorrect ? 'res-correct' : 'res-wrong'}">${r.isCorrect ? '✓' : '✗'}</span></td>
                    <td>${(r.timeTakenMs / 1000).toFixed(1)}s</td>
                </tr>
            `;
        });

        arena.innerHTML = `
            <div class="gs-question-card glass-card" style="text-align:left; animation: fadeInScale 0.6s;">
                <div class="gs-label">अभ्यास परिणाम</div>
                <h2 class="gs-hero-title" style="font-size:3rem; margin-bottom:1rem;">Mastery Report</h2>
                
                <div class="gs-stats-grid" style="margin-top:3rem;">
                    <div class="gs-stats-card">
                        <div style="font-family:'Unbounded'; font-size:2.5rem; font-weight:700; color:var(--accent-primary);">${accuracy}%</div>
                        <div class="gs-chart-label" style="justify-content:center; margin-top:1rem;">Accuracy</div>
                    </div>
                    <div class="gs-stats-card">
                        <div style="font-family:'Unbounded'; font-size:2.5rem; font-weight:700; color:var(--accent-primary);">${(totalTime / 1000).toFixed(1)}s</div>
                        <div class="gs-chart-label" style="justify-content:center; margin-top:1rem;">Total Time</div>
                    </div>
                </div>

                <div class="gs-label" style="margin-top:4rem;">Detailed Analysis</div>
                <table class="gs-summary-table">
                    <thead>
                        <tr>
                            <th>Challenge</th>
                            <th>You</th>
                            <th>Correct</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>

                <div style="display:flex; gap:20px; margin-top:4rem;">
                    <button onclick="window.GanitPractice.start()" class="gs-button gs-button-primary">Repeat Mastery &rarr;</button>
                    <button onclick="window.location.reload()" class="gs-button">Return to Settings</button>
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
            statsEl.className = 'glass-card';
            statsEl.style.marginTop = '4rem';
            statsEl.innerHTML = `
                <p style="color:rgba(255,255,255,0.4); margin-bottom:2rem; font-family:'Space Grotesk';">Authenticating allows you to track your mastery curvature and sync performance with your profile.</p>
                <div style="text-align:center;">
                    <button onclick="window.GanitAuth.openModal('login')" class="gs-button gs-button-primary">Sign In & Master &rarr;</button>
                </div>
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
            statsEl.innerHTML = "<p class='gs-label'>Error loading neurological data.</p>";
        }
    }

    function renderStats(stats, container) {
        if (!stats) return;

        container.className = 'gs-stats-panel glass-card';
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
            <div class="gs-label">Mastery Curve</div>
            <h3 class="gs-hero-title" style="font-size:2rem; text-align:left;">Neuro-Performance</h3>
            <div class="gs-stats-grid">
                <div class="gs-stats-card">
                    <div style="font-family:'Unbounded'; font-size:2.2rem; font-weight:700; color:var(--accent-primary);">${stats.accuracy}%</div>
                    <div class="gs-chart-label" style="justify-content:center; margin-top:0.5rem;">Overall Accuracy</div>
                </div>
                <div class="gs-stats-card">
                    <div style="font-family:'Unbounded'; font-size:2.2rem; font-weight:700; color:var(--accent-primary);">${stats.attempted}</div>
                    <div class="gs-chart-label" style="justify-content:center; margin-top:0.5rem;">Total Challenges</div>
                </div>
            </div>
            <div style="margin-top:3rem;">
                ${breakdownHtml}
            </div>
        `;
    }

    function getAccuracyColor(acc) {
        if (acc >= 90) return '#00ff7f';
        if (acc >= 70) return '#ff5500';
        if (acc >= 40) return '#ffc107';
        return '#ff4d4d';
    }

    window.GanitPractice = {
        start: startPractice,
        checkSutra: checkSutra,
        loadStats
    };

    document.addEventListener('DOMContentLoaded', loadStats);
    document.addEventListener('ganit:auth:login', loadStats);
})();
