/**
 * copyCloudinaryToS3.js
 *
 * Lee urls.json (lista de URLs de Cloudinary), descarga cada archivo
 * y lo sube a S3 manteniendo la misma estructura de carpetas.
 *
 * USO (dentro del contenedor):
 *   node scripts/copyCloudinaryToS3.js
 *
 * REQUISITOS: /app/urls.json con el array de URLs de Cloudinary.
 */

require('dotenv').config();
const https = require('https');
const http  = require('http');
const path  = require('path');
const fs    = require('fs');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const URLS_FILE = path.join(__dirname, '..', 'urls.json');
const CONCURRENCY = 5; // descargas paralelas

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ─── Extrae la key S3 de una URL de Cloudinary ───────────────────────────────
// https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.ext → folder/file.ext
function extractKey(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : null;
}

// ─── Descarga una URL como Buffer ────────────────────────────────────────────
function download(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'application/octet-stream' }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Comprueba si la key ya existe en S3 ────────────────────────────────────
async function existsInS3(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ─── Sube un buffer a S3 ────────────────────────────────────────────────────
async function uploadToS3(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.S3_BUCKET_NAME,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }));
}

// ─── Procesa un lote con concurrencia limitada ───────────────────────────────
async function processInBatches(items, concurrency, fn) {
  let i = 0;
  const results = [];
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(URLS_FILE)) {
    console.error(`No se encontró ${URLS_FILE}`);
    process.exit(1);
  }

  const urls = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
  console.log(`\nURLs a migrar: ${urls.length}\n`);

  let ok = 0, skipped = 0, failed = 0;

  await processInBatches(urls, CONCURRENCY, async (url, idx) => {
    const key = extractKey(url);
    if (!key) { console.warn(`[${idx + 1}] Key inválida: ${url}`); failed++; return; }

    try {
      if (await existsInS3(key)) {
        process.stdout.write(`[${idx + 1}/${urls.length}] SKIP ${key}\n`);
        skipped++;
        return;
      }

      const { buffer, contentType } = await download(url);
      await uploadToS3(key, buffer, contentType);
      process.stdout.write(`[${idx + 1}/${urls.length}] OK   ${key}\n`);
      ok++;
    } catch (err) {
      console.error(`[${idx + 1}/${urls.length}] FAIL ${key}: ${err.message}`);
      failed++;
    }
  });

  console.log(`\n──────────────────────────────`);
  console.log(`Subidos:  ${ok}`);
  console.log(`Saltados: ${skipped} (ya existían)`);
  console.log(`Errores:  ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
