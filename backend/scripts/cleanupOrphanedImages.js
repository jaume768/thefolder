/**
 * cleanupOrphanedImages.js
 *
 * Detecta y elimina archivos en AWS S3 que ya no están referenciados
 * en ningún documento de MongoDB (posts eliminados, fotos de perfil reemplazadas,
 * borradores abandonados subidos al servidor, etc.).
 *
 * USO:
 *   node scripts/cleanupOrphanedImages.js            → elimina los huérfanos
 *   node scripts/cleanupOrphanedImages.js --dry-run  → solo informa, no borra nada
 *
 * REQUISITOS: .env con MONGO_URI, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *             AWS_REGION, S3_BUCKET_NAME.
 */

require('dotenv').config();
const connectDB = require('../config/db');
const { listAllFiles, deleteFiles, getBaseUrl } = require('../utils/storageService');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Modelos ────────────────────────────────────────────────────────────────
const User     = require('../models/User');
const Post     = require('../models/Post');
const Industry = require('../models/Industry');
const BlogPost = require('../models/BlogPost');
const Magazine = require('../models/Magazine');

// ─── Extrae la key S3 de una URL del bucket ──────────────────────────────────
// https://bucket.s3.region.amazonaws.com/folder/file.webp → "folder/file.webp"
function extractKey(url) {
  if (!url || !url.includes('.amazonaws.com/')) return null;
  try {
    return url.split('.amazonaws.com/')[1] || null;
  } catch {
    return null;
  }
}

// ─── Recoge todas las keys en uso desde MongoDB ──────────────────────────────
async function collectUsedKeys() {
  const keys = new Set();
  const add = (v) => { const k = extractKey(v); if (k) keys.add(k); };
  const addAll = (arr) => (arr || []).forEach(add);

  // Posts
  const posts = await Post.find({}, 'images mainImage peopleTags').lean();
  for (const p of posts) {
    addAll(p.images);
    add(p.mainImage);
    (p.peopleTags || []).forEach(t => add(t.avatar));
  }

  // Users
  const users = await User.find({}, 'profile featuredHeaderImage featuredHeaderImageDesktop featuredHeaderImageMobile creativeCoverDesktop portfolioUrl cvUrl').lean();
  for (const u of users) {
    add(u.featuredHeaderImage);
    add(u.featuredHeaderImageDesktop);
    add(u.featuredHeaderImageMobile);
    add(u.creativeCoverDesktop);
    add(u.portfolioUrl);
    add(u.cvUrl);
    add(u.profile?.profilePicture);
    (u.profile?.education || []).forEach(e => add(e.institutionLogo));
    (u.profile?.experience || []).forEach(e => add(e.companyLogo));
  }

  // Industry
  const industries = await Industry.find({}, 'image').lean();
  industries.forEach(i => add(i.image));

  // BlogPosts
  const blogs = await BlogPost.find({}, 'image additionalImages').lean();
  for (const b of blogs) {
    add(b.image);
    addAll(b.additionalImages);
  }

  // Magazines
  const magazines = await Magazine.find({}, 'image').lean();
  magazines.forEach(m => add(m.image));

  return keys;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nModo: ${DRY_RUN ? 'DRY-RUN (no se borrará nada)' : 'REAL (se borrarán huérfanos)'}\n`);

  await connectDB();
  console.log('MongoDB conectado.');

  console.log('Recogiendo keys en uso desde MongoDB...');
  const usedKeys = await collectUsedKeys();
  console.log(`  Keys en uso: ${usedKeys.size}`);

  console.log('Listando archivos en S3 (puede tardar)...');
  const allFiles = await listAllFiles();
  console.log(`  Archivos en S3: ${allFiles.length}`);

  const orphans = allFiles.filter(f => !usedKeys.has(f.Key));
  console.log(`\nHuérfanos encontrados: ${orphans.length}`);

  if (orphans.length === 0) {
    console.log('S3 está limpio. No hay nada que borrar.');
    process.exit(0);
  }

  // Mostrar lista
  console.log('\n--- Huérfanos ---');
  orphans.forEach(f => console.log(`  ${f.Key}  (${((f.Size || 0) / 1024).toFixed(1)} KB)`));
  const totalMB = (orphans.reduce((s, f) => s + (f.Size || 0), 0) / 1024 / 1024).toFixed(2);
  console.log(`\nEspacio recuperable: ${totalMB} MB`);

  if (DRY_RUN) {
    console.log('\nDRY-RUN: nada borrado. Ejecuta sin --dry-run para eliminarlos.');
    process.exit(0);
  }

  console.log('\nEliminando...');
  await deleteFiles(orphans.map(f => f.Key));
  console.log(`  ${orphans.length} archivos eliminados.`);

  console.log('\nLimpieza completada.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
