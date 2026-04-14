/**
 * fixCorruptedS3Images.js
 *
 * Descarga todos los archivos con nombre UUID (subidos con el nuevo código S3)
 * y los vuelve a subir como WebP válido si Sharp detecta que no lo son.
 *
 * USO:
 *   node scripts/fixCorruptedS3Images.js           → repara
 *   node scripts/fixCorruptedS3Images.js --dry-run → solo informa, no modifica
 */

require('dotenv').config();
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const heicConvert = require('heic-convert');

const DRY_RUN = process.argv.includes('--dry-run');
const BUCKET  = process.env.S3_BUCKET_NAME;
const s3      = new S3Client({ region: process.env.AWS_REGION });

// Patrón de nombre UUID generado por crypto.randomUUID()
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\./i;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function main() {
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN' : 'REAL'}\nBucket: ${BUCKET}\n`);

  let continuationToken;
  let fixed = 0, alreadyOk = 0, skipped = 0, errors = 0;

  do {
    const listRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        ...(continuationToken && { ContinuationToken: continuationToken }),
      })
    );

    for (const obj of listRes.Contents || []) {
      const key      = obj.Key;
      const filename = key.split('/').pop();

      // Solo procesar archivos con nombre UUID y extensión .webp
      if (!UUID_RE.test(filename) || !filename.endsWith('.webp')) {
        skipped++;
        continue;
      }

      try {
        // Descargar de S3
        const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const buf    = await streamToBuffer(getRes.Body);

        // Intentar leer metadata con Sharp
        let metadata;
        try {
          metadata = await sharp(buf, { animated: true }).metadata();
        } catch {
          console.warn(`  [SKIP] Sharp no puede leer: ${key}`);
          skipped++;
          continue;
        }

        if (metadata.format === 'webp') {
          alreadyOk++;
          continue; // ya es webp válido
        }

        // Es otro formato (jpeg, png, heic…) disfrazado de .webp → convertir
        console.log(`  [FIX] ${key}  (era: ${metadata.format})`);

        if (!DRY_RUN) {
          let inputBuf = buf;

          // HEIF/HEIC: convertir primero a JPEG con heic-convert
          if (metadata.format === 'heif') {
            const jpegOutput = await heicConvert({ buffer: buf, format: 'JPEG', quality: 0.92 });
            inputBuf = Buffer.from(jpegOutput);
          }

          const converted = await sharp(inputBuf)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          await s3.send(
            new PutObjectCommand({
              Bucket:      BUCKET,
              Key:         key,
              Body:        converted,
              ContentType: 'image/webp',
            })
          );
        }

        fixed++;
      } catch (err) {
        console.error(`  [ERROR] ${key}: ${err.message}`);
        errors++;
      }
    }

    continuationToken = listRes.NextContinuationToken;
  } while (continuationToken);

  console.log(`\nResumen:`);
  console.log(`  Reparados : ${fixed}`);
  console.log(`  Ya OK     : ${alreadyOk}`);
  console.log(`  Omitidos  : ${skipped}`);
  console.log(`  Errores   : ${errors}`);
}

main().catch(console.error);
