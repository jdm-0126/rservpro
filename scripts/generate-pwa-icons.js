/**
 * Generates PWA icons (192x192 and 512x512) from assets/images/icon.png
 * Run once before deploying: node scripts/generate-pwa-icons.js
 *
 * Requires: npm install sharp --save-dev
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const src = path.join(__dirname, '../assets/images/icon.png');
const outDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];

Promise.all(
  sizes.map((size) =>
    sharp(src)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`))
      .then(() => console.log(`✓ icon-${size}.png`))
  )
).then(() => console.log('PWA icons generated in public/icons/'));
