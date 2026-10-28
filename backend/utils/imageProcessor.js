const sharp = require('sharp');
const heicConvert = require('heic-convert');

const heifToJpeg = async (buffer) => {
  const output = await heicConvert({ buffer, format: 'JPEG', quality: 0.92 });
  return Buffer.from(output);
};

// Shared HEIC/GIF normalization: converts to processable buffer or signals skip.
const _normalize = async (buffer) => {
  let meta;
  try {
    meta = await sharp(buffer, { animated: true }).metadata();
  } catch {
    try {
      buffer = await heifToJpeg(buffer);
      meta = await sharp(buffer).metadata();
    } catch {
      return { buffer, skip: true };
    }
  }
  if (meta.format === 'gif' && meta.pages > 1) return { buffer, skip: true };
  if (meta.format === 'heif') {
    try { buffer = await heifToJpeg(buffer); } catch { return { buffer, skip: true }; }
  }
  return { buffer, skip: false };
};

/**
 * Full-quality version for hero/fullscreen display (2000px, WebP q=90).
 */
const processImageIfNeeded = async (buffer) => {
  try {
    const { buffer: buf, skip } = await _normalize(buffer);
    if (skip) return buf;
    return await sharp(buf)
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
  } catch {
    return buffer;
  }
};

/**
 * Thumbnail version for masonry grids (800px, WebP q=80).
 */
const processThumb = async (buffer) => {
  try {
    const { buffer: buf, skip } = await _normalize(buffer);
    if (skip) return buf;
    return await sharp(buf)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return buffer;
  }
};

/**
 * Square crop for avatars/logos (default 500px, WebP q=85).
 */
const squareImage = async (buffer, size = 500) => {
  try {
    return await sharp(buffer)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    return buffer;
  }
};

module.exports = { processImageIfNeeded, processThumb, squareImage };
