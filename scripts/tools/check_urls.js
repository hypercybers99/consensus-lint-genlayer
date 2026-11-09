const fs = require('fs');
const https = require('https');

const files = [
  'scripts/deploy/live_evidence.json',
  'docs/EVIDENCE.md',
  'docs/CALIBRATION.md',
  'docs/DESIGN.md',
  'README.md',
  'CHANGELOG.md'
];

const urls = new Set();
for (const f of files) {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    const matches = text.match(/https:\/\/raw\.githubusercontent\.com\/hypercybers99\/[^\s\)\"\'>]+/g) || [];
    for (const m of matches) urls.add(m);
  }
}

console.log(`Found ${urls.size} unique hypercybers99 URLs:\n`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode);
    }).on('error', (err) => {
      resolve(`ERR: ${err.message}`);
    }).end();
  });
}

async function main() {
  for (const u of Array.from(urls)) {
    const statusOld = await checkUrl(u);
    const newU = u.replace('/hypercybers99/', '/hypercybers99/');
    const statusNew = await checkUrl(newU);
    console.log(`OLD: ${u} -> HTTP ${statusOld}`);
    console.log(`NEW: ${newU} -> HTTP ${statusNew}\n`);
  }
}

main();
