# THEFOLDER — Notas de migración: sistema de usuarios

> Documento vivo. Actualizar en cada cambio relacionado con esta migración.
> Última actualización: 2026-10-27

---

## 2026-10-27: GET /api/users/searchUsers busca también por nombre

**Cambio:** `backend/controllers/userController.js` → `searchUsers` busca el término en `username`, `fullName` y `companyName` (antes solo en `username`), ignora una "@" inicial, y devuelve además `fullName` y `companyName` de cada usuario. Lo usa el nuevo campo de créditos de proyecto (`frontend/src/components/credits/CreditPersonField.jsx`, en el editor de proyecto, la subida y el modal de edición): la gente escribe el nombre de quien colaboró y antes no lo encontraba si no sabía su usuario exacto.

**Compatibilidad:** misma ruta, mismo mínimo de 2 caracteres, mismo límite de 10 y mismo filtro `isActive`; solo devuelve más coincidencias y dos campos más. Sin cambios de modelo ni de datos. Los créditos (`peopleTags`) se guardan igual que antes.

---

## 2026-10-27: Analítica del panel de administración (tracking anónimo + GET /api/admin/insights)

**Cambio:**

- **Nuevo modelo `backend/models/PageView.js`:** una página vista por cambio de ruta de la web. Guarda solo el patrón de ruta (`/post/:id`, nunca la URL real), la página anterior, el tipo de pantalla, si había sesión iniciada (sin id de usuario) y el id efímero de la pestaña (sessionStorage). TTL de 400 días, como `Visit`.
- **`backend/models/Visit.js`:** campos nuevos `device` (`mobile` | `tablet` | `desktop` | `unknown`, por defecto `unknown`) y `landingPath` (patrón de la primera página). Las visitas anteriores quedan como `unknown` / `null`.
- **`backend/routes/analytics.js`:**
  - `POST /visit` acepta además `device`, `landingPath` y `referrer` (document.referrer).
  - **Fix:** la procedencia se calculaba con el header `Referer` de la propia petición, que siempre es la web de THEFOLDER, así que casi todas las visitas salían como `other`. Ahora usa el `referrer` que manda el front, y un referrer de la propia web cuenta como `direct`. Las visitas antiguas no se corrigen.
  - Nueva ruta pública `POST /pageview` (`{ session, path, from, device }`, valida formato; 400 si falta algo, 204 si va bien).
- **Nuevo `backend/controllers/adminInsightsController.js` + `GET /api/admin/insights?days=7|30|90|365`** (en `routes/admin.js`, protegida por `ensureAuthenticated` + `ensureAdmin` como el resto). Una sola respuesta con usuarios, tráfico (series por día, dispositivo, procedencia, horas y día × hora en hora de España, páginas de entrada), navegación (páginas más vistas, recorridos, páginas de salida, páginas por visita, rebote), contenido (proyectos, guardados, quién sube más, más guardados), ofertas/candidaturas y moderación. Compara con el periodo anterior de la misma duración.

**Compatibilidad:** solo se añaden campos, un modelo y rutas; `GET /stats`, `/traffic-stats` y `/user-activity` siguen igual. El frontend de usuario manda los campos nuevos (`frontend/src/utils/visitTracking.js`, `components/VisitTracker.jsx`); con un frontend antiguo las visitas siguen funcionando con `device: 'unknown'`. Privacidad: añadida una línea en `PrivacidadPage.jsx` (sección ya marcada como borrador pendiente de revisión legal).

---

## 2026-10-27: GET /api/analytics/profile-stats con datos por periodo (12 meses)

**Cambio:** para elegir un periodo en Estadísticas (`/myprofile/edit/insights`), `backend/routes/analytics.js` → `profile-stats`:

- `viewsByMonth` pasa de los últimos 6 meses a los últimos **12**.
- Campos nuevos: `viewsDaily` (`[{ date: 'YYYY-MM-DD', count }]`, solo días con visitas dentro de esos 12 meses), `savesByMonth` (guardados de imágenes de tus proyectos por mes, según `favorites.savedAt`) y `postsByMonth` (proyectos publicados por mes, según `Post.createdAt`). Los dos últimos con los mismos 12 meses que `viewsByMonth`, rellenos a 0.
- Los seguidores no tienen fecha en el modelo (`User.followers` es una lista de ids), así que no se pueden filtrar por periodo: solo hay total.

**Compatibilidad:** solo se añaden campos y se alarga una serie; el único consumidor de `viewsByMonth` es `InsightsTab.jsx`. Sin cambios de modelo ni de datos.

---

## 2026-10-27: Nuevo GET /api/analytics/saved-images (imágenes guardadas, por número)

**Cambio:** nueva ruta privada (`ensureAuthenticated`) en `backend/routes/analytics.js` para la página "Imágenes guardadas" de Estadísticas (`/myprofile/edit/insights-saves`). Agrupa los `User.favorites` que apuntan a los posts del usuario por `{postId, savedImage}` y devuelve `{ images: [{ postId, postTitle, imageUrl, thumbUrl, count, lastSavedAt }] }`, de más a menos guardadas. `count` = personas que guardan esa imagen (un usuario no puede guardar dos veces la misma). Misma fuente que `totalSaves` de `profile-stats`: la suma de los `count` coincide con ese total.

**Compatibilidad:** solo se añade una ruta; sin cambios de modelo, datos ni de las rutas existentes.

---

## 2026-10-09: Textos de Open Graph sin raya (—)

**Cambio:** por decisión de estilo, ningún texto visible de la web usa la raya "—". En el backend solo afectaba a `backend/routes/og.js` (metadatos que ven los buscadores y las previsualizaciones al compartir un enlace):

- Descripción por defecto de un perfil sin bio: "…en THEFOLDER — el directorio…" pasa a "…en THEFOLDER, el directorio…".
- Título de un post: `${post.title} — ${authorName} | THEFOLDER` pasa a `${post.title} · ${authorName} | THEFOLDER`.

**Compatibilidad:** solo cambia texto; sin cambios de API, modelo ni datos. Las previsualizaciones ya cacheadas por redes sociales se actualizan cuando estas vuelven a leer la página.

