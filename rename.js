const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.jsx')) {
    const isJsx = file.endsWith('.jsx');
    const newExt = isJsx ? '.tsx' : '.ts'; // Could optionally check if .js contains JSX
    
    // Actually, everything component-related in this project should be .tsx as it's safer.
    const content = fs.readFileSync(file, 'utf-8');
    const hasJsxSyntax = content.includes('<') && content.includes('/>') || file.endsWith('.jsx');
    
    const finalExt = hasJsxSyntax ? '.tsx' : '.ts';
    
    const newFile = file.slice(0, file.lastIndexOf('.')) + finalExt;
    
    // Only rename if it's not already TS
    if (file !== newFile) {
      fs.renameSync(file, newFile);
      console.log(`Renamed: ${path.basename(file)} -> ${path.basename(newFile)}`);
    }
  }
});
