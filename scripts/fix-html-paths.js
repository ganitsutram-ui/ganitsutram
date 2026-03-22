/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'index.html');

if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Replace absolute paths referencing repo folders with relative
    content = content.replace(/href="\/websites\//g, 'href="./websites/');
    content = content.replace(/src="\/websites\//g, 'src="./websites/');
    
    content = content.replace(/href="\/assets\//g, 'href="./assets/');
    content = content.replace(/src="\/assets\//g, 'src="./assets/');
    
    content = content.replace(/href="\/docs\//g, 'href="./docs/');
    content = content.replace(/src="\/docs\//g, 'src="./docs/');

    content = content.replace(/href="\/g\.html/g, 'href="./index.html');
    
    fs.writeFileSync(indexHtmlPath, content, 'utf8');
    console.log('Fixed paths in index.html');
} else {
    console.log('index.html not found');
}
