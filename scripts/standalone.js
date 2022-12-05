const fs = require('fs');
const start = Date.now();

console.log("Preparing standalone build...")

if (!fs.existsSync('.next/standalone')) {
  console.log('Error: Production bundle not found!');
  process.exit(1);
}

if (!fs.existsSync('out')) fs.mkdirSync('out');

fs.cpSync('public', 'out/public', { recursive: true });
fs.cpSync('.next/standalone', 'out/', { recursive: true });
fs.cpSync('.next/static', 'out/.next/static', { recursive: true });
fs.cpSync('next.config.js', 'out/next.config.js', { recursive: true });

console.log('Done in', +((Date.now() - start) / 1000).toFixed(2), 'second');