---

## 2026-10-05 — Autor de cada imagen guardada en GET /api/folders y GET /api/users/favorites

**Cambio:** para el rediseño de "Guardados" (crédito al autor original en cada imagen), las dos respuestas que alimentan la página incluyen ahora el @username de quien publicó el post:

- `backend/controllers/folderController.js` → `getFolders`: cada `folders[].items[]` lleva además `creatorUsername` y `postTitle`. Nuevo helper `withCreators` que lo resuelve en bloque (1 `Post.find` + 1 `User.find`, no una consulta por imagen). La consulta pasa a `.lean()` (objetos planos en vez de documentos Mongoose; el JSON es el mismo). Nuevo `require('../models/Post')`.
- `backend/controllers/userController.js` → `getFavorites`: cada favorito lleva además `creatorUsername` (ya traía `user` = id del autor y `title`); 1 `User.find` para todos.

**Compatibilidad:** solo se añaden campos; no se quita ni renombra nada → los demás consumidores (`HomeTab.jsx`, pickers de "guardar en carpeta") no cambian. Sin cambios de modelo ni de datos. Si el post ya no existe, `creatorUsername`/`postTitle` llegan vacíos.

---

## 2026-10-04 — Script `npm run dev` para desarrollo local sin Docker

**Cambio:** `backend/package.json` añade `"dev": "node --env-file=.env.local --watch server.js"` (reinicia solo al guardar). Nuevo `backend/.env.local` (ignorado por git) con solo `MONGO_URI=mongodb://localhost:27017/thefolder`; como `dotenv` no sobrescribe variables ya definidas, en dev gana localhost y el resto sale de `.env`. `npm start`, `backend/.env` y los docker-compose **no cambian** → producción idéntica.

También: `.dockerignore` (`node_modules`, `dist`) en backend, frontend y frontend-admin — builds más rápidos y evita copiar los `node_modules` de Windows (p. ej. `sharp`) encima de los de Linux dentro de la imagen. `frontend/vite.config.js` → `server.port: 3000` (solo afecta a `npm run dev`).

Backup de los archivos originales en `backups/dev-setup-2026-10-04/`.

---

## 2026-08-22 — Fix req.user._id → req.user.id + series viewsByDay/viewsByMonth en GET /api/analytics/profile-stats

**Bug encontrado:** `/profile-stats` usaba `req.user._id` en dos sitios (`User.findById` y `Post.find({ user: ... })`), pero `middlewares/auth.js` (`ensureAuthenticated`, JWT) construye `req.user` como `{ id, email, role, ... }` — sin `_id`. Con `req.user._id` siempre `undefined`, ambas queries fallaban y el endpoint devolvía 500; el frontend lo capturaba en silencio (`.catch(() => setStats(null))`) y todas las tarjetas de Métricas/Insights se quedaban en 0 pase lo que pasara (visitas, seguidores, guardados, **proyectos incluidos**). Corregido a `req.user.id` en ambas queries.

**Cambio nuevo:** la respuesta ahora también incluye `viewsByDay` (últimos 14 días) y `viewsByMonth` (últimos 6 meses), arrays `{date/month, count}` con buckets prellenados a 0 en orden cronológico — alimentan las 2 gráficas nuevas debajo de las tarjetas en `InsightsTab.jsx` (`/myprofile/edit/insights`).

---

## 2026-08-22 — followingCount en GET /api/analytics/profile-stats

**Cambio:** `backend/routes/analytics.js` — el select de `User` en `/profile-stats` pasa a incluir también `following` (antes solo `profileViews followers`), y la respuesta suma `followingCount: user.following.length` junto al `followersCount` ya existente. Lo pide el nuevo bloque "seguidores/seguidos" de la tarjeta Métricas en `HomeTab.jsx` (home del editor de perfil), que ahora enlaza a `/community` en vez de solo mostrar visitas.

---

## 2026-07-12 — Nuevo tag de rol "AI Artist" en el grupo 3D & Producto

**Cambio:** Añadido tag `id: "ai-artist"` (label es: "Artista IA") al grupo `3D & Producto` en `backend/utils/ensureTags.js`, order 4 (tras `prototipado-digital`). Traducción añadida en `frontend/src/i18n/locales/{es,en}/filters.json` → `tags.ai-artist`. No hizo falta tocar frontend (los tags de cada grupo se cargan dinámicamente desde `GET /api/tags`, solo los nombres de grupo están hardcodeados).

---

## 2026-07-12 — Reorganización de grupos de tags "role"

**Cambio:** Renombrados/reorganizados 3 grupos de tags `type: "role"` en `backend/utils/ensureTags.js`:
- `Digital & 3D` → `3D & Producto` (se le quita el rol `diseno-grafico`, queda: Diseño moda 3D, Render producto, Prototipado digital)
- `Ilustración` → `Gráfica & Ilustración` (recibe `diseno-grafico` como order 1, queda: Diseño gráfico, Ilustración de moda, Ilustración técnica)
- `Digital & Social` → `Social & Ecommerce` (mismos 5 roles, sin cambios de contenido)

Los `id` de los tags no cambian, solo su campo `group` y el `order` dentro del nuevo grupo — `ensureRoleTags()` sincroniza esto solo con reiniciar el backend (upsert por `id`). `User.professionalTags` guarda solo el `id` del tag, así que ningún perfil pierde su asignación de rol.

**Archivos con el nombre de grupo hardcodeado (mapas de icono/imagen/orden/i18n-key), actualizados en paralelo:**
- `backend/utils/ensureTags.js`
- `frontend/src/pages/onboarding/steps/SpecializationStep.jsx`
- `frontend/src/pages/explorer/ExplorerPage.jsx`
- `frontend/src/pages/creatives/CreativesPage.jsx` (incluye `GUEST_ROLES_BY_GROUP`, datos decorativos del muro de invitados)
- `frontend/src/pages/community/CommunityPage.jsx`
- `frontend/src/components/controlPanel/editProfile/tabs/InfoTab.jsx` — de paso se añadió `GROUP_I18N_KEY` + `tFilters(...)` aquí, que no existía (los nombres de grupo y de tag se mostraban sin traducir, siempre en español, incluso en `en`)
- `frontend/src/i18n/locales/{es,en}/filters.json` — solo se tradujo el *texto* de `groups.digital3d`, `groups.ilustracion`, `groups.digitalsocial`; las claves i18n internas no cambiaron

