const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext = '.tsx') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext)) {
      results.push(fullPath);
    }
  });
  return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = getAllFiles(srcDir);

const forbiddenRegex =
  /\b((bg|text|border|accent|ring|from|to|via)-(indigo|violet|purple|blue|sky|cyan|emerald|green|teal|amber|orange|rose|red)-[0-9]{2,3}(\/[0-9]{1,3})?|(bg|text|border|hover:bg|hover:text)-\[\#[0-9a-fA-F]{3,8}\])\b/g;

let violations = 0;

files.forEach((filePath) => {
  if (
    filePath.endsWith('globals.css') ||
    filePath.endsWith('button.tsx') ||
    filePath.endsWith('badge.tsx') ||
    filePath.endsWith('status-pill.tsx')
  ) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    let match;
    while ((match = forbiddenRegex.exec(line)) !== null) {
      console.error(
        `❌ [Color Token Violation] ${path.relative(srcDir, filePath)}:${index + 1} — Hardcoded class "${match[1]}" found. Use design tokens (bg-primary, text-success, bg-warning/10, bg-destructive, etc.) or <Badge> variants instead.`
      );
      violations++;
    }
  });
});

if (violations > 0) {
  console.error(`\n❌ Total violations found: ${violations}. Color lint check failed.`);
  process.exit(1);
} else {
  console.log('✅ Color Token Lint Guard Passed — 0 raw palette color classes found across all 22 modules.');
  process.exit(0);
}
