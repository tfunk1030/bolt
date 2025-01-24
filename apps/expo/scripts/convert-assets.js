const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

async function convertSvgToPng(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height)
      .png()
      .toFile(outputPath);
    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

async function convertAssets() {
  const assets = [
    { name: 'icon', size: { width: 1024, height: 1024 } },
    { name: 'splash', size: { width: 1242, height: 2436 } },
    { name: 'adaptive-icon', size: { width: 1024, height: 1024 } },
  ];

  for (const asset of assets) {
    const svgPath = path.join(assetsDir, `${asset.name}.svg`);
    const pngPath = path.join(assetsDir, `${asset.name}.png`);
    await convertSvgToPng(svgPath, pngPath, asset.size);
  }
}

convertAssets().catch(console.error); 