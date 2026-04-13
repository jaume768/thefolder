/**
 * migrateCloudinaryUrlsToS3.js
 *
 * Reemplaza todas las URLs de Cloudinary en MongoDB por sus equivalentes en S3.
 * Asume que los archivos ya existen en S3 con la misma estructura de carpetas
 * (folder/filename.ext).
 *
 * USO:
 *   node scripts/migrateCloudinaryUrlsToS3.js            → aplica cambios
 *   node scripts/migrateCloudinaryUrlsToS3.js --dry-run  → solo informa
 *
 * REQUISITOS: .env con MONGO_URI, AWS_REGION, S3_BUCKET_NAME.
 */

require('dotenv').config();
const connectDB = require('../config/db');
const { getBaseUrl } = require('../utils/storageService');

const DRY_RUN = process.argv.includes('--dry-run');

const User     = require('../models/User');
const Post     = require('../models/Post');
const Industry = require('../models/Industry');
const BlogPost = require('../models/BlogPost');
const Magazine = require('../models/Magazine');
const Offer    = require('../models/Offer');
const EducationalOffer = require('../models/EducationalOffer');

// ─── Convierte una URL de Cloudinary a S3 ────────────────────────────────────
// Extrae la carpeta + nombre de archivo de la URL de Cloudinary y construye
// la URL S3 equivalente.
//
// Cloudinary: https://res.cloudinary.com/<cloud>/image/upload/[transforms/][v123/]folder/file.webp
// S3:         https://bucket.s3.region.amazonaws.com/folder/file.webp
function toS3Url(url, baseUrl) {
  if (!url) return url;
  if (url.includes('.amazonaws.com/')) return url; // ya migrada
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) return url;

  try {
    const afterUpload = url.split('/upload/')[1];
    const parts = afterUpload.split('/');
    // Saltar segmentos de transformaciones (w_xxx, q_xxx, f_xxx, c_xxx, vXXX…)
    const filtered = parts.filter(p => !/^(v\d+|[a-z]{1,2}_[^/]+,?)/.test(p) && !p.includes(','));
    const key = filtered.join('/');
    return `${baseUrl}/${key}`;
  } catch {
    return url;
  }
}

