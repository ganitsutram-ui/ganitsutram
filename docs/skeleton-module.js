/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: JavaScript module skeleton for ui-core or backend use.
         Copy and rename when creating a new ui-core JS module.
         RULE: No mathematical algorithms in this layer.
*/

(function () {
    'use strict';

    /**
     * Module: [Module Name]
     * Description: [What this module does]
     *
     * RULES:
     * - No calculation algorithms allowed in frontend modules.
     * - All math operations must go through backend /api/* endpoints.
     * - Use fetch() to call the backend, never compute locally.
     */

    // ─── CONSTANTS ───────────────────────────────────────────
    // RULE: Use window.GanitConfig as the single source of truth.
    const { API_BASE } = window.GanitConfig;

    // ─── INIT ────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        init();
    });

    function init() {
        // Setup event listeners, DOM interactions, etc.
    }

    // ─── API HELPER ──────────────────────────────────────────
    /**
     * Call the backend solve API.
     * @param {string} operation - e.g. 'digital-root'
     * @param {number|string} input - The number input
     * @returns {Promise<Object>} API response
     */
    async function solve(operation, input) {
        const response = await fetch(`${API_BASE}/solve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation, input })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Expose only what is needed
    window.GanitUI = window.GanitUI || {};
    window.GanitUI.solve = solve;

})();
