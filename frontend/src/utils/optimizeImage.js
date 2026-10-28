const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.92;

/** Inserta una transformación de Cloudinary justo después de "/upload/".
 *  Si la URL no es de Cloudinary (no tiene ese segmento), se devuelve tal cual. */
function withCloudinaryTransform(url, transform) {
  if (!url) return url || '';
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  return `${url.slice(0, idx + marker.length)}${transform}/${url.slice(idx + marker.length)}`;
}

/** Cloudinary image helpers — serve the original file, no transforms. */
export const clImg = {
  avatar: (url) => url || '',
  post:   (url) => url || '',
  cover:  (url) => url || '',
  thumb:  (url) => url || '',
  logo:   (url) => url || '',
  // Miniatura pequeña (slideshow de portada /about): las fotos originales
  // pesan varios MB y ahí solo se ven a ~280px, así que pedimos a Cloudinary
  // una versión ya redimensionada y comprimida en vez del original.
  heroSlide: (url) => withCloudinaryTransform(url, 'w_600,h_800,c_fill,g_auto,q_auto,f_auto'),
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
