// A script to create a new xblock editor in this repo.
/* eslint no-console: 0 */

// xblock name is is the third argument after node and fedx-scripts
const xblockName = process.argv[2];

// I. Create Editor Files
const fs = require('fs');

const filepath = `src/editors/containers/${xblockName}Editor/index.jsx`;
const contents = fs.readFileSync('./src/example.jsx');

fs.mkdir(`src/editors/containers/${xblockName}Editor/`, { recursive: true }, (err) => {
  if (err) { throw err; }
});

fs.writeFile(filepath, contents, (err) => {
  if (err) { throw err; } else {
    console.log(`Editor is created successfully at ${filepath}`);
  }
});

const openFileToArray = (filename) => {
  const content = fs.readFileSync(filename, 'utf8');
  return content.split('\n');
};

const WriteIntoFile = (path, target, addition) => {
  const contentArray = openFileToArray(path);

  contentArray.every((value, index) => {
    if (value.includes(addition)) {
      return true; // don't add the message in again.p
    }
    if (value.includes(target)) {
      contentArray.splice(index, 0, `${addition}\n`);
      return false;
    }
    return true;
  });
  const newContent = contentArray.join('\n');
  fs.writeFileSync(path, newContent, (err) => {
    if (err) { throw err; } else {
      console.log(`Editor is created successfully at ${filepath}`);
    }
  });
};

// II. Update Constants
// Add a new line at line 5 src/frontend-lib-content-components/src/editors/data/constants/app.js
// with <name>: '<name>',
const tag = 'ADDED_EDITORS';
WriteIntoFile(
  'src/editors/data/constants/app.js',
  tag,
  ` ${xblockName}: '${xblockName}',`,
);

const importTag = 'ADDED_EDITOR_IMPORTS';
WriteIntoFile(
  'src/editors/supportedEditors.js',
  importTag,
  `import ${xblockName}Editor from './containers/${xblockName}Editor'`,
);

const useTag = 'ADDED_EDITORS';
WriteIntoFile(
  'src/editors/supportedEditors.js',
  useTag,
  ` [blockTypes.${xblockName}]: ${xblockName}Editor,`,
);

// Add to src/frontend-lib-content-components/src/editors/supportedEditors.js
//  at line 0 add: import <name>Editor from './containers/<name>Editor';
//  add at 5th to last line: [blockTypes.<name>]: <name>Editor,
