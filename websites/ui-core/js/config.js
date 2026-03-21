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
  const DEV_BASE = window.location.origin;

  // For GitHub Pages, detect if we are in a subfolder (e.g. /ganitsutram)
  const BASE_PATH = window.location.pathname.startsWith('/ganitsutram') ? '/ganitsutram' : '';

  // Railway API URL goes here. Replace this when deployed.
  window.RAILWAY_URL = 'https://ganitsutram-production.up.railway.app';

  const config = {
    IS_DEV: isDev,

    // ── API ──────────────────────────────
    API_BASE: isDev
      ? `${DEV_BASE}/api`
      : `${window.RAILWAY_URL}/api`,

    // ── Site URLs ────────────────────────
    PORTAL_URL: isDev
      ? `${DEV_BASE}${window.location.port === '5173' ? '/websites' : ''}/portal`
      : `${BASE_PATH}/websites/portal`,

    SOLVER_URL: isDev
      ? `${DEV_BASE}${window.location.port === '5173' ? '/websites' : ''}/solver`
      : `${BASE_PATH}/websites/solver`,

    LEARN_URL: isDev
      ? `${DEV_BASE}${window.location.port === '5173' ? '/websites' : ''}/learning`
      : `${BASE_PATH}/websites/learning`,

    DISCOVER_URL: isDev
      ? `${DEV_BASE}${window.location.port === '5173' ? '/websites' : ''}/discoveries`
      : `${BASE_PATH}/websites/discoveries`,

    MAP_URL: isDev
      ? `${DEV_BASE}${window.location.port === '5173' ? '/websites' : ''}/knowledge-map`
      : `${BASE_PATH}/websites/knowledge-map`,

    LAB_URL: isDev
      ? `${DEV_BASE}${window.location.port === '5173' ? '/websites' : ''}/research-lab`
      : `${BASE_PATH}/websites/research-lab`,

    // ── Canonical base (for SEO) ─────────
    CANONICAL_BASE: isDev
      ? DEV_BASE
      : `${BASE_PATH}`,

    // ── SSE stream URL ───────────────────
    SSE_URL: isDev
      ? `${DEV_BASE}/api/notifications/stream`
      : `${window.RAILWAY_URL}/api/notifications/stream`,

    // ── Feature flags ────────────────────
    ENABLE_ANALYTICS_BEACON: !isDev,
    ENABLE_SW: !isDev,       // service workers prod only
    LOG_LEVEL: isDev ? 'debug' : 'error',
    getBasePath: () => BASE_PATH ? `${BASE_PATH}/websites/` : '/websites/',
    getApiBase: () => isDev ? `${DEV_BASE}/api` : `${window.RAILWAY_URL}/api`
  };

  // Freeze to prevent accidental mutation
  return Object.freeze(config);

})();