**Motivo:** Petición del usuario para reflejar mejor el contenido real de cada grupo (Diseño gráfico encaja más con Ilustración que con 3D).

---

## 2026-03-28 — creativeCoverDesktop deprecado: creative-card usa profilePicture

**Cambio:** La imagen que aparece en la `creative-card` del explorador de creativos ya no se coge de `creativeCoverDesktop` sino directamente de `profile.profilePicture` del usuario.

- `backend/controllers/userController.js` — eliminado `creativeCoverDesktop` del `$project` de la pipeline de agregación y del `.select()` del pin "includeMe". Los endpoints `PUT /api/users/creative-cover` y `DELETE /api/users/creative-cover` siguen existiendo pero ya no se llaman desde el frontend.
- `frontend/src/pages/creatives/CreativesPage.jsx` — `coverImageRaw` ahora usa `creative.profile?.profilePicture || creative.lastPost?.mainImage`
- `frontend/src/components/controlPanel/editProfile/tabs/ProfileAppearanceTab.jsx` — eliminado el tab "Explorador" y toda su UI de subida de imagen
- `frontend/src/pages/profile/NewEditProfileContent.jsx` — eliminadas las funciones `uploadCreativeCover`, `deleteCreativeCover`, la ref `creativeCoverFileRef` y sus props correspondientes

**Campo en BD:** `User.creativeCoverDesktop` sigue en el modelo (`backend/models/User.js`) con los datos existentes. No se ha eliminado para no romper documentos existentes. Se puede purgar en una migración futura con `db.users.updateMany({}, { $unset: { creativeCoverDesktop: "" } })`.

**Motivo:** Simplificación del perfil — la foto de perfil ya es la representación visual canónica del usuario en el explorador, sin necesidad de gestionar una imagen adicional.

---

## 2026-03-27 — Sistema de reportes de contenido

**Cambio:** Sistema completo de reportes implementado.
- `backend/models/Report.js` — nuevo modelo (reporter, post, postImage, reason, status)
- `backend/routes/reports.js` — `POST /api/reports` (usuario autenticado) + `GET/PATCH /api/reports` (admin)
- `backend/server.js` — ruta `/api/reports` registrada
- `frontend/src/pages/post/UserPostPage.jsx` — `handleReport` reemplazado: abre modal con textarea de motivo y confirmación, POST al backend
- `frontend-admin` — nueva página `/reportes` con filtros por estado y acciones de revisión

**Motivo:** Los reportes antes se descartaban (solo `alert()`). Ahora se persisten en BD y son visibles en el admin.

**Archivos:** `backend/models/Report.js`, `backend/routes/reports.js`, `backend/server.js`, `frontend/src/pages/post/UserPostPage.jsx`, `frontend-admin/src/pages/ReportsPage.jsx`

---

## 2026-03-27 — Filtros decorativos para usuarios no registrados en /creatives

**Cambio:** `backend/routes/tags.js` — ambos endpoints aceptan ahora `?withPosts=false` como param opcional (default `true`, comportamiento sin cambios para usuarios logueados).

- `GET /api/tags?withPosts=false` → cuenta todos los usuarios (no solo los que tienen posts)
- `GET /api/tags/cities?withPosts=false` → ídem para ciudades

**Frontend `CreativesPage.jsx`:**
- Usuarios no registrados ven un filtro "decorativo" con datos estáticos (`GUEST_ROLES_BY_GROUP`, `LOCATIONS`) — todos los países, ciudades y especialidades siempre visibles
- Al pulsar "Filtrar" → `RegisterModal` inmediatamente (no se aplica ningún filtro)
- Usuarios logueados: comportamiento sin cambios (API con `withPosts=true` implícito, contadores reales, filtrado efectivo)

**Archivos:** `backend/routes/tags.js`, `frontend/src/pages/creatives/CreativesPage.jsx`

---

## 2026-03-27 — Filtros de Ubicación y Especialidad solo con creativos que han publicado

**Cambio:** `backend/routes/tags.js` — los endpoints `GET /api/tags` y `GET /api/tags/cities` ahora solo cuentan usuarios que tienen al menos una publicación (`Post.distinct("user")` como prefilro del aggregate).

**Motivo:** Evitar que ubicaciones y especialidades de usuarios sin ningún post aparezcan en los filtros de `/creatives` y `/explorer`.

**Archivos:** `backend/routes/tags.js`

---

## 2026-03-27 — Sesión persistente 30 días

**Cambio:** JWT de autenticación ampliado de `7d` a `30d` en `backend/controllers/authController.js`.

**Afecta a:**
- Registro por email (verify-code-pre-registration)
- Login por email/contraseña
- Login por Google OAuth

**No afectado:** token de reset de contraseña (se mantiene en `1d` por seguridad).

---

## 2026-03-27 — Fix: auto-seguidos

**Problema:** No existía validación en el backend para impedir que un usuario se siguiera a sí mismo. En el frontend tampoco se ocultaba el botón de seguir en el perfil propio.

**Cambios:**
- `backend/controllers/userController.js` — Ya tenía la validación (`userId === req.user.id`), confirmada como correcta.
- `frontend/src/pages/profile/UserProfilePage.jsx` — Añadida condición `!isOwner` para ocultar el botón de seguir cuando el perfil es del propio usuario.
- `backend/scripts/fix-self-follows.js` — Script de limpieza puntual para eliminar auto-seguidos existentes en la base de datos.

**Cómo ejecutar la limpieza:**
```bash
cd backend
node scripts/fix-self-follows.js
```

---

## Estado anterior

El sistema original tenía un campo `role` (String) con tres valores posibles:

