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
VS 2082 | 2026-03-08
Purpose: Single source of truth for all environment-
         dependent URLs and config values.
         Auto-detects dev vs production.
         Never hardcode URLs anywhere else.
*/

window.GanitConfig = (function () {
  'use strict';

  const DEV_HOSTS = ['localhost', '127.0.0.1'];

  const isDev = DEV_HOSTS.includes(
    window.location.hostname
  );

  // Base port for local dev
  // (Express serves all sites from port 3000)
  const DEV_BASE = 'http://localhost:3000';

  const config = {
    IS_DEV: isDev,

    // ── API ──────────────────────────────
    API_BASE: isDev
      ? `${DEV_BASE}/api`
      : 'https://api.ganitsutram.com/api',

    // ── Site URLs ────────────────────────
    PORTAL_URL: isDev
      ? `${DEV_BASE}/portal`
      : 'https://ganitsutram.com',

    SOLVER_URL: isDev
      ? `${DEV_BASE}/solver`
      : 'https://solve.ganitsutram.com',

    LEARN_URL: isDev
      ? `${DEV_BASE}/learning`
      : 'https://learn.ganitsutram.com',

    DISCOVER_URL: isDev
      ? `${DEV_BASE}/discoveries`
      : 'https://discover.ganitsutram.com',

    MAP_URL: isDev
      ? `${DEV_BASE}/knowledge-map`
      : 'https://map.ganitsutram.com',

    LAB_URL: isDev
      ? `${DEV_BASE}/research-lab`
      : 'https://lab.ganitsutram.com',

    // ── Canonical base (for SEO) ─────────
    CANONICAL_BASE: isDev
      ? DEV_BASE
      : 'https://ganitsutram.com',

    // ── SSE stream URL ───────────────────
    SSE_URL: isDev
      ? `${DEV_BASE}/api/notifications/stream`
      : 'https://api.ganitsutram.com/api/notifications/stream',

    // ── Feature flags ────────────────────
    ENABLE_ANALYTICS_BEACON: !isDev,
    ENABLE_SW: !isDev,       // service workers prod only
    LOG_LEVEL: isDev ? 'debug' : 'error'
  };

  // Freeze to prevent accidental mutation
  return Object.freeze(config);

})();
