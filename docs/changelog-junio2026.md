# THEFOLDER — Changelog de cambios

> Registro de cambios recientes por sesión de trabajo.
> Última actualización: 2026-06-13

---

## 2026-06-13 — UI de filtros: limpieza de labels y comportamiento del botón "Todos"

### Labels eliminados en filtros
Se han eliminado los `<span className="filters-city-label">` que mostraban los textos "Specialty" y "City" encima de los grupos de filtros. Eran decorativos y añadían ruido visual innecesario.

**Archivos afectados:**
- `frontend/src/pages/explorer/ExplorerPage.jsx` — 3 spans eliminados (specialty ×2, city ×1)
- `frontend/src/pages/creatives/CreativesPage.jsx` — 3 spans eliminados (specialty ×2, city ×1)
- `frontend/src/pages/community/CommunityPage.jsx` — 3 spans eliminados (specialty ×2, city ×1)

### Botón "Todos/All" se atenúa al seleccionar otro filtro
Cuando el usuario activa cualquier filtro específico dentro de un grupo, el botón "Todos" se atenúa visualmente (`opacity: 0.35`, `pointer-events: none`) para indicar que ya no está activo.

**Implementación:** CSS puro con `:has()`, sin cambios en el JSX.

**Archivo afectado:**
- `frontend/src/components/controlPanel/css/explorer.css` — nueva regla al final del archivo:
  ```css
  .filters-modal-panel--all .filters-tags:has(> .filter-tag.selected:not(:first-child)) > .filter-tag:first-child {
    opacity: 0.35;
    pointer-events: none;
  }
  ```

---

## 2026-06-13 — SEO dinámico por perfil de usuario

Cada página de perfil (`/[username]`) ahora genera meta tags únicos basados en los datos del usuario. Esto mejora el posicionamiento en Google y habilita previews correctos al compartir en WhatsApp, LinkedIn, Slack, etc.

### Pieza 1 — react-helmet-async (client-side, para Google)

Se instaló `react-helmet-async` y se añadió a `UserProfilePage.jsx`.

**Qué se inyecta dinámicamente en el `<head>`:**
- `<title>` → `{nombre} — {especialidad} | THEFOLDER`
- `<meta name="description">` → bio del usuario (máx. 157 chars)
- `<link rel="canonical">` → `https://thefolder.es/{username}`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- JSON-LD `Person`: `name`, `jobTitle`, `image`, `url`, `sameAs` (redes sociales del usuario)

**Archivos afectados:**
- `frontend/src/main.jsx` — `App` envuelta en `<HelmetProvider>`
- `frontend/src/pages/profile/UserProfilePage.jsx` — bloque SEO computado antes de los early returns, `seoHelmet` inyectado en los 3 layouts (default, studio-gallery, index-gallery)

### Pieza 2 — Bot routing via Caddy (server-side, para WhatsApp/LinkedIn/Slack)

Los bots de redes sociales no ejecutan JavaScript, por lo que no leen el Helmet. Caddy detecta su User-Agent y los redirige internamente al backend, que sirve HTML estático con los meta OG.

**Cómo funciona el flujo:**
1. Bot de WhatsApp/LinkedIn/Slack/etc. pide `thefolder.es/maria.garcia`
2. Caddy detecta el User-Agent y reescribe la URL a `/og/profile/maria.garcia` → backend
3. El backend consulta MongoDB, construye HTML mínimo con todos los meta OG y lo devuelve
4. El bot lee la imagen, título y descripción correctos para el preview
5. Un usuario real pide la misma URL → Caddy lo deja pasar al frontend React normal

**Bots detectados:** facebookexternalhit, Twitterbot, WhatsApp, LinkedInBot, TelegramBot, Googlebot, Slackbot, Discordbot, Applebot, bingbot, Pinterestbot, redditbot

**Archivos afectados:**
- `Caddyfile` — bloque `@socialBot` con regex de User-Agent y path, ya existía
- `backend/routes/og.js` — endpoint `GET /og/profile/:username`, ya existía
- `backend/server.js` — ruta `/og` registrada, ya existía

### Beneficio para el usuario registrado
Un creativo con nombre, especialidad, bio y redes rellenas pasa de ser invisible en buscadores a tener una página indexada con su identidad profesional. Su perfil puede aparecer en Google cuando alguien busque su nombre o especialidad.