| Valor | Descripción |
|---|---|
| `'Creativo'` | Usuario creativo (fotógrafo, estilista, diseñador, etc.) |
| `'Profesional'` | Empresa, marca, agencia, institución |
| `'Admin'` | Administrador — creado manualmente en BD |

El subtipo se almacenaba en campos numéricos separados:
- `creativeType` (Number 1–5): subtipo del creativo. 1=Estudiante, 2=Graduado, 3=Estilista, 4=Diseñador de marca, 5=Otro
- `professionalType` (Number 1–5): subtipo del profesional. 1=Pequeña marca, 2=Empresa, 3=Agencia, 4=Institución educativa, 5=Otra

El campo `isAdmin` (Boolean) era redundante con `role: 'Admin'` — se chequeaban ambos en paralelo en los middlewares.

Los permisos para crear ofertas de trabajo/educativas se basaban directamente en el valor numérico de `professionalType` (`[1,2,3,5]` para trabajo, `[4]` para educativas).

El onboarding de registro era un wizard multi-ruta con páginas separadas por tipo de usuario (`/creativo/registro`, `/profesional/registro`, `/profesional/registro/datos-personales`, etc.).

---

## Cambios realizados

### Fase 1 — Modelo de datos (2026-03-24)

#### `backend/models/User.js`

**Campos nuevos añadidos** (bloque después de `isAdmin`, líneas 17–26):

| Campo | Tipo | Enum / Default | Descripción |
|---|---|---|---|
| `accountType` | String | `['creative','industry','guest','admin']` / `null` | Sustituye a `role` |
| `creativeLevel` | Number | `[1,2,3,4,5]` / `null` | Nivel del creativo. Solo para `accountType: 'creative'` |
| `creativeLevelName` | String | `['newcomer','graduated','emerging','professional','curated']` / `null` | Label del nivel, en sync con `creativeLevel` |
| `industryType` | String | `['brand','showroom','agency','media','production','other']` / `null` | Sustituye a `professionalType`. Solo para `accountType: 'industry'` |
| `shortDescription` | String | `null` | Descripción corta para perfiles de industria |
| `links` | [String] | `[]` | URLs de redes/web para industria |
| `isScout` | Boolean | `false` | Preparado para uso futuro — no implementado |
| `scoutCompany` | String | `null` | Preparado para uso futuro — no implementado |

**Significado de `creativeLevel`:**

| Valor | Nombre | Descripción | ¿Disponible en registro? |
|---|---|---|---|
| 1 | newcomer | Estudiando actualmente | Sí |
| 2 | graduated | Recién graduado | Sí |
| 3 | emerging | Freelance / proyectos propios | Sí |
| 4 | professional | Trabajo estable — solo por solicitud + validación manual | No |
| 5 | curated | Invitación directa THEFOLDER | No |

**Campos deprecados** (se mantienen en BD, no se borran, no se usan en código nuevo):

| Campo deprecated | Sustituido por | Razón |
|---|---|---|
| `role` | `accountType` | Nuevo sistema de tipos con valores en minúscula |
| `isAdmin` | `accountType: 'admin'` | Redundante con `role`, eliminado del flujo nuevo |
| `creativeType` | `creativeLevel` | Los valores 1–5 tenían significados distintos (estilista, etc.) — sistema nuevo independiente |
| `professionalType` | `industryType` | Numérico → string semántico |
| `formationType` | — | Onboarding viejo de creativo |
| `institution` | — | Onboarding viejo de creativo |
| `creativeOther` | — | Onboarding viejo de creativo |
| `brandName` | — | Onboarding viejo de creativo |
| `foundingYear` | — | Onboarding viejo de profesional |
| `productServiceType` | — | Onboarding viejo de profesional |
| `sector` | — | Onboarding viejo de profesional |
| `employeeRange` | — | Onboarding viejo de profesional |
| `institutionName` | — | Onboarding viejo de profesional |
| `institutionType` | — | Onboarding viejo de profesional |
| `institutionOwnership` | — | Onboarding viejo de profesional |
| `agencyName` | — | Onboarding viejo de profesional |
| `agencyServices` | — | Onboarding viejo de profesional |

**Campos existentes reutilizados sin cambios:**
- `companyName` — se mantiene para perfiles de industria
- `country`, `city`, `customCountry` — datos de ubicación, válidos para todos los tipos
- `profile.profilePicture` — foto de perfil, válida para todos
- `profileHeadlines`, `professionalTags` — etiquetas de perfil, válidas para todos

#### Backend — Endpoints y middlewares (2026-03-24)

**Nuevo endpoint:** `POST /api/auth/complete-registration`
- Requiere JWT (`ensureAuthenticated`)
- Body: `{ accountType, username?, creativeLevel?, city?, country?, industryType?, companyName? }`
- Validaciones por tipo:
  - `creative`: requiere `username`, `creativeLevel` (1–3 únicamente), `city`, `country`
  - `industry`: requiere `username`, `industryType`, `companyName`, `city`, `country`
  - `guest`: no requiere campos extra
- Mapea automáticamente `creativeLevel` → `creativeLevelName`
- Valida username con `validateUsername()` (solo `[a-z0-9-]`) y unicidad case-insensitive
- Escribe `profileCompleted: true` para todos los tipos
- Respuesta `200`: `{ message: 'Perfil completado correctamente.' }`

**Fix `backend/config/passport.js`:**
- Google OAuth ya no guarda `username: profile.displayName`
- Genera username provisional desde el email con `generateProvisionalUsername()` — mismo patrón que `verifyCodePreRegistration`

**Fix `backend/middlewares/auth.js`:**
- `ensureAuthenticated`: añade `accountType` al `.select()` y a `req.user`
- `ensureAdmin`: condición ampliada a `role !== 'Admin' && !user.isAdmin && user.accountType !== 'admin'`

**⚠️ Inconsistencia pendiente:** el frontend wizard permite `[a-z0-9._-]` (puntos y guiones bajos). El backend solo acepta `[a-z0-9-]`. Hay que alinear el frontend al crear el nuevo wizard.

---

### Fase 2 — Backend ✅ (2026-03-24)