// ─── Aplica la conversión a un array de URLs ─────────────────────────────────
function convertArray(arr, baseUrl) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(u => toS3Url(u, baseUrl));
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nModo: ${DRY_RUN ? 'DRY-RUN (no se modificará nada)' : 'REAL (se actualizará MongoDB)'}\n`);

  await connectDB();
  console.log('MongoDB conectado.');

  const BASE = getBaseUrl();
  console.log(`URL base S3: ${BASE}\n`);

  let totalDocs = 0;
  let totalFields = 0;

  // ── Posts ──────────────────────────────────────────────────────────────────
  {
    const posts = await Post.find({}).lean();
    for (const doc of posts) {
      const updates = {};
      const newImages = convertArray(doc.images, BASE);
      const newMain   = toS3Url(doc.mainImage, BASE);
      const newTags   = (doc.peopleTags || []).map(t => ({ ...t, avatar: toS3Url(t.avatar, BASE) }));

      const changed =
        JSON.stringify(newImages) !== JSON.stringify(doc.images) ||
        newMain !== doc.mainImage ||
        JSON.stringify(newTags) !== JSON.stringify(doc.peopleTags);

      if (changed) {
        updates.images = newImages;
        updates.mainImage = newMain;
        updates.peopleTags = newTags;
        console.log(`  [Post] ${doc._id}`);
        totalDocs++;
        totalFields += 3;
        if (!DRY_RUN) await Post.updateOne({ _id: doc._id }, { $set: updates });
      }
    }
    console.log(`Posts procesados: ${posts.length}`);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  {
    const users = await User.find({}).lean();
    for (const doc of users) {
      const updates = {};
      const fields = ['featuredHeaderImage', 'featuredHeaderImageDesktop', 'featuredHeaderImageMobile', 'creativeCoverDesktop', 'portfolioUrl', 'cvUrl'];

      fields.forEach(f => {
        const newVal = toS3Url(doc[f], BASE);
        if (newVal !== doc[f]) updates[f] = newVal;
      });

      // profile.profilePicture
      if (doc.profile?.profilePicture) {
        const newPP = toS3Url(doc.profile.profilePicture, BASE);
        if (newPP !== doc.profile.profilePicture) updates['profile.profilePicture'] = newPP;
      }

      // profile.education[].institutionLogo
      if (doc.profile?.education?.length) {
        const newEdu = doc.profile.education.map(e => ({ ...e, institutionLogo: toS3Url(e.institutionLogo, BASE) }));
        if (JSON.stringify(newEdu) !== JSON.stringify(doc.profile.education))
          updates['profile.education'] = newEdu;
      }

      // profile.experience[].companyLogo
      if (doc.profile?.experience?.length) {
        const newExp = doc.profile.experience.map(e => ({ ...e, companyLogo: toS3Url(e.companyLogo, BASE) }));
        if (JSON.stringify(newExp) !== JSON.stringify(doc.profile.experience))
          updates['profile.experience'] = newExp;
      }

      if (Object.keys(updates).length) {
        console.log(`  [User] ${doc._id} (${doc.username})`);
        totalDocs++;
        totalFields += Object.keys(updates).length;
        if (!DRY_RUN) await User.updateOne({ _id: doc._id }, { $set: updates });
      }
    }
    console.log(`Users procesados: ${users.length}`);
  }

  // ── Industry ───────────────────────────────────────────────────────────────
  {
    const docs = await Industry.find({}).lean();
    for (const doc of docs) {
      const newImage = toS3Url(doc.image, BASE);
      if (newImage !== doc.image) {
        console.log(`  [Industry] ${doc._id}`);
        totalDocs++;
        totalFields++;
        if (!DRY_RUN) await Industry.updateOne({ _id: doc._id }, { $set: { image: newImage } });
      }
    }
    console.log(`Industries procesadas: ${docs.length}`);
  }

  // ── BlogPosts ──────────────────────────────────────────────────────────────
  {
    const docs = await BlogPost.find({}).lean();
    for (const doc of docs) {
      const newImage = toS3Url(doc.image, BASE);
      const newAdditional = convertArray(doc.additionalImages, BASE);
      const changed = newImage !== doc.image || JSON.stringify(newAdditional) !== JSON.stringify(doc.additionalImages);
      if (changed) {
        console.log(`  [BlogPost] ${doc._id}`);
        totalDocs++;
        totalFields += 2;
        if (!DRY_RUN) await BlogPost.updateOne({ _id: doc._id }, { $set: { image: newImage, additionalImages: newAdditional } });
      }
    }
    console.log(`BlogPosts procesados: ${docs.length}`);
  }

  // ── Magazines ─────────────────────────────────────────────────────────────
  {
    const docs = await Magazine.find({}).lean();
    for (const doc of docs) {
      const newImage = toS3Url(doc.image, BASE);
      if (newImage !== doc.image) {
        console.log(`  [Magazine] ${doc._id}`);
        totalDocs++;
        totalFields++;
        if (!DRY_RUN) await Magazine.updateOne({ _id: doc._id }, { $set: { image: newImage } });
      }
    }
    console.log(`Magazines procesadas: ${docs.length}`);
  }

  // ── Offers (company logos) ────────────────────────────────────────────────
  if (Offer) {
    const docs = await Offer.find({}).lean();
    for (const doc of docs) {
      const newLogo = toS3Url(doc.companyLogo, BASE);
      if (newLogo !== doc.companyLogo) {
        console.log(`  [Offer] ${doc._id}`);
        totalDocs++;
        totalFields++;
        if (!DRY_RUN) await Offer.updateOne({ _id: doc._id }, { $set: { companyLogo: newLogo } });
      }
    }
    console.log(`Offers procesadas: ${docs.length}`);
  }

  // ── EducationalOffers ─────────────────────────────────────────────────────
  if (EducationalOffer) {
    const docs = await EducationalOffer.find({}).lean();
    for (const doc of docs) {
      const newHeader = toS3Url(doc.headerImage, BASE);
      if (newHeader !== doc.headerImage) {
        console.log(`  [EducationalOffer] ${doc._id}`);
        totalDocs++;
        totalFields++;
        if (!DRY_RUN) await EducationalOffer.updateOne({ _id: doc._id }, { $set: { headerImage: newHeader } });
      }
    }
    console.log(`EducationalOffers procesadas: ${docs.length}`);
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`Documentos con cambios: ${totalDocs}`);
  console.log(`Campos actualizados:    ${totalFields}`);
  if (DRY_RUN) console.log('\nDRY-RUN: nada modificado. Ejecuta sin --dry-run para aplicar.');
  else         console.log('\nMigración de URLs completada.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
