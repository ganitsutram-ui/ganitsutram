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

Purpose: Research Lab interactive logic.
         Beejank Mapper experiment and API integration.
*/

(function () {
    'use strict';

    const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'http://localhost:3000/api';

    const API_URL = `${API_BASE}/solve`;

    document.addEventListener('DOMContentLoaded', () => {
        initMapper();
        initToolControllers();
    });

    /**
     * Initializes the Beejank Mapper Experiment.
     */
    function initMapper() {
        const form = document.getElementById('gs-mapper-form');
        const grid = document.getElementById('gs-mapper-grid');
        const btn = document.getElementById('gs-mapper-btn');
        const errorMsg = document.getElementById('gs-mapper-error');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const start = parseInt(document.getElementById('map-start').value);
            const end = parseInt(document.getElementById('map-end').value);

            // Validation
            if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
                showError("Please enter positive integers.");
                return;
            }

            if (end < start) {
                showError("End number must be greater than start number.");
                return;
            }

            const count = end - start + 1;
            if (count > 81) {
                showError("Max range is 81 numbers for this interactive bench.");
                return;
            }

            // Reset UI
            errorMsg.textContent = '';
            grid.innerHTML = '';
            btn.textContent = 'Mapping...';
            btn.disabled = true;

            try {
                const results = [];
                // Batch requests (sequential for simplicity in lab UI)
                for (let n = start; n <= end; n++) {
                    const res = await fetchDigitalRoot(n);
                    results.push(res);
                }

                renderGrid(results, grid);

            } catch (err) {
                showError("Engine connection failed. Ensure backend is active.");
            } finally {
                btn.textContent = 'Map Range';
                btn.disabled = false;
            }
        });
    }

    /**
     * Fetches digital root for a single number.
     */
    async function fetchDigitalRoot(input) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation: 'digital-root', input })
        });
        if (!response.ok) throw new Error("API Exception");
        return await response.json();
    }

    /**
     * Renders the visual Beejank grid.
     */
    function renderGrid(data, container) {
        container.innerHTML = data.map(item => `
            <div class="gs-mapper-cell root-${item.result}">
                <span class="gs-cell-num">${window.GanitI18n.formatResult(item.input)}</span>
                <span class="gs-cell-root">${window.GanitI18n.formatResult(item.result)}</span>
            </div>
        `).join('');
    }

    function showError(msg) {
        const errorMsg = document.getElementById('gs-mapper-error');
        if (errorMsg) errorMsg.textContent = `! ${msg}`;
        else console.error(msg);
    }

    /**
     * Initializes all interactive workbench tools.
     */
    function initToolControllers() {
        // TOOL 1: Pattern Detector
        setupTool('tool-pattern-detector', async (input) => {
            const numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            if (numbers.length < 3) throw new Error("Enter at least 3 numbers.");

            const resp = await fetch(`${API_BASE}/patterns/analyse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numbers })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            return renderPatternResults(data.analysis);
        });

        // TOOL 2: Digit Frequency
        setupTool('tool-digit-freq', async (input) => {
            if (!input) throw new Error("Enter a number to analyse.");
            const digits = String(input).replace(/[^0-9]/g, '').split('');
            const freq = Array(10).fill(0);
            digits.forEach(d => freq[parseInt(d)]++);

            const max = Math.max(...freq);
            const total = digits.length;

            return `
                <div class="gs-freq-chart">
                    ${freq.map((count, d) => {
                const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
                const isMax = count > 0 && count === max;
                return `
                            <div class="gs-freq-row">
                                <span class="gs-freq-label">${window.GanitI18n.formatResult(d)}</span>
                                <div class="gs-freq-bar-wrap">
                                    <div class="gs-freq-bar ${isMax ? 'max' : ''}" style="width: ${percent}%"></div>
                                </div>
                                <span class="gs-freq-val">${window.GanitI18n.formatResult(count)} (${window.GanitI18n.formatResult(percent)}%)</span>
                            </div>
                        `;
            }).join('')}
                </div>
                <div class="gs-lab-results">
                    Dominant Digit: <strong style="color:var(--accent-primary)">${window.GanitI18n.formatResult(freq.indexOf(max))}</strong>
                </div>
            `;
        });

        // TOOL 3: Vedic Multiplier
        setupTool('tool-multiplier', async (input) => {
            const [a, b] = input.split(',').map(n => n.trim());
            const opSelect = document.getElementById('multiplier-op');
            const op = opSelect ? opSelect.value : 'nikhilam-steps';

            if (!a || !b) throw new Error("Enter two numbers (A, B)");

            const resp = await fetch(`${API_BASE}/solve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation: op, inputA: a, inputB: b })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            return `
                <div class="gs-steps-chain" style="margin-bottom:1.5rem">
                    ${data.steps.map(s => `<span class="gs-step-pill">${String(s).replace(/\d+/g, match => window.GanitI18n.formatResult(match))}</span>`).join(' → ')}
                </div>
                <div style="font-size:2rem; font-family:var(--font-logo); color:var(--accent-primary)">${window.GanitI18n.formatResult(data.result)}</div>
                <div style="font-size:0.8rem; color:var(--accent-secondary); margin-top:0.5rem">Calculated via ${op.split('-')[0].toUpperCase()}</div>
            `;
        });

        // TOOL 5: Kaprekar
        setupTool('tool-kaprekar', async (input) => {
            const n = parseInt(input);
            const resp = await fetch(`${API_BASE}/patterns/kaprekar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            const { steps, constant, iterationsToConstant } = data.result;
            return `
                <table class="gs-table" style="font-size:0.8rem">
                    <thead><tr><th>Desc</th><th>Asc</th><th>Diff</th></tr></thead>
                    <tbody>
                        ${steps.map(s => `<tr><td>${window.GanitI18n.formatResult(s.descNum)}</td><td>${window.GanitI18n.formatResult(s.ascNum)}</td><td>${window.GanitI18n.formatResult(s.diff)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="gs-lab-results" style="text-align:center">
                    <span class="status-beta" style="padding:0.5rem 1rem">Reached ${window.GanitI18n.formatResult(constant)} in ${window.GanitI18n.formatResult(iterationsToConstant)} steps</span>
                </div>
            `;
        });

        // TOOL 6: Fibonacci
        setupTool('tool-fibonacci', async (input) => {
            const count = parseInt(input) || 24;
            const resp = await fetch(`${API_BASE}/patterns/fibonacci`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            const { fibonacci, digitalRoots } = data;
            return `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem">
                    <div>
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:0.5rem">Sequence</div>
                        <div class="gs-fib-wrap">
                            ${fibonacci.map(n => `<span class="gs-fib-pill">${window.GanitI18n.formatResult(n)}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:0.5rem">Digital Roots</div>
                        <div class="gs-fib-wrap">
                            ${digitalRoots.roots.map((r, i) => `
                                <span class="gs-fib-pill ${(i + 1) % 24 === 0 ? 'cycle-point' : ''}" title="N=${window.GanitI18n.formatResult(fibonacci[i])}">${window.GanitI18n.formatResult(r)}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ${digitalRoots.cycleDetected ? `<div class="status-live" style="margin-top:1rem; text-align:center; padding:0.4rem; font-size:0.7rem">24-Step Cycle Detected ✅</div>` : ''}
            `;
        });
    }

    /**
     * Generic helper to bind tool UI to logic.
     */
    function setupTool(toolId, handler) {
        const btn = document.querySelector(`#${toolId} .gs-lab-btn`);
        const resultsDiv = document.querySelector(`#${toolId} .gs-tool-results`);
        const inputField = document.querySelector(`#${toolId} .gs-tool-input`);

        if (!btn || !resultsDiv) return;

        btn.addEventListener('click', async () => {
            const originalText = btn.textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;
            resultsDiv.innerHTML = '';

            try {
                const html = await handler(inputField.value);
                resultsDiv.innerHTML = html;
            } catch (err) {
                resultsDiv.innerHTML = `<div class="gs-error-msg">! ${err.message}</div>`;
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    function renderPatternResults(analysis) {
        return `
            <div class="gs-badge-group">
                <span class="gs-pattern-badge ${analysis.isArithmeticProgression ? 'active' : ''}">AP ${analysis.isArithmeticProgression ? '✅' : '❌'}</span>
                <span class="gs-pattern-badge ${analysis.isGeometricProgression ? 'active' : ''}">GP ${analysis.isGeometricProgression ? '✅' : '❌'}</span>
                <span class="gs-pattern-badge ${analysis.digitalRootCycleDetected ? 'active' : ''}">DR Cycle ${analysis.digitalRootCycleDetected ? '✅' : '❌'}</span>
            </div>
            <div class="gs-lab-results">
                <strong>Dominant Pattern:</strong> <span style="color:var(--accent-primary)">${analysis.dominantPattern}</span>
                <div style="font-size:0.8rem; margin-top:0.5rem; color:var(--text-dim)">
                   ${analysis.patterns.filter(p => p.detected).map(p => `• ${p.name}: ${p.insight}`).join('<br>')}
                </div>
            </div>
        `;
    }

})();
