/**
 * cleanupOrphanedImages.js
 *
 * Detecta y elimina imágenes en Cloudinary que ya no están referenciadas
 * en ningún documento de MongoDB (posts eliminados, fotos de perfil reemplazadas,
 * borradores abandonados subidos al servidor, etc.).
 *
 * USO:
 *   node scripts/cleanupOrphanedImages.js            → elimina los huérfanos
 *   node scripts/cleanupOrphanedImages.js --dry-run  → solo informa, no borra nada
 *
 * REQUISITOS: .env con MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 *             CLOUDINARY_API_SECRET.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const connectDB = require('../config/db');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Modelos ────────────────────────────────────────────────────────────────
const User        = require('../models/User');
const Post        = require('../models/Post');
const Industry    = require('../models/Industry');
const BlogPost    = require('../models/BlogPost');
const Magazine    = require('../models/Magazine');

// ─── Extrae el public_id de una URL de Cloudinary ───────────────────────────
// Maneja URLs con y sin transformaciones, con y sin versión.
// https://res.cloudinary.com/<cloud>/image/upload/[transforms/][v123/]folder/file.ext
//   → "folder/file"
function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) return null;
  try {
    const afterUpload = url.split('/upload/')[1];
    // Eliminar segmento de transformaciones (contiene letras como w_, q_, f_, c_)
    const parts = afterUpload.split('/');
    const filtered = parts.filter(p => !/^(v\d+|[a-z]{1,2}_[^/]+,?)/.test(p) && !p.includes(','));
    const withExt = filtered.join('/');
    return withExt.replace(/\.[^/.]+$/, ''); // quitar extensión
  } catch {
    return null;
  }
}

// ─── Recoge todas las URLs en uso desde MongoDB ──────────────────────────────
async function collectUsedUrls() {
  const urls = new Set();
  const add = (v) => { if (typeof v === 'string' && v.includes('cloudinary.com')) urls.add(v); };
  const addAll = (arr) => (arr || []).forEach(add);

  // Posts
  const posts = await Post.find({}, 'images mainImage peopleTags').lean();
  for (const p of posts) {
    addAll(p.images);
    add(p.mainImage);
    (p.peopleTags || []).forEach(t => add(t.avatar));
  }

  // Users
  const users = await User.find({}, 'profile featuredHeaderImage featuredHeaderImageDesktop featuredHeaderImageMobile creativeCoverDesktop').lean();
  for (const u of users) {
    add(u.featuredHeaderImage);
    add(u.featuredHeaderImageDesktop);
    add(u.featuredHeaderImageMobile);
    add(u.creativeCoverDesktop);
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

  return urls;
}

// ─── Lista todos los recursos de Cloudinary (paginado) ──────────────────────
async function listAllCloudinaryResources() {
  const resources = [];
  let nextCursor = null;

  do {
    const opts = { type: 'upload', max_results: 500 };
    if (nextCursor) opts.next_cursor = nextCursor;
    const result = await cloudinary.api.resources(opts);
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nModo: ${DRY_RUN ? 'DRY-RUN (no se borrará nada)' : 'REAL (se borrarán huérfanos)'}\n`);

  await connectDB();
  console.log('MongoDB conectado.');

  console.log('Recogiendo URLs en uso desde MongoDB...');
  const usedUrls = await collectUsedUrls();
  const usedPublicIds = new Set(
    [...usedUrls].map(extractPublicId).filter(Boolean)
  );
  console.log(`  URLs en uso: ${usedUrls.size}  →  public_ids únicos: ${usedPublicIds.size}`);

  console.log('Listando recursos en Cloudinary (puede tardar)...');
  const allResources = await listAllCloudinaryResources();
  console.log(`  Recursos en Cloudinary: ${allResources.length}`);

  const orphans = allResources.filter(r => !usedPublicIds.has(r.public_id));
  console.log(`\nHuérfanos encontrados: ${orphans.length}`);

  if (orphans.length === 0) {
    console.log('Cloudinary está limpio. No hay nada que borrar.');
    process.exit(0);
  }

  // Mostrar lista
  console.log('\n--- Huérfanos ---');
  orphans.forEach(r => console.log(`  ${r.public_id}  (${(r.bytes / 1024).toFixed(1)} KB)`));
  const totalMB = (orphans.reduce((s, r) => s + r.bytes, 0) / 1024 / 1024).toFixed(2);
  console.log(`\nEspacio recuperable: ${totalMB} MB`);

  if (DRY_RUN) {
    console.log('\nDRY-RUN: nada borrado. Ejecuta sin --dry-run para eliminarlos.');
    process.exit(0);
  }

  // Borrar en lotes de 100 (límite de la API)
  console.log('\nEliminando...');
  const ids = orphans.map(r => r.public_id);
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const res = await cloudinary.api.delete_resources(batch);
    const deleted = Object.values(res.deleted).filter(v => v === 'deleted').length;
    console.log(`  Lote ${Math.floor(i / 100) + 1}: ${deleted}/${batch.length} eliminados`);
  }

  console.log('\nLimpieza completada.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