#### Backend
- [x] `controllers/authController.js` — `login` y `googleCallback`: añadido `accountType` al payload del JWT (junto a `professionalType` para compatibilidad legacy)
- [x] `controllers/offerController.js` — permisos duales en `createOffer` y `getCompanyOffers`: acepta `professionalType` numérico (viejo) **o** `accountType === 'industry'` (nuevo). `createEducationalOffer` mantiene solo `professionalType: 4` hasta que se defina el tipo educativo en el sistema nuevo.
- [x] `controllers/userController.js`:
  - Directorio de creativos: filtro `$or` — sistema viejo (`accountType: null` + `professionalType` no en [1,2,3,4]) o sistema nuevo (`accountType: 'creative'`)
  - `getAppliedOffers`: condición ampliada a `role !== 'Creativo' && accountType !== 'creative'`
  - CV/Portfolio upload: bloqueo ampliado a `professionalType` [1,2,4] **o** `accountType === 'industry'`
- [x] `controllers/adminController.js`:
  - `getAllUsers`: nuevo parámetro de query `accountType` (+ `industryType`); `role` sigue funcionando si no se pasa `accountType`
  - Dashboard stats: añadidas `porAccountType`, `creativosPorNivel`, `industriaPorTipo` al response
  - `createAdmin`: nuevo admin creado con `accountType: 'admin'` además de `role: 'Admin'` e `isAdmin: true` (todos activos para compatibilidad)

**Nota sobre `createEducationalOffer`:** sigue requiriendo `professionalType: 4`. El enum `industryType` no incluye ningún valor educativo. Decisión pendiente para Fase 3.

#### Frontend — Wizard de registro ✅

**Archivos nuevos / actualizados:**
- `pages/onboarding/OnboardingWizard.jsx` — 5 pasos, solo flujo creativo activo. Submit: PUT foto primero, POST complete-registration después; si la foto falla, se detiene.
- `pages/onboarding/steps/TypeStep.jsx` — paso 1: selector de tipo. Industria y Guest muestran "Próximamente" y están deshabilitados.
- `pages/onboarding/steps/UsernameStep.jsx` — paso 2: username con check de disponibilidad en tiempo real
- `pages/onboarding/steps/PersonalDataStep.jsx` — paso 3 (NUEVO): nombre, apellido, país, ciudad
- `pages/onboarding/steps/CreativeLevelStep.jsx` — paso 4 (NUEVO): nivel 1–4 (Newcomer / Graduated / Emerging / Professional). Nivel 4 se guarda como `creativeLevel: 3` + `requestedCreativeLevel: 4` en backend.
- `pages/onboarding/steps/PhotoStep.jsx` — paso 5 (NUEVO): foto obligatoria. Dispara el submit completo.
- `pages/onboarding/steps/ProfileStep.jsx` — mantenido sin cambios para uso futuro (industria)
- `pages/onboarding/css/onboarding.css` — estilos nuevos, complementa `pages/css/complete-registration.css`
- `backend/models/User.js` — añadido campo `requestedCreativeLevel: { type: Number, default: null }`

**Lógica de detección del wizard** (en `LoginModal.jsx` y `TokenHandler.jsx`):
- `accountType` presente → `/explorer`
- `accountType` null + `profileCompleted: true` → `/explorer` (usuario legacy)
- `accountType` null + `profileCompleted: false` → `/complete-registration` (wizard)

**Archivos modificados:**
- `App.jsx`: `/complete-registration` → `OnboardingWizard`. Ruta legacy movida a `/complete-registration-legacy`.
- `LoginModal.jsx`: detecta wizard tras login.
- `TokenHandler.jsx`: fetch de perfil tras token de Google para aplicar misma detección.

**Deprecated (mantener, no borrar):** `pages/CompleteRegistration.jsx` y todas las páginas del onboarding viejo en `pages/creativos/` y `pages/profesionales/`.

#### Backend — Endpoints adicionales ✅ (2026-03-25)
- [x] `PATCH /api/users/me` (`userController.patchMe`) — actualización parcial whitelisteada. Campos actuales: `creativeLevel` (+ auto-mapea `creativeLevelName`), `city`, `country`, `bio`, `professionalTitle`. Fácilmente extensible añadiendo campos al array `PATCH_ME_WHITELIST`.
- [x] `GET /api/posts/explorer` actualizado — acepta filtros por propiedades del autor: `city[]`, `country[]`, `creativeLevel[]`, `professionalProfile[]`. Si hay filtros: primero busca user IDs que coincidan, luego filtra posts por esos IDs. Sin filtros: comportamiento original ($sample aleatorio).
- [x] `PUT /api/users/profile` (`userController.updateProfile`) — añadido soporte para `creativeLevel` (2026-03-25). Validado fuera del whitelist genérico: acepta valores 1–5, auto-sincroniza `creativeLevelName`. Permite al usuario actualizar su nivel desde `/myprofile/edit`.

#### Cambio de nombre de usuario ✅ (2026-03-25)
- [x] `PUT /api/users/change-username` (`userController.changeUsername`) — permite al usuario autenticado cambiar su propio username. Valida con `validateUsername()` (mismo helper que el registro: solo `[a-z0-9-]`, max 20 chars, sin guión doble ni en extremos, sin nombres reservados). Rechaza si el username ya pertenece a otro usuario (`409`). Rechaza si coincide con el actual (`400`). Respuesta `200`: `{ message, user }` con el documento actualizado.
- [x] `GET /api/users/check-username?username=xxx` — ya existía para el onboarding; reutilizado en la pantalla de settings para comprobar disponibilidad en tiempo real con debounce de 350 ms.

