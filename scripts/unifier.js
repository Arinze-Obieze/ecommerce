const fs = require('fs');
const path = require('path');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const dirs = ['app', 'components', 'features'];

let updatedFiles = 0;

function processDir(dir) {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) return;
  const items = fs.readdirSync(fullPath);
  for (const item of items) {
    const itemPath = path.join(fullPath, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      processDir(itemPath);
    } else if (extensions.includes(path.extname(itemPath))) {
      let content = fs.readFileSync(itemPath, 'utf8');
      
      let newContent = content;
      // 1. Remove fontFamily: 'something'
      const RegexFontFamilyObj = /fontFamily\s*:\s*(['"`])[^'"`]*\1\s*,?\s*/g;
      
      // 2. Remove fontFamily: "inherhit" and similar
      const RegexFontFamilyInherit = /fontFamily\s*:\s*[^,}]*,?\s*/g;
      
      // A safer regex for inline fontFamily styles:
      newContent = newContent.replace(/fontFamily\s*:\s*.*?,\s*/g, '');
      newContent = newContent.replace(/,\s*fontFamily\s*:\s*.*?\s*}/g, ' }');
      newContent = newContent.replace(/{\s*fontFamily\s*:\s*.*?\s*}/g, '{}');
      newContent = newContent.replace(/fontFamily\s*:\s*['"`][^'"`]*['"`]\s*\}?/g, (match) => match.endsWith('}') ? '}' : '');
      
      // Replace inline occurrences where it might leave trailing chars
      // We will do a generic replacement for standard patterns found in our search:
      newContent = newContent.replace(/fontFamily:\s*['"]?Outfit[^'"]*['"]?,?\s*/gi, '');
      newContent = newContent.replace(/fontFamily:\s*['"]?[^'"]*(Poppins|Playfair Display|Segoe UI)[^'"]*['"]?,?\s*/gi, '');
      newContent = newContent.replace(/fontFamily:\s*['"]inherit['"],?\s*/gi, '');
      newContent = newContent.replace(/fontFamily:\s*['"`]?[^'"{}]*['"`]?,?\s*/gi, '');

      // Quick fix for empty styles created by above regexes
      newContent = newContent.replace(/style=\{\{\s*\}\}/g, '');

      if (content !== newContent) {
        fs.writeFileSync(itemPath, newContent);
        console.log('Cleaned fonts in:', itemPath);
        updatedFiles++;
      }
    }
  }
}

dirs.forEach(processDir);
console.log(`\nTypography unification complete. Updated ${updatedFiles} files.`);
