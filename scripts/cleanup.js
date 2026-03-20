const fs = require('fs');

let content = fs.readFileSync('websites/portal/index.html', 'utf8');

const regexNav = /<a href='(?:[^']*)' data-i18n="nav\.discover">[\s\S]*?<a href="api-docs\.html" data-i18n="nav\.apiDocs">API Docs<\/a>\s+/;

const newFooter = `<div class="gs-footer-links">
                <a href="../discoveries/index.html" data-i18n="nav.discover">Discover</a>
                <a href="../learning/index.html" data-i18n="nav.learn">Learn</a>
                <a href="../knowledge-map/index.html" data-i18n="nav.map">Map</a>
                <a href="../research-lab/index.html" data-i18n="nav.lab">Lab</a>
                <a href="../solver/index.html" data-i18n="nav.solver">Solver</a>
                <a href="../learning/leaderboard.html" data-i18n="nav.leaderboard">Leaderboard</a>
                <a href="../learning/profile.html" data-i18n="nav.myProfile">Profile</a>
                <a href="api-docs.html" data-i18n="nav.apiDocs">API Docs</a>
            </div>`;

const regexFooter = /<div class="gs-footer-links">[\s\S]*?<\/div>/;

if(regexNav.test(content)) {
    content = content.replace(regexNav, '');
    content = content.replace(regexFooter, newFooter);
    
    // Also re-apply the config script injection if it was overwritten by git checkout
    if (content.includes('ganit-ui.js') && !content.includes('config.js')) {
        content = content.replace(/<script src="\.\.\/ui-core\/js\/i18n\.js" defer><\/script>/, '<script src="../ui-core/js/config.js" defer></script>\n    <script src="../ui-core/js/i18n.js" defer></script>');
    }
    
    fs.writeFileSync('websites/portal/index.html', content, 'utf8');
    console.log('Successfully surgicalized index.html footer');
} else {
    console.log('Nav pattern not found - ensure it was restored correctly.');
}
