# Arquitectura de plantillas de portfolio

Estructura, páginas, componentes y estado de las 4 plantillas de perfil
actuales (`frontend/src/pages/profile/portfolioTemplates/`), con foco en
**June Stamp** y **Daisy Film** — que comparten arquitectura — y un repaso de
**Classic** para dejar claro en qué se aparta.

Objetivo de este documento: que sirva de **referencia de estructura final**
al crear una plantilla nueva — no es un registro de cambios, describe cómo
está organizado el código hoy. Para la checklist mecánica de los 6 sitios a
tocar (Mongoose, controller, ruteo, selector de apariencia, i18n), ver
[`instrucciones-nueva-plantilla-perfil.md`](./instrucciones-nueva-plantilla-perfil.md) —
ese documento cubre el **dónde**; este cubre el **cómo**.

---

## 1. Idea central: mismos datos, distinta piel

Las 4 plantillas pintan exactamente los mismos datos de un usuario (perfil,
posts, páginas organizadas) — ninguna tiene su propio modelo ni su propia
fuente de datos. Lo único que cambia entre plantillas es **cómo se
organizan visualmente**: navegación, grid del portfolio, si hay página de
proyecto propia, etc.

Esa idea se refleja literalmente en el código: **toda la lógica de datos y
comportamiento de June Stamp y Daisy Film vive en un único hook,
`shared/usePortfolioTemplateState.js`**. Ninguno de los dos
`XxxTemplate.jsx` tiene un solo `useState`/`useEffect` de negocio propio —
llaman al hook y pintan su maqueta con lo que les devuelve. La plantilla es,
literalmente, una función de `datos → JSX`.

| | Daisy Film | June Stamp |
|---|---|---|
| Portfolio | galería vertical de fotos sueltas (una imagen = un `<button>`) | grid asimétrico de tarjetas por proyecto (o galería de fotos alterna) |
| Navegación | `TopBar` horizontal arriba | `Sidebar` vertical fija a la izquierda |
| Prefijo CSS | `df-` | `js-` |
| Proyecto individual | intro antes que las fotos, `Footer` dentro de la propia vista | fotos antes que la intro, `Footer` fuera (ancho completo) |

`RebecasGallery` y `Classic` (las otras 2 plantillas) también viven bajo
`portfolioTemplates/` y comparten parte de `shared/`, pero no siguen esta
arquitectura de páginas propias. Ver §12 para Classic.

---

## 2. Estructura de carpetas

```
frontend/src/pages/profile/portfolioTemplates/
├── shared/
│   ├── usePortfolioTemplateState.js  ← TODO el estado/efectos/handlers de June Stamp y Daisy Film
│   ├── ProjectView.jsx               ← vista de proyecto individual (las dos plantillas)
│   ├── ProjectActionModals.jsx       ← modales "reportar" / "eliminar proyecto"
│   ├── HeroSlideshow.jsx             ← carrusel "gif" de portada (About/Contact)
│   ├── QuickActions.jsx / .css       ← tarjeta flotante volver/seguir/publicar/organizar
│   ├── BackButton.jsx / .css
│   └── EditAboutOverlay.jsx / .css
│
├── DaisyFilm/
│   ├── DaisyFilmTemplate.jsx         ← llama al hook + pinta su maqueta
│   ├── DaisyFilmTemplate.css
│   └── components/
│       ├── TopBar.jsx                ← nav horizontal (Portfolio/páginas/About/Contact)
│       ├── PortfolioGallery.jsx      ← grid de fotos del portfolio
│       ├── AboutPage.jsx             ← hero + CV (usa shared/HeroSlideshow)
│       ├── ContactPage.jsx           ← email/redes/representación
│       ├── OrganizeProjectsOverlay.jsx ← overlay "organizar proyectos" (usado por las 4 plantillas vía QuickActions)
│       └── Footer.jsx
│
└── JuneStamp/
    ├── JuneStampTemplate.jsx         ← llama al mismo hook + pinta su maqueta
    ├── JuneStampTemplate.css
    └── components/
        ├── Sidebar.jsx               ← nav vertical (equivalente a TopBar)
        ├── PortfolioGrid.jsx         ← grid asimétrico + toggle galería
        ├── AboutPage.jsx
        ├── ContactPage.jsx           ← usa shared/HeroSlideshow
        └── Footer.jsx
```

