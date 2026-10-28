# THEFOLDER — Cambios de backend (sesiones activas)

> Registro de cambios realizados en sesiones de trabajo. Actualizar tras cada sesión.
> Última actualización: 2026-04-12 (sesión 2)

---

## 2026-04-12 (sesión 2) — Edición de imágenes en posts existentes

**Contexto:** Se añade la posibilidad de añadir y eliminar imágenes al editar un post ya publicado, directamente desde el modal `cp-overlay`.

### Cambios

**`backend/routes/posts.js`**
- Ruta `PUT /:id`: cambiado `upload.single('image')` → `upload.array('newImages', 6)` para admitir múltiples imágenes nuevas al actualizar un post.

**`backend/controllers/postController.js`** — `updatePost`
- Si `req.files` contiene archivos en el campo `newImages`, se suben a Cloudinary en orden (mismo flujo que `createPost`: Sharp + `upload_stream`, carpeta `posts`).
- Las URLs resultantes se concatenan al array `images` existente (enviado como JSON en `req.body.images`).
- **Cap de 6 imágenes:** solo se suben `Math.max(0, 6 - existingImages.length)` ficheros para que el total nunca supere 6, independientemente de lo que envíe el cliente.
- `mainImage` se actualiza siempre al primer elemento del array final.
- Si el cliente no envía `images`, el campo no se toca (edición solo de metadatos).

**`backend/models/User.js`**
- Añadido `"native"` al enum del campo `level` en el subdocumento `languages`: `["", "basic", "intermediate", "advanced", "native"]`. Antes solo existía `"advanced"` para cubrir ambos niveles; ahora se separan en valores distintos.

---

## 2026-04-12 — Eliminar transforms de Cloudinary + ajuste de límites de subida

**Contexto:** La cuenta de Cloudinary había superado el free tier por el uso de derived assets generados por las transformaciones en URL (`w_200,h_200,c_fill,q_auto,f_auto`, etc.). Se eliminan todos los transforms en render-time para que Cloudinary actúe como servidor de ficheros estáticos. El backend con Sharp ya procesaba las imágenes antes de subirlas, por lo que no se pierde optimización.

**`frontend/src/utils/optimizeImage.js`**
- Los helpers `clImg.avatar/post/cover/thumb/logo` ahora devuelven la URL original sin modificar. Se elimina la función `_cld` y todos los parámetros de transformación.
- `MAX_DIMENSION` ajustado de 1500 → 1200 px para coincidir con el límite de `imageProcessor.js` en backend.
- Límite de peso (`maxMB`) ajustado de 20 → 10 MB para coincidir con el límite de multer en backend.

**`frontend/src/pages/creatives/CreativesPage.jsx`**
- Eliminado el transform manual `w_600,h_750,c_fill,q_auto,f_auto` de la función `cloudinaryOptimize`. Ahora devuelve la URL directamente.

---

## 2026-04-11 (sesión 2) — Actividad de usuarios, nuevos grupos de tags, isDraft en press/awards

### Actividad de usuarios (retención de edición de perfil)

**`backend/models/User.js`**
- Añadido `lastProfileEditAt: { type: Date, default: null }`.

**`backend/controllers/userController.js`**
- En `updateProfile`: se añade `updates.lastProfileEditAt = new Date()` antes del `findByIdAndUpdate`, actualizando la fecha cada vez que el usuario guarda su perfil.

**`backend/controllers/adminController.js`**
- Añadida función `exports.getUserActivity`.
- Devuelve `{ total, edited, retentionPct, users[] }` con los 100 usuarios más recientes ordenados por `lastProfileEditAt desc`.
- Excluye admins (`isAdmin: { $ne: true }`).
- `retentionPct` = usuarios con `lastProfileEditAt != null` / total × 100.

**`backend/routes/admin.js`**
- Añadida ruta `GET /api/admin/user-activity` → `adminController.getUserActivity`.

---

