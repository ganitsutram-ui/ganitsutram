const fs = require('fs');
const path = require('path');

function generateTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    let output = '';
    const filtered = files.filter(f => !['node_modules', '.git', '.antigravity', '.gemini'].includes(f));
    
    // Process directories first, then files
    filtered.sort((a,b) => {
        const isDirA = fs.statSync(path.join(dir, a)).isDirectory();
        const isDirB = fs.statSync(path.join(dir, b)).isDirectory();
        if (isDirA === isDirB) return a.localeCompare(b);
        return isDirA ? -1 : 1;
    });

    filtered.forEach((file, index) => {
        const isLast = index === filtered.length - 1;
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        
        output += prefix + (isLast ? '\\u2514\\u2500\\u2500 ' : '\\u251C\\u2500\\u2500 ') + file + '\n';
        
        if (stats.isDirectory()) {
            output += generateTree(fullPath, prefix + (isLast ? '    ' : '\\u2502   '));
        }
    });
    return output;
}

const root = 'd:\\IMP\\GitHub\\ganitsutram';
const treeStr = 'GanitSūtram Architecture (v2 Fast-API Transition)\n' + generateTree(root);
fs.writeFileSync(path.join(root, 'tree-output.txt'), treeStr);
console.log('Tree successfully written to tree-output.txt');