Nótese lo que **no** existe: no hay `ProjectOverlay.jsx` en `DaisyFilm/` ni
`ProjectPage.jsx` en `JuneStamp/` — esa vista es `shared/ProjectView.jsx`
para las dos, parametrizada (ver §6.5). `OrganizeProjectsOverlay.jsx` vive
físicamente en `DaisyFilm/components/` pero `shared/QuickActions.jsx` lo
importa desde ahí para las 4 plantillas — no está duplicado en ningún otro
sitio.

---

## 3. Sistema de rutas (`App.jsx`)

June Stamp y Daisy Film viven detrás de las mismas 5 rutas (definidas una
sola vez a nivel de app, no por plantilla):

```
/:username                       → UserProfile section="portfolio"
/:username/about                 → UserProfile section="about"
/:username/contact                → UserProfile section="contact"
/:username/project/:projectSlug  → UserProfile (sin section)
/:username/:pageSlug             → PublicPortfolioPage (página organizada)
```

`:username/project/:projectSlug` usa el segmento literal `project` para no
chocar con `:pageSlug` (una página organizada por el usuario podría llamarse
igual que un slug de proyecto — el segmento fijo lo desambigua).

`UserProfilePage.jsx` decide qué plantilla montar según
`profile.profileLayout` (o `?layout=` en preview) y le pasa `section` como
prop. El componente raíz de la plantilla nunca lee la URL directamente para
saber la sección — lee `section` (prop) y `projectSlug`/`pageSlug`
(`useParams()`, dentro del hook).

### Valores de `profileLayout` (enum en `backend/models/User.js`)

| Valor persistido | Plantilla | Nota |
|---|---|---|
| `default` | Classic | — |
| `studio-gallery` | Rebeca's Gallery | nombre visible cambió, id no ([[project_portfolio_templates_reorg]]) |
| `daisy-film` | Daisy Film | — |
| `index-gallery` | June Stamp | antes "Editorial Index", id no cambió ([[project_junestamp_rebuild]]) |

Classic (`default`) es la única sin ruteo por páginas propias — ver §12.

---

## 4. Props recibidas desde `UserProfilePage`

Idénticas en ambas plantillas (mismas que recibe `usePortfolioTemplateState`,
más las de seguir/follow que solo usa la maqueta):

```
profile, username, section, userPosts, postsLoading, portfolioPages,
isOwner, isLoggedIn, isCompany, isEducationalInstitution,
isFollowing, followLoading, handleFollow, handleUnfollow,
onProjectsChanged, isPreview
```

June Stamp además recibe `galleryDisplayMode` (de
`profile.juneStampGalleryMode`, ver §6.2) — el único dato de la plantilla que
no pasa por el hook, porque solo lo consume `PortfolioGrid`.

---

## 5. `shared/usePortfolioTemplateState.js`

Un único hook con toda la lógica de datos y comportamiento — DaisyFilm y
JuneStamp lo llaman con las mismas props y reciben exactamente lo mismo:

```js
const {
  navigate,
  viewMode, setMode, openProject, projectSlug, pageSlug,
  openPost, displayPost, editedPost, setEditedPost, projectImages,
  showEditModal, openEditModal, closeEditModal, onPostSaved,
  isProjectSaved, toggleSaveProject,
  showMoreMenu, setShowMoreMenu, moreMenuRef,
  showReportModal, openReportModal, closeReportModal,
  reportReason, setReportReason, reportSubmitting, reportSent, handleSubmitReport,
  handleCopyLink, handleDownloadProject,
  showDeleteProjectModal, setShowDeleteProjectModal, deletingProject, handleDeleteProject,
  showEditAbout, setShowEditAbout, editedProfile, setEditedProfile, displayProfile,
  allSlidePosts, heroImages, activePage, scopedPosts,
  displayName, profileImage, location,
  experience, education, skills, software, languages, awards, press, hasCv,
} = usePortfolioTemplateState({
  profile, username, section, userPosts, portfolioPages,
  isOwner, isLoggedIn, isCompany, isEducationalInstitution,
  onProjectsChanged, isPreview,
});
```

