import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, a = 255) {
  // PNG signature
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

  // Raw image data: height rows, each row starts with filter byte 0, followed by width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Draw a stylized RPG pentagram / badge pattern
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const innerRadius = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Slate 950 (#020617)
      let pr = 2, pg = 6, pb = 23, pa = 255;

      // Circle border
      if (Math.abs(dist - radius) < width * 0.02) {
        pr = 14; pg = 165; pb = 233; pa = 220; // Cyan border
      } else if (dist < radius && Math.abs(dist - innerRadius) < width * 0.015) {
        pr = 56; pg = 189; pb = 248; pa = 200; // Cyan inner
      } else if (dist < innerRadius * 0.8) {
        // Center rune diamond
        const manhattan = Math.abs(dx) + Math.abs(dy);
        if (manhattan < innerRadius * 0.75) {
          pr = 245; pg = 158; pb = 11; pa = 255; // Amber rune
        } else {
          pr = 3; pg = 105; pb = 161; pa = 200; // Deep Cyan
        }
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate PWA icons
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 2, 6, 23));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 2, 6, 23));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 2, 6, 23));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 2, 6, 23));

console.log('PNG icons created successfully!');