### isDraft en pressPublications y awards

**`backend/models/User.js`**
- Añadido `isDraft: { type: Boolean, default: false }` al subdocumento `pressPublications`.
- Añadido `isDraft: { type: Boolean, default: false }` al subdocumento `awards`.

---

### Nuevos grupos de tags en ensureTags.js

**`backend/utils/ensureTags.js`**
- Añadido grupo `Marketing & PR` con 4 tags: `g-brand-manager`, `g-pr-comm`, `g-copywriting`, `g-showroom`.
- Añadido grupo `Digital & Social` con 4 tags: `g-social-media`, `g-content-creator`, `g-community`, `g-ecommerce`.
- Insertados antes del grupo `Comunicación & Editorial` (order 9 y 10 respectivamente).
- `ensureRoleTags()` sincroniza automáticamente en el arranque del servidor.

---

## 2026-04-11 — Nuevas secciones de perfil: Publicaciones en medios y Reconocimientos y premios

### Modelo de datos

**`backend/models/User.js`**
- Añadido array `pressPublications` con campos: `logoUrl`, `title`, `publication`, `role` (autor/colaborador/entrevistado/mencionado), `url`, `pubMonth`, `pubYear`, `description`.
- Añadido array `awards` con campos: `name`, `type` (enum 8 opciones + Otro), `otherType` (texto libre si type===Otro), `issuer`, `awardMonth`, `awardYear`, `description`, `url`.

### Controlador

**`backend/controllers/userController.js`**
- Añadidos `pressPublications` y `awards` a `ALLOWED_FIELDS` en `updateProfile` para que el endpoint `PUT /api/users/profile` los acepte y persista.

---

## 2026-04-11 — Faceted search en /creatives + fix SearchFullScreen en UserExternProfile

### Faceted search (filtros dinámicos)

**Problema:** Al seleccionar filtros en `/creatives`, los conteos mostrados en el modal de filtros eran siempre los totales globales, sin reflejar los filtros activos. Daba la sensación de que los filtros no se intersectaban aunque el backend ya hacía AND entre tipos de filtro.

**Solución:** Nuevo endpoint de facetas que calcula conteos excluyendo la dimensión propia en cada cálculo (patrón estándar de faceted search). El frontend lo consulta con debounce de 250ms al cambiar cualquier filtro y actualiza los conteos en tiempo real.

**`backend/controllers/userController.js`**
- Añadida función `exports.getCreativesFacets`.
- Acepta los mismos parámetros que `getCreatives` (`city`, `professionalProfile`/`professionalTags`, `creativeLevel`, `search`).
- Para cada dimensión, construye el filtro MongoDB excluyendo esa dimensión (`skipCity`, `skipTags`, `skipLevel`).
- Ejecuta 4 agregaciones en paralelo con `Promise.all`: tags, city, city2, levels.
- Devuelve `{ tags: { tagId: count }, cities: { cityName: count }, levels: { "1": count, ... } }`.

**`backend/routes/users.js`**
- Añadida ruta `GET /api/users/creatives/facets` → `userController.getCreativesFacets`.
- Ruta pública (sin `ensureAuthenticated`), igual que `/creatives`.

**`frontend/src/pages/creatives/CreativesPage.jsx`**
- Nuevo estado `facets: { tags: {}, cities: {}, levels: {} }`.
- Effect debounced (250ms) sobre `filters` → llama a `/api/users/creatives/facets` y actualiza `facets`.
- Modal de filtros: conteos sustituidos por `facets.{dim}[id] ?? staticCount`.
- Opciones con facetCount === 0 (y no seleccionadas) se muestran con `opacity: 0.35`: grupos de especialidad, tags individuales, ciudades y niveles de experiencia.
- Grupos de especialidad dimean si la suma de facetCount de todos sus tags es 0.
- Países dimean si la suma de facetCount de todas sus ciudades es 0.
- Sección Experiencia: dimming activo pero sin contadores visibles (solo label).
- `clearAll` resetea también `facets` a `{}` vacío.