Cada `XxxTemplate.jsx` solo añade, por su cuenta, lo que de verdad es
distinto por plantilla (ver §6): el nav (`TopBar`/`Sidebar`), qué se pinta en
cada `viewMode`, y un par de datos derivados exclusivos de su propia maqueta
(ej. `slides`/`slidePosts` en DaisyFilm, que su `PortfolioGallery` necesita
como pares imagen/post en vez de posts sueltos).

### Qué encapsula el hook

1. **`viewMode`** (`"portfolio"|"about"|"contact"` — nombre canónico único;
   antes DaisyFilm usaba internamente `"individual"` para lo mismo, se
   unificó al fusionar la lógica) — lazy initializer a partir de `section`,
   resincronizado en un `useEffect([section])` porque la plantilla no se
   remonta al navegar entre esas rutas.
2. **`openPost`/`editedPost`/`displayPost`** — el proyecto abierto se
   resuelve contra la URL (`projectSlug` vía `findPostBySlug`), no contra un
   click en memoria: así `/:username/project/:slug` funciona igual si se
   llega por click o por carga directa/compartir el link. `editedPost` guarda
   la edición local tras `EditPostModal` hasta que `userPosts` se refresque
   desde el padre.
3. **`showEditAbout`/`editedProfile`/`displayProfile`** — overlay de edición
   rápida del perfil (`shared/EditAboutOverlay.jsx`), mismo patrón de
   "edición local hasta refresco del padre".
4. **Acciones sobre el proyecto abierto**: guardar/quitar de favoritos
   (`isProjectSaved`/`toggleSaveProject`), menú "más" (copiar link/descargar/
   reportar — `showMoreMenu`+`moreMenuRef`), reportar
   (`showReportModal`/`reportReason`/`reportSubmitting`/`reportSent`/
   `handleSubmitReport`), eliminar (`showDeleteProjectModal`/
   `deletingProject`/`handleDeleteProject`).
5. **`heroImages`** (`useMemo`) — hasta 6 fotos random del usuario
   (Fisher-Yates shuffle) para el carrusel de About/Contact, recalculado solo
   si cambian `userPosts`.
6. **Recorte por página organizada**: `allSlidePosts` (todos los posts con
   imagen, base para los slugs — nunca se recorta por página, así un
   proyecto tiene el mismo link se abra desde el portfolio completo o desde
   una página), `activePage`/`scopedPosts` (un proyecto ya asignado a una
   página no se repite en el Portfolio general).
7. **Datos de perfil**: `displayName`, `profileImage`, `location`, y los
   campos de CV (`experience`/`education`/`skills`/`software`/`languages`/
   `awards`/`press`/`hasCv`, con los borradores — `isDraft: true` — ya
   filtrados).
8. **Navegación**: `setMode` (navega a la URL de la sección — pulsar la
   pestaña ya activa vuelve a portfolio, salvo si hay un proyecto/página
   abierta, en cuyo caso siempre navega directo sin toggle), `openProject`
   (navega a `/:username/project/:slug`), y `withPreviewQuery` aplicado
   internamente a toda navegación (ver §10) — no hace falta que la plantilla
   lo llame, ya viene resuelto en `setMode`/`openProject`/etc.

### Efectos que corren dentro del hook, no en la plantilla

- Sincronizar `viewMode` con `section`.
- Resolver `openPost` desde la URL (`useEffect([projectSlug, userPosts])`).
- **Scroll a 0 al cambiar de proyecto/página/sección** — `useLayoutEffect`
  (no `useEffect`, para que corra antes del pintado y no se vea el salto).
  Resetea varios candidatos a scroller (`window`, `documentElement`, `body`,
  `.dashboard-content`) porque `AppLayout` a veces hace scrollear el
  contenedor interno en vez del documento. Comportamiento único para las dos
  plantillas — antes solo lo tenía JuneStamp, se generalizó a Daisy Film al
  unificar la lógica.
- Estado "guardado" del proyecto (favorito) — solo para visitantes logueados
  viendo un proyecto ajeno: `GET /api/users/favorites`, compara por
  `postId` + imagen.
- Cerrar el menú "más" al click fuera o Escape.

