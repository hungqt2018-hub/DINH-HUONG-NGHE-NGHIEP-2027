import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, text) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with gradient and stylized "LTH" mark
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None
    const t = y / height;
    // deep blue to cyan-teal gradient
    const cr = Math.round(15 * (1 - t) + 13 * t);
    const cg = Math.round(61 * (1 - t) + 148 * t);
    const cb = Math.round(104 * (1 - t) + 136 * t);

    for (let x = 0; x < width; x++) {
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold badge in center
      let pr = cr;
      let pg = cg;
      let pb = cb;
      let pa = 255;

      // Circle border
      if (Math.abs(dist - 0.7) < 0.02) {
        pr = 255; pg = 255; pb = 255;
      } else if (dist < 0.6) {
        // inner emblem area
        if (Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35) {
          // gold accent
          pr = 245; pg = 158; pb = 11;
        }
      }

      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(byte & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 15, 61, 104, 'LTH'));
fs.writeFileSync('public/icon-192.png', createPNG(192, 192, 15, 61, 104, 'LTH'));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 15, 61, 104, 'LTH'));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 15, 61, 104, 'LTH'));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 15, 61, 104, 'LTH'));

console.log('PWA PNG Icons generated successfully.');