---

### Faceted search en /explorer

**Problema:** Al seleccionar filtros en `/explorer` (experiencia, especialidad, ubicación, tipo de proyecto), los conteos no reflejaban las combinaciones activas.

**`backend/controllers/postController.js`**
- Añadida función `exports.getExplorerFacets`.
- Acepta parámetros: `city`, `professionalTags`, `creativeLevel`, `projectType`.
- Construye el filtro MongoDB base sobre posts (`status: 'accepted'`) y users (`role: 'Creativo'`).
- Ejecuta 5 agregaciones en paralelo con `Promise.all`:
  - **tags**: join posts → users, excluye filtro de tags, agrupa por `professionalTags` de los usuarios que tienen posts aceptados.
  - **city / city2**: join inverso users → posts, excluye filtro de ciudad, cuenta por `city` y `city2` de los usuarios.
  - **levels**: excluye filtro de nivel (`creativeLevel`), cuenta por nivel de usuario.
  - **projectTypes**: excluye filtro de tipo de proyecto, agrupa por `projectType` de los posts.
- Devuelve `{ tags, cities, levels, projectTypes }` con la misma estructura que `/creatives/facets`.

**`backend/routes/posts.js`**
- Añadida ruta `GET /api/posts/explorer/facets` → `postController.getExplorerFacets`.
- Ruta pública (sin `ensureAuthenticated`).

**`frontend/src/pages/explorer/ExplorerPage.jsx`**
- Nuevo estado `facets: { tags: {}, cities: {}, levels: {}, projectTypes: {} }`.
- Effect debounced (250ms) → llama a `/api/posts/explorer/facets` y actualiza `facets`.
- Los 4 grupos de filtros (experiencia, especialidad, ubicación, tipo de proyecto) aplican dimming + `pointerEvents: 'none'` cuando `facetCount === 0` y la opción no está seleccionada.
- `clearAll` resetea `facets` a vacío.

---

### Fix SearchFullScreen en UserExternProfile

**Problema:** En `/username` (UserExternProfile), el panel de búsqueda `SearchFullScreen` solo aparecía cuando el usuario estaba dentro del hero. Al hacer scroll hacia las tabs (portfolio/About), aunque se escribía y se pulsaba Enter, el SearchFullScreen no se mostraba.

**Causa raíz:** La clase `on-white` del header aplica `backdrop-filter: blur(8px)`, que crea un nuevo bloque contenedor para elementos `position: fixed`. Al ser `SearchFullScreen` hijo del `<header>`, quedaba confinado a los 42px de altura del header en modo no-hero.

**`frontend/src/components/controlPanel/userProfile/ExternalProfileHeader.jsx`**
- Añadido `import ReactDOM from "react-dom"`.
- El bloque `{showFullScreenSearch && ...}` extraído del interior del `<header>` y renderizado mediante `ReactDOM.createPortal(..., document.body)`.
- El return ahora envuelve en `<>...</>` para poder devolver `<header>` + portal como siblings.

---

## 2026-04-08 — Open Graph meta tags para perfiles públicos

**Contexto:** Al compartir un enlace de perfil (`thefolder.es/username`) en WhatsApp, Instagram, Telegram, etc., solo aparecía el favicon genérico del sitio. Se implementó generación dinámica de OG tags por usuario.

**Funcionamiento:** Caddy detecta el User-Agent del crawler en rutas `/:username` y redirige la petición al backend. El backend genera HTML con las meta tags correctas y un meta-refresh que devuelve a los usuarios reales al perfil.

### Cambios

