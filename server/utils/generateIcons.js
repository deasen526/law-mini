/**
 * 纯 JS PNG 图标生成器
 * 无任何外部依赖，直接用 Node.js 内置 zlib 写 PNG 二进制文件
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICON_DIR = path.join(__dirname, '../../miniprogram/static/tab');
const SIZE = 81; // 推荐 81x81，3倍图

if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

// ========== PNG 编码器（纯手写，无依赖） ==========

function createPNG(width, height, pixels) {
  // pixels: flat array of [r,g,b,a] per pixel, top-to-bottom

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // width
  ihdrData.writeUInt32BE(height, 4);  // height
  ihdrData[8] = 8;                     // bit depth
  ihdrData[9] = 6;                     // color type: RGBA
  ihdrData[10] = 0;                    // compression
  ihdrData[11] = 0;                    // filter
  ihdrData[12] = 0;                    // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT Chunk - raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawData[rowStart] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const px = (y * width + x) * 4;
      const dst = rowStart + 1 + x * 4;
      rawData[dst] = pixels[px];       // R
      rawData[dst + 1] = pixels[px + 1]; // G
      rawData[dst + 2] = pixels[px + 2]; // B
      rawData[dst + 3] = pixels[px + 3]; // A
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBytes = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBytes, data]);

  // CRC32
  const crc = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

// CRC32 查表法
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ========== 绘图函数 ==========

function hexToRGBA(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function createEmptyPixels(w, h) {
  return new Uint8Array(w * h * 4); // all zeros = transparent
}

function fillRect(pixels, w, x, y, rw, rh, color) {
  for (let py = y; py < y + rh && py < w; py++) {
    for (let px = x; px < x + rw && px < w; px++) {
      if (px < 0 || py < 0) continue;
      const i = (py * w + px) * 4;
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
      pixels[i + 3] = color[3];
    }
  }
}

function fillCircle(pixels, w, cx, cy, r, color) {
  for (let py = Math.max(0, Math.round(cy - r)); py < Math.min(w, Math.round(cy + r + 1)); py++) {
    for (let px = Math.max(0, Math.round(cx - r)); px < Math.min(w, Math.round(cx + r + 1)); px++) {
      const dx = px - cx, dy = py - cy;
      if (dx * dx + dy * dy <= r * r) {
        const i = (py * w + px) * 4;
        pixels[i] = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
        pixels[i + 3] = color[3];
      }
    }
  }
}

function drawPolygon(pixels, w, points, color) {
  // 简单的 scanline 填充
  let minY = Infinity, maxY = -Infinity;
  for (const p of points) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }

  for (let y = Math.max(0, Math.round(minY)); y < Math.min(w, Math.round(maxY + 1)); y++) {
    const intersections = [];
    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        const x = x1 + (y - y1) / (y2 - y1) * (x2 - x1);
        intersections.push(x);
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length - 1; i += 2) {
      fillRect(pixels, w, Math.round(intersections[i]), y,
        Math.round(intersections[i + 1] - intersections[i]), 1, color);
    }
  }
}

// ========== 图标绘制 ==========

function drawHouseIcon(w, colorHex) {
  const pixels = createEmptyPixels(w, w);
  const color = hexToRGBA(colorHex);
  const m = w * 0.22;

  const points = [
    [w / 2, m * 0.3],           // 屋顶尖端
    [m, w * 0.38],               // 屋檐左
    [m + (w - 2 * m) * 0.2, w * 0.38], // 墙左上
    [m + (w - 2 * m) * 0.2, w - m],
    [w - m - (w - 2 * m) * 0.2, w - m],
    [w - m - (w - 2 * m) * 0.2, w * 0.38],
    [w - m, w * 0.38],           // 屋檐右
  ];
  drawPolygon(pixels, w, points, color);
  // 门
  fillRect(pixels, w, w * 0.38, w * 0.55, w * 0.24, w * 0.28, [255, 255, 255, 255]);
  // 门把手
  fillCircle(pixels, w, w * 0.55, w * 0.68, w * 0.03, color);
  return pixels;
}

function drawGridIcon(w, colorHex) {
  const pixels = createEmptyPixels(w, w);
  const color = hexToRGBA(colorHex);
  const m = w * 0.18;
  const gap = w * 0.08;
  const cellW = (w - 2 * m - gap) / 2;
  const cellH = (w - 2 * m - gap) / 2;

  fillRect(pixels, w, m, m, cellW, cellH, color);
  fillRect(pixels, w, m + cellW + gap, m, cellW, cellH, color);
  fillRect(pixels, w, m, m + cellH + gap, cellW, cellH, color);
  fillRect(pixels, w, m + cellW + gap, m + cellH + gap, cellW, cellH, color);
  return pixels;
}

function drawListIcon(w, colorHex) {
  const pixels = createEmptyPixels(w, w);
  const color = hexToRGBA(colorHex);
  const m = w * 0.2;

  fillRect(pixels, w, m, m, w - 2 * m, w * 0.12, color);
  fillRect(pixels, w, m, m + w * 0.22, (w - 2 * m) * 0.75, w * 0.12, color);
  fillRect(pixels, w, m, m + w * 0.44, (w - 2 * m) * 0.55, w * 0.12, color);
  fillRect(pixels, w, m, m + w * 0.66, (w - 2 * m) * 0.35, w * 0.12, color);
  return pixels;
}

function drawUserIcon(w, colorHex) {
  const pixels = createEmptyPixels(w, w);
  const color = hexToRGBA(colorHex);
  const cx = w / 2;

  // 头
  fillCircle(pixels, w, cx, w * 0.32, w * 0.15, color);
  // 身体
  fillCircle(pixels, w, cx, w * 0.68 + w * 0.05, w * 0.24, color);
  // 接头部的矩形
  fillRect(pixels, w, cx - w * 0.18, w * 0.32, w * 0.36, w * 0.3, color);

  return pixels;
}

// ========== 生成 ==========

const icons = [
  { name: 'home', active: false, fn: drawHouseIcon },
  { name: 'home-active', active: true, fn: drawHouseIcon },
  { name: 'product', active: false, fn: drawGridIcon },
  { name: 'product-active', active: true, fn: drawGridIcon },
  { name: 'order', active: false, fn: drawListIcon },
  { name: 'order-active', active: true, fn: drawListIcon },
  { name: 'user', active: false, fn: drawUserIcon },
  { name: 'user-active', active: true, fn: drawUserIcon },
];

const activeColor = '#1a6fb5';
const normalColor = '#999999';

icons.forEach(({ name, active, fn }) => {
  const color = active ? activeColor : normalColor;
  const pixels = fn(SIZE, color);
  const png = createPNG(SIZE, SIZE, pixels);
  const filepath = path.join(ICON_DIR, `${name}.png`);
  fs.writeFileSync(filepath, png);
  console.log(`  ✅ ${name}.png (${png.length} bytes)`);
});

console.log(`\n✅ 全部 ${icons.length} 个 tabBar 图标已生成到:`);
console.log(`   ${ICON_DIR}`);
