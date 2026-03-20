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

const files = walk(path.join(__dirname, '../websites'));
let changed = 0;

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;
  
  // Fix deep nested seo.js
  c = c.replace(/src="\.\.\/\.\.\/ui-core\/js\/seo\.js"/g, 'src="../ui-core/js/seo.js"');
  
  // Inject config.js if ganit-ui.js exists but config.js does not
  if (c.includes('ganit-ui.js') && !c.includes('config.js')) {
    // We target the i18n script tag to insert config BEFORE it
    c = c.replace(/<script src="([^"]*?)i18n\.js" defer><\/script>/g, '<script src="$1config.js" defer></script>\n    <script src="$1i18n.js" defer></script>');
  }
  
  if(c !== orig) {
     fs.writeFileSync(f, c, 'utf8');
     console.log('Fixed HTML SCRIPTS:', f);
     changed++;
  }
});
console.log('Total fixed:', changed);
