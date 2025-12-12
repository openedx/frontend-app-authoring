#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.css', '.scss', '.html', '.md', '.yml', '.yaml', '.rst',
]);

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(ent.name)) {
        walk(full, cb);
      }
    } else {
      cb(full);
    }
  }
}

let changed = 0;
walk(root, (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!exts.has(ext)) { return; }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('\r\n')) {
      const normalized = content.replace(/\r\n/g, '\n');
      fs.writeFileSync(filePath, normalized, 'utf8');
      process.stdout.write(`Normalized EOL to LF: ${path.relative(root, filePath)}\n`);
      changed += 1;
    }
  } catch (err) {
    // ignore binary read errors etc.
  }
});

process.stdout.write(`Done. ${changed} files updated.\n`);
if (changed > 0) { process.exitCode = 0; }
