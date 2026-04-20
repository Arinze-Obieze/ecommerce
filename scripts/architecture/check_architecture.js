#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.next' || entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(fullPath, acc);
      continue;
    }
    acc.push(fullPath);
  }
  return acc;
}

function rel(p) {
  return path.relative(root, p).replaceAll(path.sep, '/');
}

const allFiles = walk(path.join(root, 'app'));

const invalidApiUiFiles = allFiles
  .map(rel)
  .filter((p) => p.startsWith('app/api/'))
  .filter((p) => /\/(page|layout)\.(js|jsx|ts|tsx)$/.test(p));

const disallowedResponsibilityDirs = [
  'features/home',
  'features/shop',
  'components/shop',
  'components/store',
].filter((dir) => fs.existsSync(path.join(root, dir)));

const jsLikeFiles = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'components'))]
  .map(rel)
  .filter((p) => /\.(js|jsx|ts|tsx)$/.test(p));

const OVERSIZE_THRESHOLD = 1000;
const oversizeFiles = [];
for (const file of jsLikeFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const lines = text.split('\n').length;
  if (lines > OVERSIZE_THRESHOLD) {
    oversizeFiles.push({ file, lines });
  }
}

let hasError = false;

if (invalidApiUiFiles.length > 0) {
  hasError = true;
  console.error('Architecture check failed: UI files found under app/api (route handlers only allowed):');
  for (const file of invalidApiUiFiles) {
    console.error(`  - ${file}`);
  }
}

if (disallowedResponsibilityDirs.length > 0) {
  hasError = true;
  console.error('Architecture check failed: ambiguous legacy responsibility folders found:');
  for (const dir of disallowedResponsibilityDirs) {
    console.error(`  - ${dir}`);
  }
  console.error('Use features/storefront/home, features/catalog/browse, components/catalog/browse, components/storefront/stores, or components/store-console instead.');
}

if (oversizeFiles.length > 0) {
  console.warn(`Architecture warning: files over ${OVERSIZE_THRESHOLD} lines:`);
  oversizeFiles
    .sort((a, b) => b.lines - a.lines)
    .forEach(({ file, lines }) => {
      console.warn(`  - ${file} (${lines} lines)`);
    });
}

if (hasError) {
  process.exit(1);
}

console.log('Architecture check passed.');