#### Validación de nivel Professional ✅ (2026-03-25)
- [x] `PATCH /api/users/me` y `PUT /api/users/profile` — nivel 4 (professional) ya no se aplica directamente. En su lugar: `requestedCreativeLevel: 4` queda pendiente; si el usuario no tenía `creativeLevel`, se le asigna `3 / emerging` como nivel provisional. Seleccionar nivel 1–3 limpia `requestedCreativeLevel`.
- [x] `GET /api/admin/pending-professionals` — devuelve todos los usuarios con `requestedCreativeLevel: 4`, ordenados por fecha de registro desc.
- [x] `PUT /api/admin/users/:userId/validate-professional` — body `{ action: 'approve' | 'reject' }`. approve: `creativeLevel: 4`, `creativeLevelName: 'professional'`, `requestedCreativeLevel: null`. reject: `requestedCreativeLevel: null` (mantiene nivel actual).
- **Filtrado explorer/creativos**: los usuarios con `requestedCreativeLevel: 4` tienen `creativeLevel: 3` (emerging), por lo que el filtrado es transparente — no requiere cambios en los endpoints de exploración.

#### Frontend — Explorer filtros + reclasificación ✅ (2026-03-25)
- [x] `contexts/AuthContext.jsx` — añadida función `updateUser(partialUser)` para actualizar campos parciales del usuario en estado y localStorage sin forzar un nuevo login.
- [x] `components/modals/ReclassifyModal.jsx` + `ReclassifyModal.css` — modal no bloqueante para usuarios legacy (`role: 'Creativo'` sin `creativeLevel`). Muestra los 4 niveles creativos. Llama a `PATCH /api/users/me`. Opciones: "Confirmar", "Ahora no" (sessionStorage), "No volver a mostrar" (localStorage). Función helper exportada `shouldShowReclassify(user)`.
- [x] `pages/explorer/ExplorerPage.jsx` — añadidos 3 filtros (Ubicación, Especialidad, Experiencia) usando el mismo patrón UI de `/creatives` (chips + modal). Los filtros generan params para el endpoint actualizado. Muestra `ReclassifyModal` 1.2s tras montar si el usuario califica.
- [x] `pages/explorer/ExplorerPage.jsx` (2026-03-25) — añadido filtro **Tags de proyecto** (`projectType`): sección en el modal de filtros, posicionada después de Especialidad, muestra los tipos como hashtags (`#editorial`, `#fashionfilm`…). Backend `getExplorerPosts` ya aceptaba `projectType[]` — solo faltaba exponerlo en la UI.

#### Frontend — Explorer filtros UI ✅ (2026-03-26)
- [x] `pages/explorer/ExplorerPage.jsx` — sección "Nivel de experiencia" (antes "Nivel Creativo") rediseñada: cards con icono + label + descripción corta, misma estética que los filtros del explorer.
- [x] `pages/explorer/ExplorerPage.jsx` — filtro **Ubicación** refactorizado: país → ciudad en dos niveles. Tags de país con emoji de bandera (o imagen en `/iconos/flag/`) + panel de ciudades al seleccionar. Multi-selección libre entre países. `LOCATIONS`/`ALL_COUNTRIES`/`COUNTRY_CODES` importados de `utils/locations.js`.
- [x] `pages/explorer/ExplorerPage.jsx` — filtro **Especialidad del creativo** actualizado al mismo patrón: grupos como tags con icono de círculo (de `/iconos/specialty/`) + panel de roles al seleccionar. `GROUP_ICONS` map extensible.
- [x] `pages/explorer/ExplorerPage.jsx` — filtro **Tags de proyecto**: hover sobre tag muestra imagen real del post asociado como fondo con overlay oscuro. Solo se muestran tags que tengan al menos un post. Imagen servida por `GET /api/posts/tag-previews`.

#### Backend — Endpoints nuevos ✅ (2026-03-26)
- [x] `GET /api/posts/tag-previews` (`postController.getTagPreviews`) — sin autenticación. Devuelve `{ previews: { "Editorial": "https://...", ... } }` con una imagen Cloudinary random por cada `projectType` que tenga al menos un post con imágenes. Usa `$sample: 500` + `$unwind` + `$group` para aleatoriedad eficiente. Solo incluye los 20 `projectTypes` definidos en `EXPLORER_PROJECT_TYPES`. Registrado en `routes/posts.js` antes de la ruta `/:id` para evitar conflictos de parámetros.

#### Frontend — App general
- [ ] `CreateOfferPage.jsx` y `CreateEducationalOfferPage.jsx` — reemplazar chequeo `user.role === 'Profesional'` por `user.accountType === 'industry'`
- [ ] `MisOfertasSection.jsx` — reemplazar `userRole === 'Creativo'` por `accountType === 'creative'`
- [ ] `MiPerfilPage.jsx`, `UserProfilePage.jsx`, `NewEditProfileContent.jsx` — reemplazar chequeos de `professionalType === 1/2/3/4` por `industryType`
- [ ] `CommunityPage.jsx`, `UserPostPage.jsx` — mismo reemplazo
- [ ] `ProfileRoot.jsx` — deprecar `getCreativeTypeText` (usa valores de `creativeType` viejo), añadir función para `creativeLevel`
- [ ] `Header.jsx` — reemplazar lectura de `professionalType` por `accountType`/`industryType`

#### Frontend Admin
- [ ] `UsersPage.jsx` — actualizar filtros de rol y subtipo para usar `accountType`/`creativeLevel`/`industryType`
- [ ] `UserDetailPage.jsx` — actualizar dropdown de rol, lógica de `isAdmin`, sección de datos de profesional
- [ ] `AuthContext.jsx` — actualizar chequeo de admin para usar `accountType === 'admin'`
- [ ] `userService.js` — actualizar parámetros de query

---

## Mapa de campos deprecated → nuevos

