const fs = require('fs');
const path = require('path');
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const dirs = ['app', 'components', 'features'];

let updatedFiles = 0;

function processDir(dir) {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) return;
  for (const item of fs.readdirSync(fullPath)) {
    const itemPath = path.join(fullPath, item);
    if (fs.statSync(itemPath).isDirectory()) {
      processDir(itemPath);
    } else if (extensions.includes(path.extname(itemPath))) {
      let content = fs.readFileSync(itemPath, 'utf8');
      
      let newContent = content.replace(/@import url\(['"]https:\/\/fonts\.googleapis\.com.*?['"]\);\n?/g, '');
      newContent = newContent.replace(/\.fp-root\s*\{\s*font-family:[^}]*\}\n?/g, '');
      newContent = newContent.replace(/\.serif\s*\{\s*font-family:[^}]*\}\n?/g, '');
      
      if (content !== newContent) {
        fs.writeFileSync(itemPath, newContent);
        console.log('Cleaned inline CSS in:', itemPath);
        updatedFiles++;
      }
    }
  }
}
dirs.forEach(processDir);
console.log(`Cleanup complete. Updated ${updatedFiles} files.`);
