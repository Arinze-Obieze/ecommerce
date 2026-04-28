/**
 * brand-refactor.js — safe, eval-free THEME eliminator
 *
 * Strategy:
 * 1. Find every `const THEME = { ... }` (or const T = { ... }) via balanced-brace scanning.
 * 2. Extract key→value pairs with a regex that captures multi-line, nested strings.
 * 3. Sort keys longest-first so "colors.greenTint" is replaced before "colors.green".
 * 4. Replace all THEME.key (and THEME.colors.key etc.) usages with the resolved value.
 * 5. Remove the declaration block.
 * 6. Also do simple tailwind-arbitrary-value swaps and common inline hex replacements.
 */

const fs = require('fs');
const path = require('path');

// ── Directories ─────────────────────────────────────────────────────────────
const DIRECTORIES = ['app', 'components', 'contexts', 'features'];
const IGNORE_DIRS  = ['node_modules', '.git', '.next', 'scripts'];
const ROOT = '/home/arinze/Desktop/Programming/Works/ecommerce';

// ── Tailwind class swaps ─────────────────────────────────────────────────────
const TAILWIND_SWAPS = [
  [/([a-z0-9\-]+)-\[\#2[Ee]6417\]/g, '$1-primary'],
  [/([a-z0-9\-]+)-\[\#245213\]/g,    '$1-primary-hover'],
  [/([a-z0-9\-]+)-\[\#[Ee][Dd][Ff]5[Ee]6\]/g, '$1-primary-soft'],
  [/([a-z0-9\-]+)-\[\#[Ee][Cc]9[Cc]00\]/g,    '$1-accent'],
  [/([a-z0-9\-]+)-\[\#[Dd]48[Cc]00\]/g,       '$1-accent-hover'],
  [/([a-z0-9\-]+)-\[\#[Ff]5[Ff]1[Ee][Aa]\]/g, '$1-background-alt'],
  [/([a-z0-9\-]+)-\[\#191[Bb]19\]/g,           '$1-text'],
];

// ── Inline hex → CSS var ─────────────────────────────────────────────────────
const HEX_SWAPS = [
  [/#2[Ee]6417/g,  'var(--color-primary)'],
  [/#245213/g,     'var(--color-primary-hover)'],
  [/#[Ee][Dd][Ff]5[Ee]6/g, 'var(--color-primary-soft)'],
  [/#[Ee][Cc]9[Cc]00/g,    'var(--color-accent)'],
  [/#[Dd]48[Cc]00/g,       'var(--color-accent-hover)'],
  [/#[Ff]5[Ff]1[Ee][Aa]/g, 'var(--color-background-alt)'],
  [/#191[Bb]19/g,           'var(--color-text)'],
];

// ── Font swaps ───────────────────────────────────────────────────────────────
const FONT_SWAPS = [
  [/font-outfit\b/g, 'font-sans'],
  [/font-poppins\b/g, 'font-sans'],
  // Don't globally replace "Outfit" text string since it may be in comments/docs
];

// ── Balanced-brace extractor ─────────────────────────────────────────────────
// Returns the substring from `start` that covers a balanced { ... } block.
function extractBraceBlock(src, start) {
  let depth = 0, i = start;
  let inSingle = false, inDouble = false, inTemplate = false;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && (inSingle || inDouble || inTemplate)) { i += 2; continue; }
    if (c === "'" && !inDouble && !inTemplate) { inSingle = !inSingle; i++; continue; }
    if (c === '"' && !inSingle && !inTemplate) { inDouble = !inDouble; i++; continue; }
    if (c === '`' && !inSingle && !inDouble) { inTemplate = !inTemplate; i++; continue; }
    if (!inSingle && !inDouble && !inTemplate) {
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
    }
    i++;
  }
  return null;
}

// ── Key-value extractor (handles strings only, skips nested objects) ──────────
// Returns a flat map of dotted-path keys → string values
function extractThemeMap(blockStr) {
  const map = {};
  // We'll walk it manually parsing a simplified JS object
  // Strategy: find patterns like  word: 'value'  or  word: "value"  recursively
  function parseBlock(src, prefix) {
    // Find key: value entries
    // Key can be a word optionally followed by sub-object or string/quoted value
    let i = 1; // skip opening {
    while (i < src.length) {
      // Skip whitespace and commas
      while (i < src.length && /[\s,]/.test(src[i])) i++;
      if (src[i] === '}') break;

      // Read key
      const keyMatch = src.slice(i).match(/^([a-zA-Z0-9_]+)\s*:/);
      if (!keyMatch) { i++; continue; }
      const key = keyMatch[1];
      i += keyMatch[0].length;

      // Skip whitespace
      while (i < src.length && /[ \t]/.test(src[i])) i++;

      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (src[i] === '{') {
        // Nested object — recurse
        const sub = extractBraceBlock(src, i);
        if (sub) { parseBlock(sub, fullKey); i += sub.length; }
        else i++;
      } else {
        // String value — capture quoted string (possibly multi-line template)
        const q = src[i];
        if (q === "'" || q === '"' || q === '`') {
          let j = i + 1;
          while (j < src.length) {
            if (src[j] === '\\') { j += 2; continue; }
            if (src[j] === q) break;
            j++;
          }
          const val = src.slice(i + 1, j);
          map[fullKey] = val;
          i = j + 1;
        } else {
          // Non-string value (number, bool, var ref etc.) — skip
          while (i < src.length && !/[,}\n]/.test(src[i])) i++;
        }
      }
    }
  }

  parseBlock(blockStr, '');
  return map;
}

// ── Process a single file ─────────────────────────────────────────────────────
function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  // 1. Tailwind arbitrary swaps (safe — only operates on class strings)
  for (const [pat, rep] of TAILWIND_SWAPS) content = content.replace(pat, rep);

  // 2. Font swaps
  for (const [pat, rep] of FONT_SWAPS) content = content.replace(pat, rep);

  // 3. Find THEME / T = { ... } declarations and resolve usages
  // We scan for `const THEME =` or `const T =` followed by a {
  const declPattern = /const\s+(THEME|T)\s*=\s*(\{)/g;
  let m;
  // collect ranges to delete and replacements, apply after
  const replacements = []; // { start, end, text }
  while ((m = declPattern.exec(content)) !== null) {
    const varName = m[1];
    const braceStart = m.index + m[0].length - 1; // position of {
    const block = extractBraceBlock(content, braceStart);
    if (!block) continue;

    const themeMap = extractThemeMap(block);

    // Sort longest key first to avoid substring collisions
    const sortedKeys = Object.keys(themeMap).sort((a, b) => b.length - a.length);

    // Replace usages of THEME.key.subkey with their resolved value
    for (const key of sortedKeys) {
      let val = themeMap[key];
      // Apply hex swaps on the value itself too
      for (const [hp, hr] of HEX_SWAPS) val = val.replace(hp, hr);

      // Escape the dotted path for regex
      const escapedKey = key.replace(/\./g, '\\.');
      // Match THEME.key (or T.key) not followed by an identifier char
      const usageRe = new RegExp(`\\b${varName}\\.${escapedKey}(?![\\w.])`, 'g');
      content = content.replace(usageRe, `'${val}'`);
    }

    // Mark the entire declaration for removal
    const declEnd = m.index + m[0].length - 1 + block.length;
    // Also consume a preceding comment line like "// Brand tokens..."
    let declStart = m.index;
    // Remove the full `const VARNAME = { ... };` plus optional trailing semicolons/newlines
    replacements.push({ start: declStart, end: declEnd + (content[declEnd] === ';' ? 1 : 0) });
  }

  // Apply declaration removals (in reverse order to preserve indices)
  // But since we already replaced usages in-place, just remove declarations
  if (replacements.length) {
    // Re-scan and remove const THEME = { ... }; blocks
    content = content.replace(/const\s+(THEME|T)\s*=\s*\{[\s\S]*?\};?\n?/g, (match) => {
      // Only remove if it looks like a THEME object (not something else called T)
      if (match.trim().startsWith('const THEME') || match.trim().startsWith('const T ')) return '';
      return match;
    });
  }

  // 4. Inline hex replacements (for inline style={{ color: '#...' }} patterns)
  for (const [pat, rep] of HEX_SWAPS) {
    // Only replace when inside a string literal context (wrapped in quotes)
    content = content.replace(new RegExp(`(['"\`])${pat.source}\\1`, 'gi'), `'${rep}'`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// ── Traverse ─────────────────────────────────────────────────────────────────
function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) traverse(full);
    else if (/\.(jsx?|tsx?)$/.test(file)) processFile(full);
  }
}

for (const d of DIRECTORIES) traverse(path.join(ROOT, d));
console.log('Done.');
