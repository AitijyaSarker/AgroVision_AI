const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const pub = path.join(__dirname, '..', 'public');

if (!fs.existsSync(dist)) {
  console.log('No dist folder — skip sync.');
  process.exit(0);
}

const bases = ['aman', 'sandid'];
for (const base of bases) {
  const match = fs
    .readdirSync(dist)
    .find((f) => path.parse(f).name.toLowerCase() === base);
  if (!match) {
    console.log(`Not found in dist: ${base}.*`);
    continue;
  }
  const ext = path.extname(match) || '.jpg';
  const dest = path.join(pub, `${base}.png`);
  fs.copyFileSync(path.join(dist, match), dest);
  console.log(`Synced ${match} -> public/${base}.png`);
}