---

## 6. Componentes por sección

### 6.1 Navegación — `TopBar` (DaisyFilm) / `Sidebar` (JuneStamp)

No están unificados (identidad visual genuinamente distinta: barra
horizontal vs. panel con identidad del usuario), pero comparten prop
signature: `viewMode, setMode, portfolioPages, username, projectOpen, activePageSlug`.
Ambos filtran `portfolioPages` a las que tienen `slug` y al menos 1 post.
Cada página organizada es un `<Link>` real a `/:username/:pageSlug` (no un
botón con estado local) — así el link es compartible y sobrevive a un
reload. `Sidebar` añade `toTitleCase()` porque el nombre de página es texto
libre del dueño y CSS `text-transform:capitalize` no corrige palabras ya en
mayúsculas.

### 6.2 Portfolio — `PortfolioGallery` (DaisyFilm) / `PortfolioGrid` (JuneStamp)

Tampoco unificados — el layout es la razón de ser de cada plantilla:

- **DaisyFilm**: lista plana de `slides`/`slidePosts` (una imagen principal
  por post), sin variantes de layout.
- **JuneStamp**: patrón cíclico de 3 anchos de columna (`COL_PATTERN`, grid
  de 12 columnas) para la vista "proyectos", más una vista "galería"
  alternativa (`buildGalleryItems`) que despliega **todas** las fotos de
  todos los proyectos, 4 por fila, alineando a la derecha la última fila
  incompleta de cada proyecto. Qué vista se usa depende de
  `profile.juneStampGalleryMode` (`"projects"|"gallery"`; el antiguo `"both"` con toggle para el visitante se retiró y se trata como `"projects"`).

Ambos abren el proyecto con `onOpenPost(post)` → `openProject` del hook.

### 6.3 `AboutPage`

Misma forma de datos en ambas (recibida del hook: `experience, education,
skills, software, languages, awards, press, hasCv`, más
`displayName`/`profileImage`), maqueta propia por plantilla:
- `datePoint(month, year)` traduce el mes numérico (1-12) a abreviatura vía
  i18n (`months.jan`...`months.dec`) y lo junta con el año — misma función,
  copiada en cada `AboutPage.jsx` (no extraída: es 2 líneas y depende de `t`
  local a cada componente).
- Secciones condicionales: Experiencia → Educación → Prensa → Premios →
  (Software / Skills / Idiomas en fila) — cada `<section>` solo se pinta si
  tiene datos. `hasCv` decide si se pinta el bloque de CV entero.

Diferencia visual: DaisyFilm mete `HeroSlideshow` dentro de `AboutPage`,
junto al CV; JuneStamp lo mueve a `ContactPage`. El componente en sí es el
mismo (`shared/HeroSlideshow.jsx`, ver §7).

### 6.4 `ContactPage`

Misma lista `SOCIALS` (instagram, tiktok, linkedin, behance, pinterest,
youtube, tumblr, substack, arena) filtrada a las que el usuario rellenó en
`profile.social`. Email, sitio web y "representación" (nombre + link
opcional) arriba; grid de redes abajo. `buildSocialMediaUrl()`
(`utils/socialMediaUtils.js`) centraliza cómo se arma cada URL.

### 6.5 Proyecto individual — `shared/ProjectView.jsx`

Una sola vista para las dos plantillas (antes duplicada byte a byte en
`DaisyFilm/components/ProjectOverlay.jsx` y `JuneStamp/components/ProjectPage.jsx`,
con solo el prefijo de clase distinto). Se monta así:

```jsx
// DaisyFilm — intro antes que las fotos, pinta su propio Footer
<ProjectView
  classPrefix="df"
  openPost={displayPost}
  projectImages={projectImages}
  allPosts={allSlidePosts}
  onOpenPost={openProject}
  displayName={displayName}
  authorInstagram={displayProfile?.social?.instagram}
  footer={<Footer name={displayName} />}
/>

// JuneStamp — fotos antes que la intro, sin Footer propio (lo pinta el
// layout raíz, fuera de .js-body, a todo el ancho)
<ProjectView
  classPrefix="js"
  openPost={displayPost}
  projectImages={projectImages}
  allPosts={allSlidePosts}
  onOpenPost={openProject}
  displayName={displayName}
  authorInstagram={displayProfile?.social?.instagram}
  imagesFirst
/>
```

