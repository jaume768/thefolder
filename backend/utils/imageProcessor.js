const sharp = require('sharp');
const heicConvert = require('heic-convert');

/**
 * Convierte un buffer HEIF/HEIC a JPEG (para que Sharp pueda procesarlo).
 */
const heifToJpeg = async (buffer) => {
  const output = await heicConvert({ buffer, format: 'JPEG', quality: 0.92 });
  return Buffer.from(output);
};

/**
 * Procesa un buffer de imagen con Sharp si supera los umbrales.
 * - Convierte HEIF/HEIC a JPEG primero si Sharp no soporta HEIF.
 * - Siempre convierte a WebP para consistencia con el ContentType de S3.
 *
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer procesado (o el original si no necesita optimización)
 */
const processImageIfNeeded = async (buffer) => {
  try {
    let meta;
    try {
      meta = await sharp(buffer, { animated: true }).metadata();
    } catch {
      // Sharp no pudo leer → intentar como HEIF
      try {
        buffer = await heifToJpeg(buffer);
        meta = await sharp(buffer).metadata();
      } catch {
        return buffer; // Formato desconocido, devolver tal cual
      }
    }

    // GIF animado: preservar la animación
    if (meta.format === 'gif' && meta.pages > 1) {
      return buffer;
    }

    // Si Sharp detecta heif pero no puede convertir, usar heic-convert
    if (meta.format === 'heif') {
      try {
        buffer = await heifToJpeg(buffer);
      } catch {
        return buffer;
      }
    }

    const width = meta.width || 0;

    return await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: width <= 1200 && buffer.length / 1024 < 200 ? 85 : 75 })
      .toBuffer();
  } catch {
    // Formato no soportado (PDF, SVG, etc.) → devolver original sin tocar
    return buffer;
  }
};

/**
 * Recorta y redimensiona una imagen a un cuadrado (crop centrado).
 * Usar para avatares, logos e imágenes que se mostrarán cuadradas.
 *
 * @param {Buffer} buffer - Buffer de la imagen original
 * @param {number} size   - Lado del cuadrado en píxeles (default: 500)
 * @returns {Promise<Buffer>}
 */
const squareImage = async (buffer, size = 500) => {
  try {
    return await sharp(buffer)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return buffer;
  }
};

module.exports = { processImageIfNeeded, squareImage };
