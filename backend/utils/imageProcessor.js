const sharp = require('sharp');

/**
 * Procesa un buffer de imagen con Sharp si supera los umbrales.
 * - Si ya pesa menos de 300 KB Y tiene 1800 px de ancho o menos → devuelve el buffer original.
 * - En caso contrario → convierte a WebP calidad 85, redimensiona a máx 1800 px de ancho.
 *
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer procesado (o el original si no necesita optimización)
 */
const processImageIfNeeded = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    const sizeKB   = buffer.length / 1024;
    const width    = metadata.width || 0;

    if (sizeKB < 300 && width <= 1800) {
      return buffer; // ya está optimizada
    }

    return await sharp(buffer)
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    // Formato no soportado por Sharp (PDF, SVG, etc.) → devolver original sin tocar
    return buffer;
  }
};

module.exports = { processImageIfNeeded };