Props que controlan la única variación real entre plantillas:
- **`classPrefix`** (`"df"`/`"js"`) — cada clase se genera como
  `${classPrefix}-<sufijo>` (ej. `df-project__hero`/`js-project__hero`), así
  cada plantilla conserva su propio bloque de reglas CSS sin tocar nada del
  componente.
- **`imagesFirst`** — DaisyFilm pinta título/descripción antes que las
  fotos; JuneStamp al revés.
- **`footer`** — nodo opcional pintado al final (DaisyFilm); si se omite
  (JuneStamp) no se pinta ninguno.

Lógica de datos (idéntica, ahora en un solo sitio):
- Hero con todas las imágenes del proyecto + crédito por imagen
  (`getImageCredit`, indexa `post.imageTags` contra `post.images` original,
  no contra `projectImages` que va deduplicado).
- Créditos: rol propio del autor (+ su Instagram si lo enlazó) primero,
  luego `peopleTags` — cada persona enlaza a su perfil si está registrada
  (`username`) o abre Instagram externo si no.
- "Publicado en" (`publishedIn`) — lista de medios, con link si tienen URL.
- Tags de tipo de proyecto (`projectTypes`) → enlazan a `/tags/:tipo`.
- "Next projects": el resto del portfolio reordenado cíclicamente a partir
  del proyecto actual (para que nunca se corte en el último y siempre lea
  como continuación).

### 6.6 `Footer`

Sigue sin unificar (i18n propia por plantilla: `t("daisyFilm.footerCredit")`
vs `t("juneStamp.footerCredit")` — microcopy legítimamente distinto, no
duplicación mecánica). Mismo patrón en los dos: `t("<template>.footerCredit",
{name, year})` + link a `/templates` con `t("<template>.footerTemplateName")`.
En JuneStamp vive **fuera** de `.js-body` a propósito (comentario explícito
en `JuneStampTemplate.jsx`) para que no quede recortado por el ancho del
sidebar y se vea a todo el ancho al llegar al final del scroll. En DaisyFilm
lo monta cada página hija (`PortfolioGallery`, `AboutPage`, `ContactPage`) y
`ProjectView` (vía la prop `footer`) individualmente, no el componente raíz.

---

## 7. Componentes compartidos (`shared/`)

### `usePortfolioTemplateState.js` — ver §5.

### `ProjectView.jsx` — ver §6.5.

### `ProjectActionModals.jsx`

Modales de "reportar proyecto" y "eliminar proyecto" — mismo copy (`t()`,
namespace `post`, sin prefijo por plantilla: `t("view.report.title")`, no
`t("post:view.report.title")`, porque el componente ya llama a
`useTranslation("post")` como único namespace) y misma lógica en las dos
plantillas, solo cambia `classPrefix`:

```jsx
<ProjectActionModals
  classPrefix="df"                 {/* o "js" */}
  showReportModal={showReportModal}
  reportReason={reportReason}
  setReportReason={setReportReason}
  reportSubmitting={reportSubmitting}
  reportSent={reportSent}
  onSubmitReport={handleSubmitReport}
  onCloseReport={closeReportModal}
  showDeleteModal={showDeleteProjectModal}
  deletingProject={deletingProject}
  onConfirmDelete={handleDeleteProject}
  onCloseDelete={() => setShowDeleteProjectModal(false)}
/>
```

### `HeroSlideshow.jsx`

Carrusel "gif" de portada — desliza una foto al lado de la otra cada 4s, en
bucle, sin controles. Usado en el CV de DaisyFilm (`AboutPage`) y en
Contacto de JuneStamp (`ContactPage`) — mismo comportamiento, cambia dónde
se monta, no cómo funciona. Genérico vía `baseClass`: el wrapper usa
`baseClass` tal cual, el track y cada imagen añaden los sufijos
`-track`/`-img` (ej. `baseClass="df-about__cv-slideshow"` en DaisyFilm,
`baseClass="js-contact__cv-slideshow"` en JuneStamp — cada plantilla define
sus propias reglas CSS para ese namespace, el componente no impone estilos).