| Campo viejo | Tipo viejo | Campo nuevo | Tipo nuevo | Notas |
|---|---|---|---|---|
| `role: 'Creativo'` | String | `accountType: 'creative'` | String | — |
| `role: 'Profesional'` | String | `accountType: 'industry'` | String | Renombrado a "Industria" |
| `role: 'Admin'` | String | `accountType: 'admin'` | String | — |
| `isAdmin: true` | Boolean | `accountType: 'admin'` | String | Eliminado como campo independiente |
| `creativeType: 1` | Number | `creativeLevel: 1 / creativeLevelName: 'newcomer'` | Number/String | Los valores 1–5 tienen significados distintos en el sistema nuevo |
| `creativeType: 2` | Number | `creativeLevel: 2 / creativeLevelName: 'graduated'` | Number/String | — |
| `creativeType: 3` | Number | `creativeLevel: 3 / creativeLevelName: 'emerging'` | Number/String | El antiguo 3 era "Estilista" (subtipo), el nuevo 3 es nivel de carrera |
| `professionalType: 1` | Number | `industryType: 'brand'` | String | Pequeña marca → brand |
| `professionalType: 2` | Number | `industryType: 'agency'` | String | Empresa mediana-grande → agency o brand según contexto |
| `professionalType: 3` | Number | `industryType: 'agency'` | String | Agencia/scout → agency |
| `professionalType: 4` | Number | `industryType` + `accountType: 'industry'` | String | Institución educativa → pendiente definir valor exacto |
| `professionalType: 5` | Number | `industryType: 'other'` | String | — |

---

## Decisiones de diseño

**¿Por qué `accountType` en vez de mantener `role`?**
Para separar semánticamente el "tipo de cuenta" (qué puede hacer el usuario en la plataforma) del campo `role` que se usaba de forma inconsistente (a veces como tipo, a veces como permiso). Los valores en minúscula (`creative`, `industry`) evitan confusión con los valores antiguos en mayúscula.

**¿Por qué `creativeLevel` es independiente de `creativeType` (no migración directa)?**
El `creativeType` viejo era un subtipo descriptivo (qué tipo de creativo eres: estilista, fotógrafo, etc.). El `creativeLevel` nuevo es un nivel de carrera/estado profesional. Son conceptos distintos — no hay equivalencia directa. Se mantienen ambos campos en BD para no perder datos históricos.

**¿Por qué `default: null` en los campos nuevos?**
Para que los documentos existentes en MongoDB no se vean afectados. Un usuario antiguo con `role: 'Creativo'` tendrá `accountType: null` hasta que se migre o vuelva a hacer login en el flujo nuevo. Evita romper queries que filtren por `accountType` con un valor inesperado.

**¿Por qué Guest como `accountType` y no como ausencia de tipo?**
Para poder distinguir activamente "usuario que eligió no tener perfil público" de "usuario que aún no ha completado el onboarding". Un usuario sin `accountType` es un estado transitorio; un Guest es una elección explícita.

**¿Por qué `creativeLevelName` además de `creativeLevel` (número)?**
Para no depender de un switch/mapping en cada punto del frontend que muestre el nivel. El nombre semántico viaja directamente en el documento y puede mostrarse sin transformación.

---

#### Frontend — Explorer + Creatives filtros UI ✅ (2026-03-27)

- [x] `pages/explorer/ExplorerPage.jsx` — filtro "Especialidad del creativo": ahora se ocultan los tags y grupos que no tienen ningún creativo asignado. Filtro aplicado en carga (`count > 0`) sobre los datos devueltos por `GET /api/tags?type=role&status=active`. El campo `count` ya era calculado por el backend (agregación sobre `User.professionalTags`) — sin cambios en backend.

- [x] `pages/creatives/CreativesPage.jsx` — sistema de filtros completamente reescrito para ser idéntico al del `/explorer` en diseño y funcionalidad:

  | Aspecto | Antes | Después |
  |---|---|---|
  | Trigger | 3 botones separados (Ubicación / Especialidad / Experiencia) | 1 botón "Filtros" con icono |
  | Modal | 3 paneles overlay independientes | 1 modal combinado con todas las secciones |
  | Especialidad | Lista de dos columnas sin iconos | Tags con `GROUP_ICONS` por categoría + expansión inline |
  | Ubicación | Lista de dos columnas con `.filters-list-item` | Tags con banderas (`FLAG_IMAGES` / emoji) + `.filter-country-tag` |
  | Experiencia | Solo label | Icono + label + descripción (`experience-tag`) |
  | Debounce | 600 ms | 400 ms |
  | Chips activos | `isMobile ? appliedFilters : filters` | Siempre `appliedFilters` (useMemo) |
  | `hasActiveFilters` | Estado calculado en el debounce | Derivado de `activeChips.length > 0` |
  | Tags sin creativos | Filtrado tardío en useMemo | Filtrado en carga con `count > 0` |
  | CSS | Solo `Creatives.css` | `explorer.css` + `Creatives.css` |

  > No hubo cambios en backend. Los endpoints `/api/tags?type=role&status=active` y `/api/tags/cities` ya devolvían `count` correctamente.

- [x] `pages/community/CommunityPage.jsx` — sistema de filtros igualado al del `/explorer`. Además se añadió el filtro **Experiencia** (`creativeLevel`), que no existía. Cambios:

  | Aspecto | Antes | Después |
  |---|---|---|
  | Trigger | 2 botones separados (Ubicación / Especialidad) | 1 botón "Filtros" con icono |
  | Modal | 2 paneles overlay independientes | 1 modal combinado con todas las secciones |
  | Especialidad | Lista de dos columnas sin iconos | Tags con `GROUP_ICONS` por categoría + expansión inline |
  | Ubicación | Lista de dos columnas con `.filters-list-item` | Tags con banderas (`FLAG_IMAGES` / emoji) + `.filter-country-tag` |
  | Experiencia | No existía | Añadido: icono + label + descripción, solo muestra niveles presentes en los perfiles cargados |
  | Filtrado | Local sobre `profiles` (sin `creativeLevel`) | Local sobre `profiles` (incluye `creativeLevel`) |
  | Chips activos | `filters` directo | `filters` vía useMemo (incluye `creativeLevel`) |
  | `hasActiveFilters` | `city.length > 0 || professionalProfile.length > 0` | `activeChips.length > 0` |
  | CSS | Solo `MyComunity.css` | `explorer.css` + `MyComunity.css` |

  > El filtrado en Community sigue siendo local (sobre los perfiles ya cargados de seguidos/seguidores), sin cambios en backend. Las secciones Experiencia, Ubicación y Especialidad solo se muestran si hay perfiles con esos datos en la lista actual.

---

