const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('ui-core')) {
                results = results.concat(walk(fullPath));
            }
        } else if (file.endsWith('.html')) {
            results.push(fullPath);
        }
    });
    return results;
}

const websitesDir = path.join(__dirname, '../websites');
const files = walk(websitesDir);

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativeFromWebsites = path.relative(websitesDir, filePath);
    const depth = relativeFromWebsites.split(path.sep).length - 1;
    
    // Base path to websites/
    const toWebsites = depth === 0 ? './' : '../'.repeat(depth);
    const toUiCore = toWebsites + 'ui-core/';
    
    // 1. Standardize Critical CSS
    const criticalCssRegex = /<style id="gs-critical-css">[\s\S]*?<\/style>/;
    const newCriticalCss = `
    <style id="gs-critical-css">
        :root { --bg-deep: #040110; --fg-main: #ffffff; --accent-primary: #ff5500; }
        body { margin: 0; background: var(--bg-deep); color: var(--fg-main); min-height: 100vh; }
        .gs-nav { position: fixed; width: 100%; z-index: 1000; background: rgba(4,1,16,0.95); min-height: 72px; }
    </style>`;
    if (criticalCssRegex.test(content)) {
        content = content.replace(criticalCssRegex, newCriticalCss.trim());
    }

    // 2. Standardize Header (Unified for all modules)
    // IMPORTANT: The Logo now leads to GATE.HTML
    const navRegex = /<header class="gs-nav">[\s\S]*?<\/header>/;
    const newNav = `
    <header class="gs-nav">
        <div class="gs-nav-inner">
            <a href="${toWebsites}portal/index.html" class="gs-nav-logo">
                <span class="gs-nav-logo-dev">गणित</span>GanitSūtram
            </a>
            <nav class="gs-nav-links">
                <div class="nav-right" style="display:flex; align-items:center;">
                    <div class="gs-lang-switcher" id="langSwitcher">
                        <button class="gs-lang-btn active" data-lang="en">EN</button>
                        <button class="gs-lang-btn" data-lang="hi">हि</button>
                        <button class="gs-lang-btn" data-lang="sa">सं</button>
                    </div>
                    <button class="nav-link btn-ghost" onclick="window.GanitAuth ? window.GanitAuth.openModal('login') : location.href='${toWebsites}portal/index.html#login'\"
                        data-i18n="nav.signIn">Sign In</button>
                    <a href="${toWebsites}portal/index.html" class="gs-nav-cta" data-i18n="nav.enterPlatform">Enter Platform &rarr;</a>
                </div>
            </nav>
            <button class="gs-nav-hamburger"
                onclick="document.querySelector('.gs-nav-links').classList.toggle('active')">☰</button>
        </div>
    </header>`;
    
    if (navRegex.test(content)) {
        content = content.replace(navRegex, newNav.trim());
    }

    // 3. Standardize Footer
    const footerRegex = /<footer class="gs-footer">[\s\S]*?<\/footer>/;
    const newFooter = `
    <footer class="gs-footer">
        <div class="gs-footer-inner">
            <div class="gs-footer-brand">
                <div class="gs-nav-logo">
                    <span class="gs-nav-logo-dev">गणित</span>GanitSūtram
                </div>
                <p data-i18n="footer.tagline">A mathematical knowledge ecosystem by AITDL.</p>
            </div>
            <div class="gs-footer-links">
                <a href="${toWebsites}portal/index.html" data-i18n="footer.portal">Portal</a>
                <a href="${toWebsites}discoveries/index.html" data-i18n="nav.discover">Discover</a>
                <a href="${toWebsites}learning/index.html" data-i18n="nav.learn">Learn</a>
                <a href="${toWebsites}knowledge-map/index.html" data-i18n="nav.map">Map</a>
                <a href="${toWebsites}research-lab/index.html" data-i18n="nav.lab">Lab</a>
                <a href="${toWebsites}solver/index.html" data-i18n="nav.solver">Solver</a>
                <a href="${toWebsites}learning/leaderboard.html" data-i18n="nav.leaderboard">Leaderboard</a>
                <a href="${toWebsites}learning/profile.html" data-i18n="nav.myProfile">Profile</a>
                <a href="${toWebsites}portal/api-docs.html" data-i18n="nav.apiDocs">API Docs</a>
            </div>
        </div>
        <div class="gs-footer-copy">
            <span data-i18n="footer.copyright">© GanitSūtram | AITDL | aitdl.com</span> &nbsp;|&nbsp;
            <span data-i18n="footer.date">Vikram Samvat: VS 2082 &nbsp;|&nbsp; Gregorian: 2026-03-07</span>
            <br><span data-i18n="footer.rights">All Rights Reserved.</span> <span
                data-i18n="footer.restriction">Unauthorized copying, reproduction, redistribution, or reuse of this software,
                algorithms, or educational content is prohibited without written permission from AITDL.</span>
        </div>
    </footer>`;

    if (footerRegex.test(content)) {
        content = content.replace(footerRegex, newFooter.trim());
    }

    // 4. Fix PWA SW Registration
    const swRegex = /navigator\.serviceWorker\.register\(['"](.*?)['"]\)/;
    if (swRegex.test(content)) {
        content = content.replace(swRegex, "navigator.serviceWorker.register('/websites/sw.js')");
    }

    // 5. Fix Paths and and Script loading (Ensuring search.js is present)
    content = content.replace(/(href|src)="(\.\.\/)*ui-core\//g, `$1="${toUiCore}`);
    
    // Script Sequence Standardization
    if (content.includes('i18n.js') && !content.includes('config.js')) {
        content = content.replace(/<script src="([^"]*?)i18n\.js" defer><\/script>/, `<script src="${toUiCore}js/config.js" defer></script>\n    <script src="${toUiCore}js/i18n.js" defer></script>`);
    }
    
    if (content.includes('ganit-ui.js') && !content.includes('search.js')) {
        content = content.replace(/<script src="([^"]*?)ganit-ui\.js" defer><\/script>/, `<script src="${toUiCore}js/search.js" defer></script>\n    <script src="${toUiCore}js/ganit-ui.js" defer></script>`);
    }

    // 6. DEPRECATED: Global Branding Links: portal/index.html -> portal/gate.html
    // The architecture now exclusively enforces index.html as the entry point.
    // (This rewrite rule has been intentionally removed).

    // Clean up redundant inline styles in nav-right if any
    content = content.replace(/<div class="nav-right" style="[^"]*">/g, '<div class="nav-right">');

    fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Ecosystem Standardization & Gateway Migration Complete.');
