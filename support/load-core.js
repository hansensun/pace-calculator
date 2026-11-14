// Extracts the maths between the "// <core>" and "// </core>" markers in index.html
// and evaluates it, so tests exercise the exact code the page ships.
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const match = /\/\/ <core>([\s\S]*?)\/\/ <\/core>/.exec(html);
if (!match) throw new Error('Could not find the <core> block in index.html');

module.exports = new Function(match[1] + '\nreturn { buildSplits };')();
