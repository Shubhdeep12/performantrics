import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

async function generateImages() {
  const svgBuffer = await fs.readFile(path.join(__dirname, '../assets/logo/performantrics-logo.svg'));
  
  const sizes = {
    'performantrics-logo.png': 512,
    'performantrics-logo-small.png': 128,
    'performantrics-icon.png': 64,
    'performantrics-icon-small.png': 32
  };

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../assets/logo', filename));
  }
}

generateImages().catch(console.error);