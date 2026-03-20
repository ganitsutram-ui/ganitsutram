const fs = require('fs');
const path = require('path');

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

const websitesDir = path.join(__dirname, '../websites');
const files = walk(websitesDir);

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativeFromWebsites = path.relative(websitesDir, filePath);
    const depth = relativeFromWebsites.split(path.sep).length - 1;
    
    // Base path to websites/
    const toWebsites = depth === 0 ? './' : '../'.repeat(depth);
    const toUiCore = toWebsites + 'ui-core/';
    
    // 1. Standardize Header
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
                    <button class="nav-link btn-ghost" onclick="window.GanitAuth ? window.GanitAuth.openModal('login') : location.href='${toWebsites}portal/index.html#login'"
                        data-i18n="nav.signIn">Sign In</button>
                    <a href="${toWebsites}portal/gate.html" class="gs-nav-cta" data-i18n="nav.enterPlatform">Enter Platform &rarr;</a>
                </div>
            </nav>
            <button class="gs-nav-hamburger"
                onclick="document.querySelector('.gs-nav-links').classList.toggle('active')">☰</button>
        </div>
    </header>`;
    
    if (navRegex.test(content)) {
        content = content.replace(navRegex, newNav.trim());
    }

    // 2. Standardize Footer
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

    // 3. Fix Portal Cards (only in index.html)
    if (relativeFromWebsites === 'portal/index.html') {
        const cardMap = {
            'Discoveries': '../discoveries/index.html',
            'Knowledge Map': '../knowledge-map/index.html',
            'Learning': '../learning/index.html',
            'Research Lab': '../research-lab/index.html',
            'Leaderboard': '../learning/leaderboard.html',
            'Solver': '../solver/index.html'
        };

        Object.keys(cardMap).forEach(key => {
            const regex = new RegExp(`<a href=['"]['"] class="gs-platform-card">\\s+<span class="gs-card-icon">[^<]+<\\/span>\\s+<h3>${key}<\\/h3>`, 'g');
            content = content.replace(regex, `<a href="${cardMap[key]}" class="gs-platform-card">\n                    <span class="gs-card-icon">icon</span>\n                    <h3>${key}</h3>`);
        });

        // Also fix the text labels like discover.ganitsutram.com
        content = content.replace(/discover\.ganitsutram\.com/g, 'ganitsutram.com/discover');
        content = content.replace(/map\.ganitsutram\.com/g, 'ganitsutram.com/map');
        content = content.replace(/learn\.ganitsutram\.com/g, 'ganitsutram.com/learn');
        content = content.replace(/lab\.ganitsutram\.com/g, 'ganitsutram.com/lab');
        content = content.replace(/solve\.ganitsutram\.com/g, 'ganitsutram.com/solve');
    }

    // 4. Normalize Meta Tags (Remove absolute domain)
    content = content.replace(/https:\/\/ganitsutram\.com\//g, '/');

    // 5. Fix Scripts and CSS paths
    content = content.replace(/(href|src)="(\.\.\/)*ui-core\//g, `$1="${toUiCore}`);
    
    // Ensure config.js is before i18n.js
    if (content.includes('i18n.js') && !content.includes('config.js')) {
        content = content.replace(/<script src="([^"]*?)i18n\.js" defer><\/script>/, `<script src="${toUiCore}js/config.js" defer></script>\n    <script src="${toUiCore}js/i18n.js" defer></script>`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Standardized: ${relativeFromWebsites}`);
});