```jsx
<HeroSlideshow images={heroImages} baseClass="df-about__cv-slideshow" />
```

Truco de loop sin salto: se clona la primera foto al final de la tira para
que el paso de la última a la primera también se deslice; al llegar a esa
copia se desactiva la transición un frame (`requestAnimationFrame`) y se
recoloca al índice 0 — imperceptible porque ambos frames son la misma
imagen.

### `QuickActions.jsx`

Tarjeta flotante con las acciones comunes a las 4 plantillas: volver, seguir/
dejar de seguir, publicar nuevo proyecto (`+`, dueño), organizar proyectos
(dueño). Lo específico de cada plantilla (editar info de about/contact,
editar/eliminar/guardar/reportar un proyecto) se pasa como `children` y se
pinta dentro de la misma tarjeta, después de los botones comunes. Se oculta
entera si `!isLoggedIn || isPreview`.

`pagesEnabled = profile.profileLayout && profile.profileLayout !== "default"`
— Classic no tiene páginas de portfolio propias, así que oculta esa pestaña
dentro de `OrganizeProjectsOverlay` (ver §12).

### `BackButton.jsx`

Mismo diseño (círculo + chevron-left) en las 4 plantillas, cada una con su
propia clase (namespace distinto, mismo look) para no colisionar con
`.gf-back-btn` del panel de control. `onClick` opcional; por defecto usa
`history.length > 1 ? navigate(-1) : navigate(fallback)`.

### `EditAboutOverlay.jsx`

Popup de edición rápida para `/about` (dueño) — mismas 3 pestañas que
`/myprofile/edit` (Info / CV / Redes), reutilizando **los mismos
componentes** (`InfoTab`, `CvTab`, `SocialTab` de
`components/controlPanel/editProfile/tabs/`) en pestañas horizontales en vez
del panel vertical. Estado y autoguardado propios (no comparte el hook de
`NewEditProfileContent.jsx`), pero:
- Carga desde la misma fuente (`GET /api/users/profile`).
- Guarda contra el mismo `PUT /api/users/profile`, siempre reenviando el
  draft completo (nunca pisa campos que esta vista no edita).
- Autoguardado a los 900ms de inactividad tras marcar `isDirty`.

### `OrganizeProjectsOverlay.jsx` (físicamente en `DaisyFilm/components/`, usado por las 4)

Mismo "chrome" que `EditAboutOverlay` (mismas clases `eao-*`) pero el cuerpo
es literalmente `ProjectsOrganizerPanel.jsx` — el mismo componente que monta
la ruta completa `/proyectos/organizar`. No tiene draft/autosave propio (cada
acción persiste al vuelo); el botón "Listo" solo cierra el overlay.

---

## 8. Utilidades reutilizadas

| Utilidad | Uso |
|---|---|
| `utils/postSlug.js` | `getPostSlug`/`findPostBySlug` (slug determinista por título, desambiguado por los últimos 6 chars del `_id` si hay colisión) + `getPagedPostIds` |
| `utils/optimizeImage.js` (`clImg`) | `clImg.post()`, `clImg.heroSlide()` — variantes de Cloudinary por contexto |
| `utils/socialMediaUtils.js` | `buildSocialMediaUrl`, `extractUsernameFromUrl` |
| `utils/locations.js` | `formatUserLocation` (hasta 3 pares ciudad/país) |
| `services/api.js` | cliente axios con interceptor JWT — todas las llamadas (`favorites`, `reports`, `posts`, `users/profile`) |

Todas se usan **desde el hook** (§5), no desde los `XxxTemplate.jsx` — las
plantillas ya no importan `postSlug`/`api` directamente.

---

## 9. Convenciones CSS

- Prefijo de plantilla en cada clase: `df-*` (DaisyFilm), `js-*` (JuneStamp).
- Los componentes compartidos que pintan UI (`ProjectView`, `HeroSlideshow`,
  `ProjectActionModals`) no traen su propio CSS — reciben `classPrefix`/
  `baseClass` y generan nombres de clase que caen dentro del namespace de la
  plantilla que los monta (`DaisyFilmTemplate.css`/`JuneStampTemplate.css`
  siguen siendo la única fuente de estilos).
