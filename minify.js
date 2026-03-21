const fs = require('fs');
const path = require('path');

function minifyCSS(str) {
    return str.replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '')
              .replace(/\s+/g, ' ')
              .replace(/\{\s+/g, '{')
              .replace(/\s+\}/g, '}')
              .replace(/;\s+/g, ';')
              .replace(/,\s+/g, ',')
              .replace(/\s+:/g, ':')
              .replace(/:\s+/g, ':');
}

function minifyJS(str) {
    return str.replace(/\/\*[\s\S]*?\*\/|\/\/.*/gm, '')
              .replace(/\n/g, '')
              .replace(/\s{2,}/g, ' ');
}

['static/css', 'static/js', 'templates'].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

try {
    fs.writeFileSync('static/css/main.min.css', minifyCSS(fs.readFileSync('websites/ui-core/css/main.css', 'utf8')));
    fs.writeFileSync('static/css/portal.min.css', minifyCSS(fs.readFileSync('websites/ui-core/css/portal.css', 'utf8')));
    fs.writeFileSync('static/js/ganit-ui.min.js', minifyJS(fs.readFileSync('websites/ui-core/js/ganit-ui.js', 'utf8')));
    fs.writeFileSync('static/js/solver.min.js', minifyJS(fs.readFileSync('websites/ui-core/js/solver.js', 'utf8')));

    let homeHtml = fs.readFileSync('websites/portal/index.html', 'utf8');
    homeHtml = homeHtml.replace(/\.\.\/ui-core\/css\/main\.css/g, '/static/css/main.min.css')
                       .replace(/\.\.\/ui-core\/css\/portal\.css/g, '/static/css/portal.min.css')
                       .replace(/\.\.\/ui-core\/js\/ganit-ui\.js/g, '/static/js/ganit-ui.min.js');
    fs.writeFileSync('templates/home.html', homeHtml);

    console.log("Minification Sequence Complete.");
} catch (e) {
    console.error("Minification build error:", e);
}
