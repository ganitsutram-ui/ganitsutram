const fs = require('fs');
const path = require('path');

const SIGNATURE = `/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/
`;

const TARGET_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.css', '.html'];
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'myarchive', 'myarchives', 'dist', 'build'];

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if file already contains the signature
        if (!content.includes('AITDL Network')) {
            content = SIGNATURE + '\n' + content;
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✔ Signature added: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

function scanDir(dir) {
    if (IGNORE_DIRS.some(ignored => dir.endsWith(ignored) || dir.includes(path.sep + ignored + path.sep))) {
        return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else {
            const ext = path.extname(file);
            if (TARGET_EXTENSIONS.includes(ext)) {
                processFile(fullPath);
            }
        }
    });
}

// Start from the project root
const projectRoot = path.join(__dirname, '..');
console.log(`🚀 Starting signature enforcement in: ${projectRoot}`);
scanDir(projectRoot);
console.log('✅ Signature enforcement complete.');