- `tf-*` — clases compartidas a nivel de toda la web (ej. `tf-footer`,
  `tf-guest-profile`, `tf-btn--CTA`), combinadas con el prefijo propio en el
  mismo elemento (`className="tf-footer js-footer"`).
- `eao-*` — namespace fijo de los overlays compartidos (`EditAboutOverlay`,
  `OrganizeProjectsOverlay`), no varía por plantilla.
- `nep-icon-tooltip` — tooltip genérico reutilizado en botones de icono.
- Import de CSS del landing (`landing-styles.css`, `landing-footer.css`) en
  el componente raíz — se usa para la vista de invitado no logueado
  (`LandingHeader` + CTA de registro).

---

## 10. Mecanismo de preview

El iframe de `/myprofile/edit/templates` (`ProfileAppearanceTab.jsx`) prueba
una plantilla sin guardarla codificando `?preview=1&layout=<alias>` en la
query string. Dentro del hook:

```js
const withPreviewQuery = (path) =>
  (isPreview && location.search ? `${path}${location.search}` : path);
```

y se aplica automáticamente en toda navegación que hace el hook (`setMode`,
`openProject`, `handleDeleteProject`, `onPostSaved`) — la plantilla no
necesita llamarlo. Sin esto, moverse entre Portfolio/About/Contact/Proyecto
**dentro** del iframe aterrizaría en una URL sin `preview=1` y el preview se
"apagaría" a mitad de camino (reaparecerían acciones reales, y hasta podría
cargar la plantilla realmente guardada en vez de la que se está probando).

Además, `isPreview` añade una clase modificadora al layout
(`df-layout--preview` / `js-layout--preview`, esto sí lo pinta cada
`XxxTemplate.jsx`, es puramente CSS) que desactiva todos los `<a>`/`<Link>`
reales excepto la navegación interna de la propia plantilla — necesario
porque dentro del iframe `isOwner`/`isLoggedIn` siguen siendo `true` (misma
sesión).

`QuickActions` usa el mismo booleano (`isPreview`, prop directa) para
ocultarse entera en preview.

---

## 11. Receta para una plantilla nueva con esta arquitectura

1. En el componente raíz, llamar a `usePortfolioTemplateState(...)` con las
   props recibidas (§4) — no reimplementar nada de §5, eso ya está resuelto.
2. Crear los componentes hijo propios en `components/`: nav (equivalente a
   Top/Sidebar), grid del portfolio, `AboutPage`, `ContactPage`, `Footer` —
   maqueta/CSS 100% propios, pero alimentados por lo que devuelve el hook.
3. Para la vista de proyecto individual, montar `shared/ProjectView.jsx` con
   el `classPrefix` propio (§6.5) en vez de escribir una nueva — solo hace
   falta CSS nuevo bajo ese prefijo. Si el orden intro/fotos o el Footer
   deben ir distinto, usar `imagesFirst`/`footer`; si hace falta algo que
   `ProjectView` no contempla, ampliar sus props en vez de bifurcar el
   componente.
4. Montar `shared/ProjectActionModals.jsx` (mismo `classPrefix`) en vez de
   escribir los modales de reportar/eliminar a mano.
5. Si la plantilla tiene un carrusel de portada tipo "gif", usar
   `shared/HeroSlideshow.jsx` con un `baseClass` propio.
6. Montar `shared/QuickActions`, `shared/EditAboutOverlay` y (vía
   `QuickActions`) `DaisyFilm/components/OrganizeProjectsOverlay` — no
   reimplementar estas piezas.
7. Prefijo CSS propio y coherente en todas las clases nuevas (`classPrefix`
   corto, en minúsculas, sin guiones).
8. La clase `--preview` en el layout raíz si la plantilla se podrá
   previsualizar desde `ProfileAppearanceTab.jsx` — el resto del freno de
   preview (`withPreviewQuery`) ya lo trae el hook.
9. Seguir el resto de la checklist mecánica en
   [`instrucciones-nueva-plantilla-perfil.md`](./instrucciones-nueva-plantilla-perfil.md)
   (enum de Mongoose, whitelist del controller, bloque `if` en
   `UserProfilePage.jsx`, selector visual, i18n) — y añadir las 5 rutas de
   `App.jsx` (§3) si la app aún no las tiene genéricas para `:username`.

