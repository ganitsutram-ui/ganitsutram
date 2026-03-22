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

'use strict';

const fs = require('fs');
const path = require('path');

// ─── HEADERS ────────────────────────────────────────────
const HTML_HEADER = `<!--
  GANITSUTRAM
  A Living Knowledge Ecosystem for Mathematical Discovery

  "यथा शिखा मयूराणां नागानां मणयो यथा
   तद्वद् वेदाङ्गशास्त्राणां गणितं मूर्ध्नि वर्तते"

  As the crest of a peacock, as the gem on the hood
  of a cobra — so stands mathematics at the crown
  of all knowledge.
                                        — Brahmagupta
                                          628 CE · Brahmasphutasiddhanta

  Creator:   Jawahar R. Mallah
  Email:     jawahar@aitdl.com
  GitHub:    https://github.com/jawahar-mallah
  Websites:  https://ganitsutram.com
             https://aitdl.com

  Then:  628 CE · Brahmasphutasiddhanta
  Now:   8 March MMXXVI · Vikram Samvat 2082

  Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM

  Developer Note:
  If you intend to reuse this code, please respect
  the creator and the work behind it.
-->
`;

const JS_HEADER = `/*
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
`;

const CSS_HEADER = `/*
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
`;

const MD_HEADER = `<!--
  GANITSUTRAM
  A Living Knowledge Ecosystem for Mathematical Discovery

  Creator:   Jawahar R. Mallah
  Email:     jawahar@aitdl.com
  GitHub:    https://github.com/jawahar-mallah
  Websites:  https://ganitsutram.com
             https://aitdl.com

  Then:  628 CE · Brahmasphutasiddhanta
  Now:   8 March MMXXVI · Vikram Samvat 2082

  Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
-->
`;

// ─── CONFIG ─────────────────────────────────────────────

// Root of the repo (one level up from /tools)
const REPO_ROOT = path.resolve(__dirname, '..');

// Directories to scan (relative to REPO_ROOT)
const TARGET_DIRS = [
    'core',
    'backend',
    'websites',
    'docs',
    'config',
    'tools',
];

// Extension → header
const HEADER_MAP = {
    '.html': HTML_HEADER,
    '.js': JS_HEADER,
    '.css': CSS_HEADER,
    '.md': MD_HEADER,
};

// Directory segments that should be fully skipped
const SKIP_DIR_SEGMENTS = [
    'node_modules',
    '.git',
    'data',          // backend/data/ — DB seeds / migration files
    '.vite',
    'dist',
    'build',
];

// File basenames to skip
const SKIP_FILES = new Set([
    'package-lock.json',
    'package.json',
]);

// Extensions to skip outright
const SKIP_EXTENSIONS = new Set([
    '.json',
    '.env',
    '.txt',
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.woff',
    '.woff2',
    '.ico',
    '.map',
    '.lock',
    '',
]);

// ─── HELPERS ────────────────────────────────────────────

function shouldSkipDir(dirPath) {
    const parts = dirPath.split(path.sep);
    return parts.some(p => SKIP_DIR_SEGMENTS.includes(p));
}

function isAlreadyAttributed(content) {
    // Check first 5 lines for the "GANITSUTRAM" signature
    const firstFiveLines = content.split('\n').slice(0, 5).join('\n');
    return firstFiveLines.includes('GANITSUTRAM');
}

// ─── CORE ───────────────────────────────────────────────

let countUpdated = 0;
let countSkipped = 0;
let countIgnored = 0;

function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const base = path.basename(filePath);

    // Skip by filename
    if (SKIP_FILES.has(base)) {
        countIgnored++;
        return;
    }

    // Skip unsupported extensions
    if (SKIP_EXTENSIONS.has(ext) || !HEADER_MAP[ext]) {
        countIgnored++;
        return;
    }

    const header = HEADER_MAP[ext];

    let content;
    try {
        content = fs.readFileSync(filePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(`  ❌ Could not read: ${filePath} — ${err.message}`);
        countIgnored++;
        return;
    }

    // Idempotency check
    if (isAlreadyAttributed(content)) {
        console.log(`  ⏭️  Already attributed: ${path.relative(REPO_ROOT, filePath)}`);
        countSkipped++;
        return;
    }

    // Prepend header
    const updated = header + content;

    try {
        fs.writeFileSync(filePath, updated, { encoding: 'utf8' });
        console.log(`  ✅ Updated: ${path.relative(REPO_ROOT, filePath)}`);
        countUpdated++;
    } catch (err) {
        console.error(`  ❌ Could not write: ${filePath} — ${err.message}`);
        countIgnored++;
    }
}

function walkDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.log(`  ⚠️  Directory not found, skipping: ${dirPath}`);
        return;
    }

    let entries;
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (err) {
        console.error(`  ❌ Cannot read directory: ${dirPath} — ${err.message}`);
        return;
    }

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (shouldSkipDir(fullPath)) {
                continue; // skip silently
            }
            walkDir(fullPath);
        } else if (entry.isFile()) {
            processFile(fullPath);
        }
    }
}

// ─── MAIN ───────────────────────────────────────────────

console.log('\n🔤  GanitSūtram Attribution Script');
console.log('    ─────────────────────────────────');
console.log(`    Repo root: ${REPO_ROOT}\n`);

for (const dir of TARGET_DIRS) {
    const absDir = path.join(REPO_ROOT, dir);
    console.log(`📁  Scanning: ${dir}/`);
    walkDir(absDir);
    console.log('');
}

const total = countUpdated + countSkipped + countIgnored;

console.log('─────────────────────────────────────────');
console.log(`✅  Updated:  ${countUpdated} files`);
console.log(`⏭️   Skipped:  ${countSkipped} files (already attributed)`);
console.log(`🚫  Ignored:  ${countIgnored} files (unsupported type)`);
console.log('─────────────────────────────────────────');
console.log(`    Total files processed: ${total}\n`);
