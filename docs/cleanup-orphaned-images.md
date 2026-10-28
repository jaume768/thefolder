# Limpieza de imágenes huérfanas en Cloudinary

Script: `backend/scripts/cleanupOrphanedImages.js`

## Qué hace

1. Conecta a MongoDB y recoge todos los URLs de Cloudinary que están referenciados en la base de datos (posts, perfiles, portadas, logos de educación/experiencia, industria, blog, revistas).
2. Lista todos los recursos almacenados en Cloudinary.
3. Compara ambos conjuntos. Cualquier imagen en Cloudinary que no aparezca en MongoDB es un **huérfano** (borrador abandonado, foto de perfil reemplazada, post eliminado, etc.).
4. Informa del espacio recuperable y, opcionalmente, los elimina.

## Cómo ejecutarlo

Desde la raíz del proyecto:

```bash
# Primero: revisar qué se borraría SIN borrar nada
node backend/scripts/cleanupOrphanedImages.js --dry-run

# Segundo: ejecutar la limpieza real
node backend/scripts/cleanupOrphanedImages.js
```

Requiere que el archivo `.env` tenga `MONGO_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.

## Cuándo ejecutarlo

- Cuando la cuota de Cloudinary esté alta.
- No es necesario ejecutarlo de forma periódica salvo que el problema reaparezca.
- **Siempre hacer `--dry-run` primero** y revisar la lista antes de confirmar.

## Lo que NO toca

- Imágenes referenciadas en cualquier documento de MongoDB (aunque el post esté pendiente de moderación o la oferta esté cerrada).
- Nada fuera de Cloudinary (MongoDB no se modifica).