---

## 12. Classic: la plantilla sin arquitectura de páginas

`ClassicTemplate.jsx` pinta **los mismos datos** que June Stamp y Daisy Film
(mismo `profile`, mismos `userPosts`) pero con una organización distinta de
raíz, y **no** usa `usePortfolioTemplateState` — su estado (`activeTab`,
fetching, follow, SEO) lo siguen manejando sus dos páginas llamadoras
(`UserProfilePage.jsx` en vista pública, `MiPerfilPage.jsx` en "mi perfil"),
que se lo pasan todo por props (`mode="public"|"self"`). `ClassicTemplate.jsx`
en sí es puramente presentacional.

### Diferencia clave: pestañas, no páginas

Classic **no tiene páginas de portfolio propias** (no hay
`/:username/:pageSlug` para Classic — esa ruta la sirve `PublicPortfolioPage`
para las plantillas que sí soportan páginas organizadas). En vez de eso,
todo vive en `activeTab`, un `useState` de la página padre, con 3 valores
posibles pintados por `TabsNav.jsx`:

| `activeTab` | Componente | Contenido |
|---|---|---|
| `"publicaciones"` | `GalleryTab` | **Todos** los proyectos del usuario, sin recortar — a diferencia de DaisyFilm/JuneStamp, Classic nunca filtra por `pagedPostIds` (comentario explícito en `ClassicTemplate.jsx`: "sin páginas de portfolio propias — no hay dónde verlas"). Los datos de organización en páginas se conservan en BD por si el usuario cambia de plantilla más adelante, pero Classic no los lee. |
| `"perfil"` | `CvTab` | La misma info de CV (experiencia/educación/skills/software/idiomas/premios/prensa) que `AboutPage` en las otras plantillas, aquí en pestaña propia en vez de página `/about`. |
| `"ofertas"` | `OffersTab` | Solo para empresas/instituciones (`isCompany`/`isEducationalInstitution`) — ofertas de trabajo publicadas. Sin equivalente en June Stamp/Daisy Film. |

`showTabsNav = isSelf ? true : hasCvData` — en vista pública, si el usuario
no tiene ningún dato de CV, la pestaña "Perfil" (y por tanto el nav de
pestañas entero) ni se muestra.

### Otras diferencias de arquitectura frente a June Stamp/Daisy Film

- **Sin proyecto individual como página propia**: Classic no tiene
  `/:username/project/:slug` — abre el post con el flujo estándar de post
  (`onPostClick`/modal), no con `ProjectView`.
- **Sin `/about` ni `/contact` como rutas**: es todo `activeTab` local, no
  URL — un link a "la pestaña CV de fulano" no existe como tal en Classic.
- **`QuickActions` sí se reutiliza** (mismo componente que las otras 3
  plantillas), pero con `pagesEnabled={false}` de facto (`profileLayout ===
  "default"`), así que `OrganizeProjectsOverlay` oculta su pestaña "Páginas
  del portfolio" y el picker "mover a página" cuando se abre desde Classic.
- **Dos modos, no dos plantillas**: `mode="public"|"self"` covering tanto el
  perfil público como "mi perfil" con el mismo componente — algo que June
  Stamp/Daisy Film no necesitan porque el dueño ve su propio perfil por la
  misma ruta pública (`isOwner` ya lo resuelve todo).
- **Header e imagen de portada propios**: `ExternalProfileHeader`/
  `GuestHeader` + `ProfileHeroTemplates` (con sus propios sub-templates de
  hero, `Classic/heroTemplates/`) — sin equivalente en las otras plantillas,
  que no tienen imagen de portada separada del hero de "About".

En resumen: Classic confirma la misma idea central del §1 (los datos son
los mismos, solo cambia cómo se organizan) pero resuelta con **tabs +
estado del padre** en vez de **rutas propias + hook compartido**. Si una
plantilla nueva no necesita páginas de portfolio organizadas ni proyecto
individual como URL propia, el patrón de Classic (tabs, sin
`usePortfolioTemplateState`) es la referencia a seguir en vez del de June
Stamp/Daisy Film.