#### Backend + Frontend — Nueva página "Organiza tus proyectos" (`/proyectos/organizar`) ✅ (2026-07-12)

- [x] `backend/routes/sections.js` — `MAX_SECTIONS` cambiado de `3` a `4`. El modelo `Section` (`user`, `name`, `posts: [Post]`) y el resto del CRUD (`GET/POST /api/sections`, `PUT/DELETE /api/sections/:id`, `POST /api/sections/:id/posts`, `DELETE /api/sections/:id/posts/:postId`) ya existían y no se tocaron — no había endpoint `GET /api/sections/:id` (single), así que las páginas nuevas listan todas las secciones y filtran por id en cliente.
- [x] Nuevo namespace de i18n `projects.json` (es/en), registrado en `i18n/index.js`.
- [x] `pages/proyectos/OrganizeProjectsPage.jsx` (`/proyectos/organizar`) — vista única (sin tabs), mismo patrón que el rediseño de Guardados: sección "Páginas" (grid de hasta 4, tarjeta punteada "nueva página" que desaparece al llegar al máximo) + sección "Sin asignar" con modo selección múltiple in-place (sustituye la cabecera por una barra de acción negra; en mobile pasa a sticky-bottom con el desplegable de páginas como bottom sheet). Reutiliza CSS de `Guardados.css` (`.gf-page/.gf-section*`, `.gf-folders-grid`, `.confirm-delete-*`) — solo se creó CSS nuevo para lo que no tenía equivalente: `PageCard.css` (tarjeta "ventana": barra decorativa no interactiva + 3 huecos de portada) y `SelectionActionBar.css`.
- [x] `pages/proyectos/ProjectPagePage.jsx` (`/proyectos/organizar/pagina/:pageId`) — detalle de una página, mismo patrón 1-a-1 que `FolderContentPage.jsx` (quitar / mover a otra página por proyecto). Reutiliza `FolderPickerPopover.jsx` (ya genérico, sin cambios) para el desplegable de mover.
- [x] "Sin asignar" se calcula en cliente como *posts del usuario menos la unión de `.posts` de TODAS las páginas* — corrige un bug del tab antiguo (`ProyectosTab.jsx`), donde el picker de una página solo excluía los proyectos ya asignados a *esa* página, permitiendo que un proyecto quedara en dos páginas a la vez. La única vía para asignar en la página nueva es mover desde "Sin asignar", así que la exclusividad queda garantizada por diseño.
- [x] **Se retiró el tab "Organiza proyectos" del editor** (`ProyectosTab.jsx`/`.css` eliminados, junto con las claves `profile.editProfile.proyectosTab.*` que quedaron huérfanas). El nav "Organiza proyectos" en `PanelSidebar.jsx` pasó de `go("proyectos")` (tab interno) a `navigate("/proyectos/organizar")`, igual que Guardados/Community. `HomeTab.jsx` (preview de páginas en el dashboard) actualizado para navegar a la página nueva en vez de `setTopTab("proyectos")`.

---

#### Backend — `profileViewsLast30Days` en `/api/analytics/profile-stats` ✅ (2026-10-03)

- [x] `backend/routes/analytics.js` — `GET /api/analytics/profile-stats` devuelve un campo nuevo `profileViewsLast30Days` (ventana móvil de 30 días sobre `User.profileViews`, no se resetea el día 1 como `profileViewsThisMonth`). Aditivo: el resto de campos no cambia. Lo consume la cifra "Profile views" del rediseño del Panel (`HomeTab.jsx`).

---

#### Backend — Punto de enfoque de las portadas (`featuredHeaderFocusDesktop` / `featuredHeaderFocusMobile`) ✅ (2026-10-10)

- [x] `backend/models/User.js` — dos campos nuevos `{ x, y }` (Number 0–100, subdocumento sin `_id`, por defecto `null`): qué parte de la portada desktop/mobile se ve cuando el hero la recorta. El frontend los aplica como `object-position` en los heros de Classic; `null` = sin elegir, cada hero mantiene su encuadre de siempre (algunos `top center`). Sin migración.
- [x] `backend/controllers/userController.js` — `updateProfile`: ambos campos en `ALLOWED_FIELDS`, normalizados a enteros 0–100 o `null` (cualquier otro valor se descarta). `updateFeaturedHeaderImageVariant` / `deleteFeaturedHeaderImageVariant` lo vuelven a `null` en esa variante (imagen nueva o sin imagen).
- [x] Lo usa el diálogo "Imagen de portada" de `/myprofile/edit/templates` (`ProfileAppearanceTab.jsx`).
- [x] (mismo día) Mobile sin portada propia: el hero mobile enseña la de desktop (antes saltaba a `featuredHeaderImage`/proyecto/foto de perfil) y se le aplica `featuredHeaderFocusMobile`. Por eso `coverFocusResets()` en `userController.js`: al subir o borrar la portada **desktop** de un usuario sin portada mobile propia, también resetea `featuredHeaderFocusMobile` (ese encuadre era para la imagen de desktop).

---

#### Backend + Frontend — June Stamp: se retira la opción "Ambas" del grid de Portfolio ✅ (2026-10-10)

- [x] `backend/controllers/userController.js` — `updateProfile` ya solo acepta `juneStampGalleryMode` = `"projects"` | `"gallery"`; `"both"` se descarta como cualquier otro valor no válido.
- [x] `backend/models/User.js` — `juneStampGalleryMode` pasa a `default: "projects"` (antes `"both"`). `"both"` se mantiene en el `enum` solo para no romper documentos antiguos que lo tengan guardado. Sin migración: el frontend trata `"both"` (o cualquier valor que no sea `"gallery"`) como `"projects"`.
- [x] Frontend: en `/myprofile/edit/templates` (`ProfileAppearanceTab.jsx`, bloque "Design options") desaparece la tercera opción "Ambas". En `PortfolioGrid.jsx` (JuneStamp) se elimina el botón `.js-grid-toggle` "Ver galería de fotos / Ver proyectos": el visitante ya no puede cambiar de vista. Claves i18n `editProfile.galleryModeBoth*` y `juneStamp.gallery.*` eliminadas.
