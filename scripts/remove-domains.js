const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..');

const replacePatterns = [
    { regex: /['"]https:\/\/api\.ganitsutram\.com(?:\/api)?['"]/g, replacement: "'http://localhost:3000/api'" },
    { regex: /['"]https:\/\/(?:www\.)?ganitsutram\.com['"]/g, replacement: "'http://localhost:5173'" },
    { regex: /['"]https:\/\/.*?\.ganitsutram\.com['"]/g, replacement: "''" }, // Other subdomains reset
    { regex: /<link rel="dns-prefetch" href="\/\/api\.ganitsutram\.com">/g, replacement: "" },
    { regex: /ALLOWED_ORIGINS=https:\/\/ganitsutram\.com.*/g, replacement: "ALLOWED_ORIGINS=http://localhost:5173" }
];

function processPath(currentPath) {
    const stats = fs.statSync(currentPath);

    if (stats.isDirectory()) {
        if (currentPath.includes('node_modules') || currentPath.includes('.git') || currentPath.includes('.vite')) {
            return;
        }
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            processPath(path.join(currentPath, file));
        }
    } else if (stats.isFile()) {
        const ext = path.extname(currentPath);
        if (['.js', '.html', '.css', '.env', '.json', '.md'].includes(ext)) {
            let content = fs.readFileSync(currentPath, 'utf8');
            let modified = false;

            for (const { regex, replacement } of replacePatterns) {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(currentPath, content, 'utf8');
                console.log(`Updated: ${currentPath}`);
            }
        }
    }
}

console.log("Starting domain removal...");
processPath(targetDir);
console.log("Domain removal complete.");