**`backend/routes/og.js`** (nuevo)
- Endpoint `GET /og/profile/:username` que consulta MongoDB y devuelve HTML con Open Graph + Twitter Card.
- Prioridad de imagen: `creativeCoverDesktop` → `profile.profilePicture` → última imagen de post → `/og-thefolder.png`.
- Prioridad de descripción: `biography` → `bio` → texto de fallback con mención al usuario.
- La biografía se limpia de HTML (`stripHtml`) y se trunca a 155 caracteres en la última palabra completa.
- Incluye: `og:image:alt`, `og:image:secure_url`, `profile:username/first_name/last_name`, `twitter:image:alt`, `<link rel="canonical">`.
- Cache de 5 minutos (`public, max-age=300, stale-while-revalidate=60`).
- Usuario no encontrado → 302 redirect al frontend.

**`backend/server.js`**
- Registrada la ruta `/og` → `routes/og.js`.

**`Caddyfile`**
- Nuevo matcher `@socialBot`: detecta bots conocidos (Facebook, WhatsApp, Twitter/X, LinkedIn, Telegram, Discord, Google, Slack, Pinterest, Reddit, Applebot, Bing…) en rutas de un único segmento (`path_regexp ^/[A-Za-z0-9._-]+$`), excluyendo todas las rutas conocidas de la app.
- Reescribe `/username` → `/og/profile/username` y lo proxea al backend.

---

## 2026-04-07 — Fix duplicados e imágenes cruzadas en /creatives

**Problema:** Al hacer scroll infinito en `/creatives`, algunos usuarios aparecían duplicados y en ocasiones la imagen de un creativo se mostraba sobre la card de otro.

**Causa raíz (backend):** `userController.js` usaba `$rand: {}` de MongoDB en el pipeline de agregación para ordenar aleatoriamente. `$rand` genera un valor nuevo en cada ejecución del pipeline, por lo que el orden cambiaba entre peticiones de página 1, 2, 3… produciendo usuarios repetidos al acumular resultados.

**Causa raíz (frontend):** El cache-buster de imagen usaba `Date.now()` como fallback cuando el usuario no tenía `updatedAt`, generando una URL distinta en cada render y forzando una recarga de imagen innecesaria. Combinado con keys de React duplicadas (por los duplicados del bug anterior), React reciclaba nodos DOM con imágenes ya cargadas de otro usuario.

### Cambios

**`backend/controllers/userController.js`**
- Reemplazado `{ $rand: {} }` por un hash determinista basado en los bits del `_id` del usuario multiplicados por el `seed` de sesión (`ObjectId × seed % 1000000007`).
- El orden aleatorio es ahora estable para el mismo seed en todas las páginas de la misma sesión.

**`frontend/src/pages/creatives/CreativesPage.jsx`**
- Al acumular resultados de página 2+, se filtran los `_id` ya presentes en el estado → elimina duplicados visibles aunque el backend devuelva alguno.
- Eliminado `Date.now()` como fallback del parámetro `t=` en la URL de imagen → las imágenes sin `updatedAt` se cargan sin cache-buster y no se recargan en cada render.

---

## 2026-04-07 — Límite de subida de imágenes y soporte de GIFs animados

**Contexto:** El límite de multer en posts era 10 MB. Se detectó además que Sharp convertía los GIFs animados a WebP estático (perdiendo la animación) sin avisar al usuario.

### Cambios

**`backend/routes/posts.js`**
- Límite de multer subido de 10 MB → 20 MB por imagen.
- Mensaje de error `LIMIT_FILE_SIZE` actualizado a 20 MB.

**`backend/utils/imageProcessor.js`**
- Los GIFs animados (`metadata.format === 'gif' && metadata.pages > 1`) se pasan a Cloudinary sin procesar, preservando la animación.
- El resto de imágenes siguen el flujo habitual de Sharp.

**`frontend/src/pages/post/CreatePostPage.jsx`**
- Validación inmediata al seleccionar archivos (antes de añadirlos al estado):
  - GIF > 10 MB → rechazado con mensaje específico pidiendo reducir el peso.
  - Imagen > 20 MB → rechazada con mensaje genérico.
  - Archivos válidos del mismo lote sí se añaden aunque haya rechazados.
