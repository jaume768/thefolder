const sharp = require('sharp');

/**
 * Procesa un buffer de imagen con Sharp si supera los umbrales.
 * - Si ya pesa menos de 200 KB Y tiene 1200 px de ancho o menos → devuelve el buffer original.
 * - En caso contrario → convierte a WebP calidad 80, redimensiona a máx 1200 px de ancho.
 *
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer procesado (o el original si no necesita optimización)
 */
const processImageIfNeeded = async (buffer) => {
  try {
    const metadata = await sharp(buffer, { animated: true }).metadata();

    // GIF animado: pasar a Cloudinary tal cual para preservar la animación
    if (metadata.format === 'gif' && metadata.pages > 1) {
      return buffer;
    }

    const sizeKB = buffer.length / 1024;
    const width  = metadata.width || 0;

    if (sizeKB < 200 && width <= 1200) {
      return buffer; // ya está optimizada
    }

    return await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
  } catch {
    // Formato no soportado por Sharp (PDF, SVG, etc.) → devolver original sin tocar
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
