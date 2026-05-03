/**
 * auditAndFixLogos.js
 *
 * Audita y repara los campos de logo (profile.experience[].companyLogo y
 * profile.education[].institutionLogo) que están dando 401/403/404.
 *
 * Flujo por cada URL rota:
 *   1) HEAD a la URL actual. Si 2xx → OK, skip.
 *   2) Si es de S3 y no existe en el bucket, reconstruye la URL de Cloudinary
 *      equivalente y prueba a descargarla.
 *   3) Si la descarga de Cloudinary es OK, copia el asset al mismo key en S3
 *      y deja la URL de BD como está (que ya apunta a S3).
 *   4) Si Cloudinary tampoco responde → pone el campo a null (cae al
 *      placeholder en el frontend).
 *   5) También detecta URLs que siguen apuntando a Cloudinary y las
 *      reconvierte con el mismo criterio que migrateCloudinaryUrlsToS3.js.
 *
 * USO:
 *   node scripts/auditAndFixLogos.js --dry-run    → solo informa
 *   node scripts/auditAndFixLogos.js              → aplica cambios
 *   node scripts/auditAndFixLogos.js --only-audit → solo reporta, sin copiar ni modificar
 *
 * REQUISITOS: .env del backend (MONGO_URI, AWS_REGION, S3_BUCKET_NAME,
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).
 */

require('dotenv').config();

const https = require('https');
const http  = require('http');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const connectDB = require('../config/db');
const { getBaseUrl } = require('../utils/storageService');
const User = require('../models/User');

const DRY_RUN    = process.argv.includes('--dry-run');
const ONLY_AUDIT = process.argv.includes('--only-audit');

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ─── HTTP HEAD con seguimiento de redirects ──────────────────────────────────
function httpStatus(url, method = 'HEAD') {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.request(url, { method, timeout: 10000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpStatus(res.headers.location, method).then(resolve);
        }
        resolve({ status: res.statusCode, contentType: res.headers['content-type'] });
        res.resume();
      });
      req.on('error', () => resolve({ status: 0 }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0 }); });
      req.end();
    } catch {
      resolve({ status: 0 });
    }
  });
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      lib.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({
          buffer: Buffer.concat(chunks),
          contentType: res.headers['content-type'] || 'application/octet-stream',
        }));
        res.on('error', reject);
      }).on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

async function s3KeyExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToS3(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.S3_BUCKET_NAME,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }));
}

// ─── Extractores de key ──────────────────────────────────────────────────────
// S3: https://<bucket>.s3.<region>.amazonaws.com/folder/file.ext  →  folder/file.ext
function extractS3Key(url) {
  const m = String(url).match(/amazonaws\.com\/(.+)$/);
  return m ? m[1] : null;
}

// Cloudinary: https://res.cloudinary.com/<cloud>/image/upload/[transforms/][vXXX/]folder/file.ext
function extractCloudinaryKey(url) {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) return null;
  const afterUpload = url.split('/upload/')[1];
  const parts = afterUpload.split('/');
  const filtered = parts.filter(p => !/^(v\d+|[a-z]{1,2}_[^/]+,?)/.test(p) && !p.includes(','));
  return filtered.join('/') || null;
}

