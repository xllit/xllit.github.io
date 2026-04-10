const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const images = [
  'mc/pic/avatar.png',
  'mc/pic/bg1.png',
  'mc/pic/bg2.png'
];

async function ensureDir(dir){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function process() {
  await ensureDir('mc/pic/optimized');
  for(const img of images){
    const inPath = path.join(__dirname, '..', img);
    const base = path.basename(img, path.extname(img));
    const outWebp = path.join(__dirname, '..', 'mc', 'pic', `${base}.webp`);
    const outSmall = path.join(__dirname, '..', 'mc', 'pic', 'optimized', `${base}-small.webp`);
    if(!fs.existsSync(inPath)){
      console.warn('not found', inPath);
      continue;
    }
    try{
      await sharp(inPath).resize({ width: 800 }).webp({ quality: 80 }).toFile(outWebp);
      await sharp(inPath).resize({ width: 320 }).webp({ quality: 70 }).toFile(outSmall);
      console.log('processed', img);
    }catch(e){
      console.error('failed', img, e.message);
    }
  }
}

process();
