const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getBaseUrl = () =>
  `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * Sube un buffer a S3 y devuelve la URL pública y la key.
 *
 * @param {Buffer} buffer - Buffer del archivo
 * @param {string} folder - Carpeta destino en S3 (ej: 'profile_pictures')
 * @param {object} [options]
 * @param {string} [options.contentType='image/webp'] - MIME type del archivo
 * @param {string} [options.extension='webp'] - Extensión del archivo
 * @param {string|null} [options.filename=null] - Nombre completo; si es null se genera un UUID
 * @returns {Promise<{ url: string, key: string }>}
 */
const uploadFile = async (buffer, folder, { contentType = 'image/webp', extension = 'webp', filename = null } = {}) => {
  const key = filename
    ? `${folder}/${filename}`
    : `${folder}/${crypto.randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return { url: `${getBaseUrl()}/${key}`, key };
};

/**
 * Elimina un archivo de S3 a partir de su URL pública.
 *
 * @param {string} url - URL completa del archivo en S3
 */
const deleteFileByUrl = async (url) => {
  if (!url || !url.includes('.amazonaws.com/')) return;
  try {
    const key = url.split('.amazonaws.com/')[1];
    if (!key) return;
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
  } catch {
    // Fallo silencioso para no bloquear el flujo principal
  }
};

/**
 * Elimina un archivo de S3 a partir de su key.
 *
 * @param {string} key - Key del objeto en S3
 */
const deleteFile = async (key) => {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
};

/**
 * Lista todos los archivos del bucket (paginado).
 *
 * @returns {Promise<Array<{ Key: string, Size: number }>>}
 */
const listAllFiles = async () => {
  const files = [];
  let continuationToken = null;

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 1000,
      ...(continuationToken && { ContinuationToken: continuationToken }),
    });
    const result = await s3.send(command);
    files.push(...(result.Contents || []));
    continuationToken = result.NextContinuationToken;
  } while (continuationToken);

  return files;
};

/**
 * Elimina múltiples archivos de S3 por sus keys (en lotes de 1000).
 *
 * @param {string[]} keys
 */
const deleteFiles = async (keys) => {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: batch.map((key) => ({ Key: key })) },
      })
    );
  }
};

module.exports = { uploadFile, deleteFile, deleteFileByUrl, listAllFiles, deleteFiles, getBaseUrl };
