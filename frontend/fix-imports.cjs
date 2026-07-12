const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match imports from anything ending in .types
  const newContent = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+\.types)['"]/g, 'import type { $1 } from \'$2\'');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated ' + file);
  }
});