function cloudinaryUrlFromKey(key) {
  if (!CLOUDINARY_CLOUD || !key) return null;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${key}`;
}

// ─── Procesa una sola URL de logo ────────────────────────────────────────────
// Devuelve un objeto { action, newUrl? } donde action ∈
//   'ok' | 'copied' | 'rewritten' | 'nulled' | 'skip-empty'
async function fixLogoUrl(url, BASE) {
  if (!url) return { action: 'skip-empty' };

  // Caso A: la URL es de Cloudinary → reconvertir a S3 + copiar si falta.
  if (url.includes('cloudinary.com')) {
    const key = extractCloudinaryKey(url);
    if (!key) return { action: 'nulled', newUrl: null, reason: 'cloudinary-key-invalid' };

    const s3Url = `${BASE}/${key}`;
    const existsInS3 = await s3KeyExists(key);

    if (existsInS3) {
      return { action: 'rewritten', newUrl: s3Url, reason: 'cloudinary->s3-existing' };
    }

    // intentar copiar
    try {
      const { buffer, contentType } = await downloadBuffer(url);
      if (!ONLY_AUDIT && !DRY_RUN) {
        await uploadToS3(key, buffer, contentType);
      }
      return { action: 'copied', newUrl: s3Url, reason: 'cloudinary-copied-to-s3' };
    } catch (e) {
      return { action: 'nulled', newUrl: null, reason: `cloudinary-unreachable: ${e.message}` };
    }
  }

  // Caso B: URL S3 — comprobar si existe
  if (url.includes('amazonaws.com')) {
    const key = extractS3Key(url);
    if (!key) return { action: 'ok', reason: 's3-key-not-parseable' };

    const existsInS3 = await s3KeyExists(key);
    if (existsInS3) return { action: 'ok', reason: 's3-exists' };

    // No existe en S3 → intentar copiar desde Cloudinary con la misma key
    const cloudUrl = cloudinaryUrlFromKey(key);
    if (!cloudUrl) {
      return { action: 'nulled', newUrl: null, reason: 's3-missing-no-cloud-cfg' };
    }

    try {
      const { buffer, contentType } = await downloadBuffer(cloudUrl);
      if (!ONLY_AUDIT && !DRY_RUN) {
        await uploadToS3(key, buffer, contentType);
      }
      return { action: 'copied', reason: 's3-missing-copied-from-cloudinary' };
    } catch (e) {
      return { action: 'nulled', newUrl: null, reason: `s3-missing-and-cloud-unreachable: ${e.message}` };
    }
  }

  // Caso C: URL relativa o externa → probar HEAD
  const { status } = await httpStatus(url);
  if (status >= 200 && status < 400) return { action: 'ok', reason: 'external-ok' };
  return { action: 'nulled', newUrl: null, reason: `external-bad-status-${status}` };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nMode: ${DRY_RUN ? 'DRY-RUN' : ONLY_AUDIT ? 'ONLY-AUDIT' : 'APPLY'}\n`);

  await connectDB();
  console.log('MongoDB conectado.');

  const BASE = getBaseUrl();
  console.log(`S3 base URL: ${BASE}\n`);

  const users = await User.find({}, {
    username: 1,
    'profile.experience': 1,
    'profile.education': 1,
  }).lean();

  const counters = { ok: 0, copied: 0, rewritten: 0, nulled: 0, 'skip-empty': 0 };
  const changedUsers = [];

  for (const u of users) {
    const updates = {};

    // experience[].companyLogo
    if (Array.isArray(u.profile?.experience) && u.profile.experience.length) {
      const newArr = [];
      let changed = false;
      for (const exp of u.profile.experience) {
        const res = await fixLogoUrl(exp.companyLogo, BASE);
        counters[res.action] = (counters[res.action] || 0) + 1;
        let next = { ...exp };
        if (res.action === 'nulled') {
          next.companyLogo = null;
          changed = true;
          console.log(`  [User ${u.username || u._id}] companyLogo NULL — ${res.reason} — was ${exp.companyLogo}`);
        } else if (res.action === 'rewritten' && res.newUrl && res.newUrl !== exp.companyLogo) {
          next.companyLogo = res.newUrl;
          changed = true;
          console.log(`  [User ${u.username || u._id}] companyLogo REWRITE → ${res.newUrl}`);
        } else if (res.action === 'copied') {
          if (res.newUrl && res.newUrl !== exp.companyLogo) {
            next.companyLogo = res.newUrl;
            changed = true;
          }
          console.log(`  [User ${u.username || u._id}] companyLogo COPIED to S3 — ${res.reason}`);
        }
        newArr.push(next);
      }
      if (changed) updates['profile.experience'] = newArr;
    }

    // education[].institutionLogo
    if (Array.isArray(u.profile?.education) && u.profile.education.length) {
      const newArr = [];
      let changed = false;
      for (const edu of u.profile.education) {
        const res = await fixLogoUrl(edu.institutionLogo, BASE);
        counters[res.action] = (counters[res.action] || 0) + 1;
        let next = { ...edu };
        if (res.action === 'nulled') {
          next.institutionLogo = null;
          changed = true;
          console.log(`  [User ${u.username || u._id}] institutionLogo NULL — ${res.reason} — was ${edu.institutionLogo}`);
        } else if (res.action === 'rewritten' && res.newUrl && res.newUrl !== edu.institutionLogo) {
          next.institutionLogo = res.newUrl;
          changed = true;
          console.log(`  [User ${u.username || u._id}] institutionLogo REWRITE → ${res.newUrl}`);
        } else if (res.action === 'copied') {
          if (res.newUrl && res.newUrl !== edu.institutionLogo) {
            next.institutionLogo = res.newUrl;
            changed = true;
          }
          console.log(`  [User ${u.username || u._id}] institutionLogo COPIED to S3 — ${res.reason}`);
        }
        newArr.push(next);
      }
      if (changed) updates['profile.education'] = newArr;
    }

    if (Object.keys(updates).length) {
      changedUsers.push(u.username || String(u._id));
      if (!DRY_RUN && !ONLY_AUDIT) {
        await User.updateOne({ _id: u._id }, { $set: updates });
      }
    }
  }

  console.log('\n──────────────────────────────');
  console.log(`Users procesados: ${users.length}`);
  console.log(`Users con cambios: ${changedUsers.length}`);
  console.log('Distribución de acciones por logo:');
  for (const k of Object.keys(counters)) console.log(`  ${k}: ${counters[k]}`);
  if (DRY_RUN)    console.log('\nDRY-RUN: no se aplicaron cambios en MongoDB.');
  if (ONLY_AUDIT) console.log('\nONLY-AUDIT: no se copiaron assets a S3 ni se modificó MongoDB.');

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
