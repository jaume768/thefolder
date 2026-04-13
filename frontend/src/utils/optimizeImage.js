const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;

/** Cloudinary image helpers — serve the original file, no transforms. */
export const clImg = {
  avatar: (url) => url || '',
  post:   (url) => url || '',
  cover:  (url) => url || '',
  thumb:  (url) => url || '',
  logo:   (url) => url || '',
};

/**
 * Comprime y redimensiona una imagen antes de subirla.
 * - Si pesa más de maxMB lanza un error con mensaje amigable.
 * - Si alguna dimensión supera maxDim la escala manteniendo el ratio.
 * - Devuelve un File JPEG optimizado.
 */
export async function optimizeImage(
  file,
  { maxMB = 10, maxDim = MAX_DIMENSION, quality = JPEG_QUALITY } = {}
) {
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(
      `La imagen pesa demasiado (máx. ${maxMB} MB). Reduce su tamaño o elige otra.`
    );
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('No se pudo procesar la imagen.')); return; }
          const name = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen.'));
    };

    img.src = objectUrl;
  });
}
