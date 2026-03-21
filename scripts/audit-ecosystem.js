const fs = require('fs');
const path = require('path');

const websitesDir = path.join(__dirname, '../websites');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk(websitesDir);
let report = [];

htmlFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(websitesDir, filePath);
    const errors = [];

    // 1. Script Order check
    const configIndex = content.indexOf('config.js');
    const i18nIndex = content.indexOf('i18n.js');
    if (configIndex !== -1 && i18nIndex !== -1 && i18nIndex < configIndex) {
        errors.push('CRITICAL: i18n.js loaded BEFORE config.js');
    }

    // 2. Absolute domain check (should be relative)
    if (content.match(/href="https?:\/\/ganitsutram\.com/)) {
        errors.push('WARNING: Hardcoded absolute domain in href');
    }
    if (content.match(/src="https?:\/\/ganitsutram\.com/)) {
        errors.push('WARNING: Hardcoded absolute domain in src');
    }

    // 3. UI-Core Path check
    const uiCoreMatch = content.match(/(href|src)="(\.\.\/)*ui-core/);
    if (!uiCoreMatch) {
        // Some pages might not use ui-core, but most should
        if (!relativePath.includes('portal/index.html')) {
            errors.push('INFO: No relative ui-core reference found');
        }
    }

    // 4. Mandatory SEO check
    if (!content.includes('Jawahar R Mallah')) errors.push('SEO: Missing author tag');
    if (!content.includes('AITDL')) errors.push('SEO: Missing company tag');
    if (!content.includes('GanitSūtram')) errors.push('SEO: Missing project tag');

    // 5. Empty links check
    const emptyLinks = content.match(/href=['"]['"]/g);
    if (emptyLinks && !relativePath.includes('portal/index.html')) {
        errors.push(`NOTICE: Found ${emptyLinks.length} empty href links`);
    }

    if (errors.length > 0) {
        report.push(`### [${relativePath}]\n` + errors.map(e => `- [ ] ${e}`).join('\n'));
    }
});

const reportPath = path.join(__dirname, '../audit_report.md');
fs.writeFileSync(reportPath, '# GanitSūtram Audit Report\n\n' + report.join('\n\n'));
console.log(`Audit complete. Report generated at ${reportPath}`);
