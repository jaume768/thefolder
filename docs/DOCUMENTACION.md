# THE FOLDER — Documentación Técnica Completa

> Última actualización: marzo 2026
> Plataforma de red social profesional para creativos y profesionales del sector moda/diseño.

---

## ÍNDICE

1. [Visión general](#1-visión-general)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Backend](#3-backend)
4. [Frontend (Usuario)](#4-frontend-usuario)
5. [Frontend Admin](#5-frontend-admin)
6. [Base de datos — Modelos](#6-base-de-datos--modelos)
7. [API — Endpoints completos](#7-api--endpoints-completos)
8. [Rutas del frontend](#8-rutas-del-frontend)
9. [Flujos principales](#9-flujos-principales)
10. [Infraestructura y despliegue](#10-infraestructura-y-despliegue)
11. [Estado actual del proyecto](#11-estado-actual-del-proyecto)

---

## 1. VISIÓN GENERAL

**The Folder** es una plataforma full-stack de red social profesional orientada al sector de la moda y el diseño. Conecta creativos (fotógrafos, estilistas, diseñadores, etc.) con profesionales del sector (empresas, agencias, instituciones educativas).

### Funcionalidades principales
- Perfiles públicos personalizables con portadas y plantillas
- Sistema de posts con imágenes, etiquetas y menciones
- Ofertas de trabajo y educativas con sistema de aplicación
- Explorador de contenido y directorio de creativos
- Blog, revistas y directorio de industria
- Panel de administración completo

### Tecnologías
| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express 4.21 |
| Base de datos | MongoDB 8.10 (Mongoose ODM) |
| Autenticación | JWT + Passport.js (Local + Google OAuth) |
| Almacenamiento imágenes | Cloudinary |
| Email | Brevo (Sendinblue) |
| Frontend usuario | React 18.2 + Vite + React Router 7.1 |
| Frontend admin | React 18.2 + Vite + Chart.js |
| Containerización | Docker + Docker Compose |
| Hosting DB | Railway.app |
| Proxy | Nginx (en producción) |

---

## 2. ARQUITECTURA DEL SISTEMA

```
TheFolder/
├── backend/                  # API REST — Puerto 5000
├── frontend/                 # App usuario — Puerto 3000
├── frontend-admin/           # Panel admin — Puerto 3001
├── docs/                     # Documentación
└── docker-compose.yml        # Orquestación de servicios
```

### Docker Compose (orquestación)

```
mongo              → Puerto 27017 (MongoDB)
contenedor-backend → Puerto 5000 (API)
contenedor-frontend → Puerto 3000 (App usuario, Nginx)
contenedor-admin   → Puerto 3001 (Panel admin, Nginx)
```

### CORS — Orígenes permitidos
- `https://thefolder.es`
- `https://www.thefolder.es`
- `http://localhost:3000`
- `http://localhost:3001`
- `https://frontend-student-station-production.up.railway.app`
- `https://frontend-admin-student-station-production.up.railway.app`

---

## 3. BACKEND

### Estructura de carpetas

```
backend/
├── config/
│   ├── cloudinary.js         # Configuración Cloudinary (CDN imágenes)
│   ├── db.js                 # Conexión MongoDB
│   └── passport.js           # Estrategias de autenticación (Local + Google OAuth)
├── controllers/
│   ├── adminController.js    # CRUD administración
│   ├── authController.js     # Registro, login, reset contraseña
│   ├── blogController.js     # Posts del blog
│   ├── folderController.js   # Carpetas de guardados
│   ├── magazineController.js # Revistas
│   ├── offerController.js    # Ofertas de trabajo y educativas
│   ├── postController.js     # Posts del feed
│   ├── updateApplicationStatus.js  # Estado de candidaturas
│   └── userController.js    # Perfil, seguimiento, favoritos
├── middlewares/
│   └── auth.js               # ensureAuthenticated, ensureAdmin
├── models/                   # Esquemas Mongoose (ver sección 6)
├── routes/                   # Definición de endpoints (ver sección 7)
├── utils/
│   ├── emailNotifications.js # Envío de emails con Brevo
│   ├── ensureTags.js         # Inicialización de etiquetas por defecto
│   ├── textUtils.js          # Manipulación de texto
│   └── username.js           # Utilidades de usernames
└── server.js                 # Punto de entrada principal
```

### Dependencias principales

```json
"express": "^4.21.2"
"mongoose": "^8.10.0"
"jsonwebtoken": "^9.0.2"
"bcryptjs": "^2.4.3"
"passport": "^0.7.0"
"passport-local": "^1.0.0"
"passport-google-oauth20": "^2.0.0"
"cors": "^2.8.5"
"multer": "^1.4.5"
"cloudinary": "^2.5.1"
"dotenv": "^16.4.7"
"morgan": "^1.10.0"
"express-session": "^1.18.1"
"sib-api-v3-sdk": "^8.5.0"
```

### Variables de entorno (.env)

```
PORT=5000
SESSION_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
BREVO_API_KEY=...
JWT_SECRET=...
MONGO_URI=mongodb://...
FRONTEND_URL=https://localhost:3000
```

### Middleware de autenticación

- **`ensureAuthenticated`** — verifica JWT o sesión activa. Requerido en rutas privadas.
- **`ensureAdmin`** — verifica `isAdmin === true` o `role === 'Admin'`. Requerido en rutas `/api/admin/*`.

---

## 4. FRONTEND (USUARIO)

### Estructura de carpetas

```
frontend/src/
├── App.jsx                          # Enrutado principal
├── main.jsx                         # Punto de entrada
├── index.css                        # Estilos globales
├── components/
│   ├── AuthLayout.jsx               # Layout para usuarios no autenticados (LandingHeader + children)
│   ├── TokenHandler.jsx             # Captura token OAuth de URL y redirige a /explorer
│   ├── ScrollToTop.jsx              # Scroll al inicio en cada cambio de ruta
│   ├── PeopleTagsList.jsx           # Lista de menciones de usuarios en posts
│   ├── home/                        # Componentes de la landing page
│   │   ├── LandingHeader.jsx        # Header de la landing (nav + botones login/registro)
│   │   ├── LandingHero.jsx          # Sección hero con typewriter y CTA
│   │   ├── LandingCreatorsShowcase.jsx  # Showcase de creativos
│   │   ├── LandingTemplatesParallax.jsx # Sección plantillas con efecto parallax scroll
│   │   ├── LandingLinkSection.jsx   # Sección de enlaces/secciones de la plataforma
│   │   ├── LandingFinalCTA.jsx      # Call to action final
│   │   ├── LandingFooter.jsx        # Footer de la landing
│   │   ├── LoginModal.jsx           # Modal de inicio de sesión
│   │   ├── RegisterModal.jsx        # Modal de registro
│   │   ├── PasswordResetModal.jsx   # Modal de recuperación de contraseña
│   │   └── css/                     # Estilos de cada componente (9 archivos)
│   ├── controlPanel/                # Panel de control del usuario autenticado
│   │   ├── Layout.jsx               # Layout principal con sidebar y header
│   │   ├── Header.jsx               # Header del panel (búsqueda, notificaciones)
│   │   ├── Sidebar.jsx              # Navegación lateral
│   │   ├── MobileTopHeader.jsx      # Header móvil
│   │   ├── MobileSideMenu.jsx       # Menú lateral móvil
│   │   ├── SearchFullScreen.jsx     # Búsqueda a pantalla completa
│   │   ├── SearchResults.jsx        # Resultados de búsqueda
│   │   ├── Explorer.jsx             # Explorador de contenido (grid masonry)
│   │   ├── Creatives.jsx            # Directorio de creativos con filtros
│   │   ├── Industry.jsx             # Directorio de empresas/industria
│   │   ├── Fashion.jsx              # Sección de formación en moda
│   │   ├── Blog.jsx                 # Listado de artículos del blog
│   │   ├── ArticleDetail.jsx        # Detalle de artículo
│   │   ├── Magazine.jsx             # Revistas digitales
│   │   ├── Offers.jsx               # Listado de ofertas (trabajo + educativas)
│   │   ├── JobOfferDetail.jsx       # Detalle de oferta de trabajo
│   │   ├── EducationalOfferDetail/  # Detalle de oferta educativa
│   │   ├── CreatePost.jsx           # Formulario de creación de post
│   │   ├── CreateOffer.jsx          # Formulario de creación de oferta de trabajo
│   │   ├── CreateEducationalOffer/  # Formulario de oferta educativa (múltiples pasos)
│   │   ├── UserPost.jsx             # Detalle de un post
│   │   ├── UserProfile.jsx          # Perfil público de otro usuario
│   │   ├── MiPerfil.jsx             # Mi perfil (vista antigua — en migración)
│   │   ├── Guardados.jsx            # Carpetas de guardados del usuario
│   │   ├── FolderContent.jsx        # Contenido de una carpeta guardada
│   │   ├── ViewOffer.jsx            # Ver oferta guardada
│   │   ├── MyComunity.jsx           # Seguidos y seguidores
│   │   ├── MisOfertasSection.jsx    # Mis ofertas publicadas
│   │   ├── ApplyOfferModal.jsx      # Modal para aplicar a una oferta
│   │   ├── ProfileOptionsModal.jsx  # Modal de opciones de perfil
│   │   ├── Contacto.jsx             # Formulario de contacto
│   │   ├── About.jsx                # Página about
│   │   ├── AvisoLegal.jsx           # Aviso legal
│   │   ├── Privacidad.jsx           # Política de privacidad
│   │   ├── Cookies.jsx              # Política de cookies
│   │   ├── miPerfil/                # Secciones del perfil propio (modular)
│   │   ├── userProfile/             # Secciones del perfil ajeno (modular)
│   │   └── css/                     # Estilos del panel de control
│   └── modals/
│       ├── EditProfileModal.jsx         # Modal general de edición de perfil
│       ├── VerificationRequiredModal.jsx # Modal verificación requerida
│       └── css/
├── pages/
│   ├── Home.jsx                     # Landing page (ruta /)
│   ├── CompleteRegistration.jsx     # Paso inicial de registro
│   ├── creativos/                   # Flujo de registro para creativos
│   │   ├── CompleteRegistrationCreativo.jsx       # Paso 1
│   │   └── CompleteRegistrationCreativo03.jsx     # Paso 2 (fotos/portfolio)
│   ├── profesionales/               # Flujo de registro para profesionales
│   │   ├── CompleteRegistrationProfesional.jsx             # Paso 1 (tipo)
│   │   ├── CompleteRegistrationProfesionalDatosPersonales.jsx
│   │   ├── CompleteRegistrationProfesionalInstitucion.jsx
│   │   ├── CompleteRegistrationProfesionalMarca05.jsx
│   │   ├── CompleteRegistrationProfesionalEmpresa05.jsx
│   │   └── CompleteRegistrationProfesionalAgencia05.jsx
│   └── profile/                     # NUEVO sistema de perfil (en migración activa)
│       ├── ProfileRoot.jsx          # Raíz: redirige a /myprofile/edit
│       ├── ProfileEditPage.jsx      # Editar perfil
│       ├── ProfileOffersPage.jsx    # Mis ofertas
│       ├── ProfileSettingsPage.jsx  # Configuración de cuenta
│       ├── NewEditProfileContent.jsx
│       └── heroTemplates/           # Plantillas de portada de perfil
│           ├── ProfileHeroTemplates.jsx
│           ├── HeroAtoms.jsx
│           ├── heroShared.js
│           ├── templates/
│           │   ├── desktop/         # D_Centered, D_Fullscreen, D_FullscreenAlt,
│           │   │                    # D_SplitTop, D_VerticalCentered, D_VerticalEditorial
│           │   └── mobile/          # M_Fullscreen, M_FullscreenAlt,
│           │                        # M_SplitImage, M_VerticalCard
│           └── styles/
└── utils/
    ├── locations.js                 # Datos de ciudades y países
    └── socialMediaUtils.js          # Utilidades para redes sociales
```

### Dependencias principales

```json
"react": "^18.2.0"
"react-router-dom": "^7.1.5"
"axios": "^1.7.9"
"react-icons": "^5.4.0"
"react-toastify": "^11.0.5"
"framer-motion": "^12.31.0"
"react-beautiful-dnd": "^13.1.1"
"react-masonry-css": "^1.0.16"
"lodash": "^4.17.21"
```

---

## 5. FRONTEND ADMIN

### Estructura de carpetas

```
frontend-admin/src/
├── App.jsx                          # Enrutado admin
├── main.jsx                         # Punto de entrada (con AuthContext y ThemeContext)
├── contexts/
│   ├── AuthContext.jsx              # Estado de autenticación admin (JWT)
│   └── ThemeContext.jsx             # Tema claro/oscuro
├── components/
│   ├── common/
│   │   ├── Layout.jsx               # Layout base del panel admin
│   │   ├── Navbar.jsx               # Barra superior
│   │   ├── Sidebar.jsx              # Navegación lateral
│   │   └── ThemeToggle.jsx          # Toggle light/dark mode
│   └── stats/
│       ├── ContentStats.jsx         # Estadísticas de contenido
│       ├── EducationalStats.jsx     # Estadísticas educativas
│       ├── EngagementStats.jsx      # Engagement
│       └── GrowthStats.jsx          # Crecimiento de usuarios
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── UsersPage.jsx / UserDetailPage.jsx
│   ├── OffersPage.jsx / EditOfferPage.jsx
│   ├── EducationalOffersPage.jsx / EditEducationalOfferPage.jsx
│   ├── PostsPage.jsx / PostFormPage.jsx
│   ├── BlogPage.jsx / BlogPostFormPage.jsx
│   ├── MagazinesPage.jsx / MagazineFormPage.jsx
│   ├── SchoolsPage.jsx / SchoolFormPage.jsx
│   ├── IndustryPage.jsx / IndustryFormPage.jsx
│   ├── SettingsPage.jsx
│   └── NotFoundPage.jsx
└── services/
    ├── api.js                       # Cliente Axios con interceptores JWT
    ├── userService.js
    ├── blogService.js
    ├── postService.js
    ├── offerService.js
    ├── educationalOfferService.js
    ├── magazineService.js
    ├── industryService.js
    └── schoolService.js
```

### Dependencias principales

```json
"react": "^18.2.0"
"react-router-dom": "^7.1.5"
"axios": "^1.7.9"
"react-icons": "^5.4.0"
"react-toastify": "^11.0.5"
"chart.js": "^4.4.1"
"react-chartjs-2": "^5.2.0"
```

---

## 6. BASE DE DATOS — MODELOS

### User

```javascript
{
  // Autenticación
  username: String (único, requerido),
  email: String (único, requerido),
  password: String (hash bcrypt),
  googleId: String,

  // Perfil
  fullName: String,
  role: 'Creativo' | 'Profesional' | 'Admin',
  isAdmin: Boolean,
  profilePicture: String (URL Cloudinary),
  bio: String (max 150 chars),
  biography: String,
  professionalTitle: String,
  professionalTags: [String] (max 3),

  // Creativos
  creativeType: Number (1-5),
  institution: String,
  brandName: String,

  // Profesionales
  professionalType: Number (1-5),
  companyName: String,
  sector: String,
  employeeRange: String,
  agencyName: String,

  // Ubicación
  country: String,
  city: String,
  customCountry: String,

  // Portadas de perfil
  featuredHeaderImageDesktop: String (URL),
  featuredHeaderImageMobile: String (URL),
  creativeCoverDesktop: String (URL),
  coverTemplateDesktop: String,
  coverTemplateMobile: String,
  galleryStyle: 'gap' | 'nogap',

  // Redes sociales
  profile: {
    profilePicture: String,
    socialLinks: {
      instagram: String,
      linkedin: String
    }
  },

  // Educación y carrera
  education: [{
    institution: String,
    formationName: String,
    formationStartMonth: Number,
    formationStartYear: Number,
    formationEndMonth: Number,
    formationEndYear: Number,
    currentlyEnrolled: Boolean,
    institutionLogo: String (URL),
    location: String
  }],
  skills: [String],
  software: [String],
  languages: [{
    language: String,
    level: 'basic' | 'intermediate' | 'advanced'
  }],

  // Disponibilidad laboral
  jobSearchActive: Boolean,
  availability: [String],
  contract: {
    practicas: Boolean,
    tiempoCompleto: Boolean,
    tiempoParcial: Boolean,
    freelance: Boolean
  },
  locationType: {
    presencial: Boolean,
    remoto: Boolean,
    hibrido: Boolean
  },

  // Archivos
  cvUrl: String (URL),
  portfolioUrl: String (URL),

  // Relaciones
  followers: [ObjectId -> User],
  following: [ObjectId -> User],
  savedOffers: [ObjectId -> Offer],

  timestamps: true
}
```

### Post

```javascript
{
  user: ObjectId -> User,
  title: String,
  description: String,
  images: [String] (URLs Cloudinary, max 6),
  mainImage: String (URL),
  tags: [String],
  peopleTags: [{
    name: String,
    username: String,
    role: String,
    socialUrl: String,
    isRegistered: Boolean,
    avatar: String
  }],
  imageTags: Map<String, String[]>,
  staffPick: Boolean,
  createdAt: Date
}
```

### Offer (Ofertas de trabajo)

```javascript
{
  publisher: ObjectId -> User,
  companyName: String,
  position: String,
  publicationDate: Date,
  city: String,
  website: String,
  contactName: String,
  jobType: ['Prácticas', 'Tiempo completo', 'Tiempo parcial'],
  locationType: ['Presencial', 'Remoto', 'Híbrido'],
  isExternal: Boolean,
  externalLink: String,
  companyLogo: String (URL),
  description: String,
  requiredProfile: String,
  descriptionEmployer: String,
  tags: [String],
  extraQuestions: [{
    question: String,
    responseType: String
  }],
  applications: [{
    user: ObjectId -> User,
    answers: [String],
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
    appliedAt: Date
  }],
  status: 'pending' | 'accepted' | 'cancelled',
  timestamps: true
}
```

### EducationalOffer

```javascript
{
  institutionName: String,
  programName: String,
  educationType: ['Grado', 'Máster', 'FP', 'Curso', 'Taller', 'Certificación', 'Otro'],
  modality: ['Presencial', 'Online', 'Híbrido'],
  morningSchedule: Boolean,
  duration: Number (meses),
  credits: Number,
  internships: Boolean,
  erasmus: Boolean,
  bilingualEducation: Boolean,
  location: { city: String, country: String },
  enrollmentPeriod: { startDate: String, endDate: String },
  schoolYear: { startMonth: String, endMonth: String },
  status: 'pending' | 'accepted' | 'cancelled',
  publisher: ObjectId -> User,
  timestamps: true
}
```

### BlogPost

```javascript
{
  title: String,
  content: String,
  excerpt: String,
  image: String (URL principal),
  additionalImages: [String],
  category: ['fashion', 'designers', 'industry', 'education', 'events', 'other'],
  author: String,
  featured: Boolean,
  size: ['small-blog', 'medium-blog', 'large-blog'],
  tags: [String],
  publishedDate: Date,
  status: 'draft' | 'published' | 'archived',
  createdBy: ObjectId -> User,
  timestamps: true
  // Índices: text search, category, featured, status, publishedDate
}
```

### Magazine

```javascript
{
  name: String,
  image: String (URL),
  price: Number,
  link: String,
  isActive: Boolean,
  createdBy: ObjectId -> User,
  timestamps: true
}
```

### Industry

```javascript
{
  name: String,
  country: String,
  city: String,
  category: String,
  link: String (URL),
  image: String (URL),
  isActive: Boolean,
  timestamps: true
}
```

### Folder (Carpetas de guardados)

```javascript
{
  user: ObjectId -> User,
  name: String,
  items: [{ postId: ObjectId, imageUrl: String, addedAt: Date }],
  posts: [ObjectId -> Post],
  createdAt: Date
}
```

### Tag

```javascript
{
  id: String (slug único),
  type: String,
  label: String,
  status: 'active' | 'inactive',
  group: String,
  order: Number,
  timestamps: true
}
```

### Otros modelos
- **School.js** — Instituciones educativas
- **TagSuggestion.js** — Sugerencias de nuevas etiquetas enviadas por usuarios

---

## 7. API — ENDPOINTS COMPLETOS

Base URL: `http://localhost:5000/api`

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/register` | Registro con email/contraseña | No |
| POST | `/login` | Login local | No |
| POST | `/admin-login` | Login administrador | No |
| GET | `/verify-admin-token` | Verificar token admin | No |
| POST | `/forgot-password` | Solicitar reset de contraseña | No |
| POST | `/verify-forgot-code` | Verificar código de recuperación | No |
| POST | `/reset-password` | Restablecer contraseña | No |
| GET | `/google` | Iniciar OAuth con Google | No |
| GET | `/google/callback` | Callback de Google | No |
| POST | `/send-verification-code-pre-registration` | Enviar código de verificación por email | No |
| POST | `/verify-code-pre-registration` | Verificar código y crear usuario | No |
| POST | `/resend-code-pre-registration` | Reenviar código | No |
| GET | `/logout` | Cerrar sesión | No |

### Usuarios — `/api/users`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/profile` | Perfil del usuario autenticado | Sí |
| POST | `/check-availability` | Verificar email/username disponibles | No |
| GET | `/check-username` | Verificar username disponible | No |
| PUT | `/profile` | Actualizar perfil | Sí |
| GET | `/profile/:username` | Perfil público por username | No |
| PUT | `/change-password` | Cambiar contraseña | Sí |
| PUT | `/profile-picture` | Actualizar foto de perfil | Sí |
| DELETE | `/profile-picture` | Eliminar foto de perfil | Sí |
| PUT | `/cv` | Subir CV | Sí |
| PUT | `/portfolio` | Subir portfolio | Sí |
| POST | `/company-logo` | Subir logo de empresa | Sí |
| POST | `/institution-logo` | Subir logo de institución | Sí |
| PUT | `/featured-header/:variant` | Actualizar portada (desktop\|mobile) | Sí |
| DELETE | `/featured-header/:variant` | Eliminar portada | Sí |
| PUT | `/creative-cover` | Actualizar portada creativo | Sí |
| DELETE | `/creative-cover` | Eliminar portada creativo | Sí |
| PUT | `/change-email` | Cambiar email | Sí |
| DELETE | `/profile` | Eliminar cuenta | Sí |
| GET | `/favorites` | Posts favoritos | Sí |
| POST | `/favorites/:postId` | Agregar a favoritos | Sí |
| DELETE | `/favorites/:postId` | Quitar de favoritos | Sí |
| POST | `/saved-offers/:offerId` | Guardar oferta | Sí |
| DELETE | `/saved-offers/:offerId` | Quitar oferta guardada | Sí |
| GET | `/saved-offers` | Listar ofertas guardadas | Sí |
| GET | `/applied-offers` | Listar ofertas a las que aplicó | Sí |
| POST | `/follow/:userId` | Seguir usuario | Sí |
| DELETE | `/follow/:userId` | Dejar de seguir | Sí |
| GET | `/following` | Ver usuarios seguidos | Sí |
| GET | `/followers` | Ver seguidores | Sí |
| GET | `/check-follow/:userId` | ¿Sigo a este usuario? | Sí |
| GET | `/searchUsers` | Buscar usuarios | Sí |
| GET | `/creatives` | Directorio de creativos | No |
| GET | `/search` | Búsqueda global | No |
| GET | `/:userId/offers` | Ofertas de trabajo del usuario | No |
| GET | `/:userId/educational-offers` | Ofertas educativas del usuario | No |

### Posts — `/api/posts`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/` | Crear post (con imágenes) | Sí |
| GET | `/user` | Posts del usuario autenticado | Sí |
| GET | `/user/:username` | Posts de usuario por username | No |
| GET | `/home` | Posts aleatorios para home | No |
| GET | `/random` | Posts aleatorios (excluyendo ID) | No |
| GET | `/explorer` | Posts para explorador | No |
| GET | `/tags/:tag` | Posts por etiqueta | No |
| GET | `/staff-picks` | Posts destacados (staff picks) | No |
| GET | `/search` | Buscar posts | Sí |
| GET | `/:id` | Post por ID | No |
| PUT | `/:id` | Actualizar post | Sí |
| DELETE | `/:id` | Eliminar post | Sí |
| PUT | `/:id/staff-pick` | Marcar como staff pick | Admin |
| DELETE | `/:id/staff-pick` | Desmarcar staff pick | Admin |

### Ofertas — `/api/offers`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/create` | Crear oferta de trabajo | Sí |
| PUT | `/:id` | Actualizar oferta | Sí |
| DELETE | `/:id` | Eliminar oferta | Sí |
| GET | `/unreviewed` | Ofertas sin revisar | Admin |
| GET | `/search` | Buscar ofertas | No |
| GET | `/user` | Mis ofertas | Sí |
| GET | `/company` | Ofertas de mi empresa | Sí |
| GET | `/user/:username` | Ofertas públicas de usuario | No |
| GET | `/` | Todas las ofertas | No |
| GET | `/:id` | Oferta por ID | No |
| PUT | `/:id/status` | Cambiar estado de oferta | Sí |
| GET | `/:id/check-application` | ¿Ya apliqué a esta oferta? | Sí |
| POST | `/:id/apply` | Aplicar a oferta | Sí |
| PUT | `/:id/applications/:applicationId/status` | Cambiar estado de candidatura | Sí |
| POST | `/educational` | Crear oferta educativa | Sí |
| GET | `/educational/institutions` | Ofertas educativas por institución | No |
| GET | `/educational/user/:username` | Educativas de usuario (público) | No |
| GET | `/educational/user` | Mis ofertas educativas | Sí |
| GET | `/educational` | Todas las ofertas educativas | No |
| GET | `/educational/:id` | Oferta educativa por ID | No |
| PUT | `/educational/:id/status` | Cambiar estado educativa | Sí |

### Carpetas — `/api/folders`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/` | Crear carpeta | Sí |
| GET | `/` | Listar mis carpetas | Sí |
| POST | `/add` | Agregar post a carpeta | Sí |
| POST | `/remove` | Quitar post de carpeta | Sí |
| GET | `/:id` | Carpeta por ID | Sí |
| PUT | `/:id` | Actualizar carpeta | Sí |
| DELETE | `/:id` | Eliminar carpeta | Sí |

### Blog — `/api/blog`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Posts publicados | No |
| GET | `/featured` | Posts destacados | No |
| GET | `/category/:category` | Posts por categoría | No |
| GET | `/:id` | Post por ID | No |

### Revistas — `/api/magazines`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Revistas activas | No |
| GET | `/:id` | Detalle de revista | No |

### Industria — `/api/industry`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Perfiles activos de industria | No |

### Etiquetas — `/api/tags`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Tags (filtrable por type, status) | No |
| GET | `/cities` | Contadores de usuarios por ciudad | No |

### Admin — `/api/admin` (requiere isAdmin)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/stats` | Estadísticas del dashboard |
| POST | `/create-admin` | Crear nuevo administrador |
| GET | `/profile` | Perfil del admin |
| PUT | `/profile` | Actualizar perfil admin |
| PUT | `/change-password` | Cambiar contraseña admin |
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:userId` | Detalle de usuario |
| PUT | `/users/:userId` | Actualizar usuario |
| DELETE | `/users/:userId/permanent` | Eliminar permanentemente |
| PUT | `/users/:userId/deactivate` | Soft delete |
| PUT | `/users/:userId/restore` | Restaurar usuario |
| GET | `/offers` | Todas las ofertas |
| PUT | `/offers/:offerId/status` | Cambiar estado |
| DELETE | `/offers/:offerId` | Eliminar oferta |
| GET | `/educational-offers` | Todas las educativas |
| PUT | `/educational-offers/:offerId/status` | Cambiar estado |
| DELETE | `/educational-offers/:offerId` | Eliminar educativa |
| GET | `/posts` | Todos los posts |
| POST | `/posts` | Crear post |
| PUT | `/posts/:postId` | Actualizar post |
| DELETE | `/posts/:postId` | Eliminar post |
| PUT | `/posts/:postId/staff-pick` | Marcar/desmarcar staff pick |
| GET | `/blog` | Todos los posts de blog |
| POST | `/blog` | Crear post de blog |
| PUT | `/blog/:postId` | Actualizar |
| DELETE | `/blog/:postId` | Eliminar |
| PUT | `/blog/:postId/status` | Cambiar estado (draft/published/archived) |
| GET | `/schools` | Todas las escuelas |
| POST | `/schools` | Crear escuela |
| PUT | `/schools/:schoolId` | Actualizar |
| DELETE | `/schools/:schoolId` | Eliminar |
| GET | `/magazines` | Todas las revistas |
| POST | `/magazines` | Crear revista |
| PUT | `/magazines/:magazineId` | Actualizar |
| DELETE | `/magazines/:magazineId` | Eliminar |
| GET | `/industry` | Todo el directorio de industria |
| POST | `/industry` | Crear entrada |
| PUT | `/industry/:industryId` | Actualizar |
| DELETE | `/industry/:industryId` | Eliminar |

---

## 8. RUTAS DEL FRONTEND

### App.jsx — Frontend usuario

```
LANDING Y AUTH:
/                               → Home.jsx (landing + modales login/registro)
/login                          → Redirect a /
/token-handler                  → TokenHandler.jsx (captura token OAuth)

REGISTRO (flujo por pasos):
/complete-registration          → CompleteRegistration.jsx
/creativo/registro              → CompleteRegistrationCreativo.jsx
/photo/registro/03              → CompleteRegistrationCreativo03.jsx
/profesional/registro           → CompleteRegistrationProfesional.jsx
/profesional/registro/datos-personales   → ...DatosPersonales.jsx
/profesional/registro/institucion        → ...Institucion.jsx
/profesional/registro/marca/05           → ...Marca05.jsx
/profesional/registro/empresa/05         → ...Empresa05.jsx
/profesional/registro/agencia/05         → ...Agencia05.jsx

NUEVO SISTEMA DE PERFIL:
/myprofile                      → Redirect a /myprofile/edit
/myprofile/edit                 → ProfileEditPage.jsx
/myprofile/offers               → ProfileOffersPage.jsx
/myprofile/settings             → ProfileSettingsPage.jsx

REDIRECCIONES DE COMPATIBILIDAD:
/editProfile                    → Redirect a /myprofile/edit
/misOfertas                     → Redirect a /myprofile/offers
/configuracion                  → Redirect a /myprofile/settings
/mi-perfil/*                    → Redirect a /myprofile/*

PÚBLICAS (con AuthLayout):
/explorer                       → Explorer.jsx
/post/:id                       → UserPost.jsx (requiere auth)
/offers                         → Offers.jsx
/offers/:offerId                → Redirect a /JobOfferDetail/:offerId
/JobOfferDetail/:offerId        → JobOfferDetail.jsx
/EducationalOfferDetail/:offerId → EducationalOfferDetail/
/creatives                      → Creatives.jsx
/industry                       → Industry.jsx
/fashion                        → Fashion.jsx
/blog                           → Blog.jsx
/magazine                       → Magazine.jsx
/article/:id                    → ArticleDetail.jsx
/legal                          → AvisoLegal.jsx
/privacy                        → Privacidad.jsx
/cookies                        → Cookies.jsx
/contact                        → Contacto.jsx
/about                          → About.jsx
/profile/:username              → UserProfile.jsx (perfil público)

PROTEGIDAS (requieren auth):
/profile                        → MiPerfil.jsx (vista antigua)
/community                      → MyComunity.jsx
/createPost                     → CreatePost.jsx
/createOffer                    → CreateOffer.jsx
/createEducationalOffer         → CreateEducationalOffer/
/guardados                      → Guardados.jsx
/guardados/folder/:folderId     → FolderContent.jsx
/offer/:offerId                 → ViewOffer.jsx
/edit-offer/:offerId            → CreateOffer.jsx (modo edición)
/edit-educational-offer/:offerId → CreateEducationalOffer/ (modo edición)

DINÁMICA:
/:username                      → UserProfile.jsx (perfil público, cualquier username)
```

### App.jsx — Frontend admin

```
PÚBLICAS:
/login                          → LoginPage.jsx

PROTEGIDAS (requieren auth admin):
/                               → DashboardPage.jsx
/usuarios                       → UsersPage.jsx
/usuarios/:userId               → UserDetailPage.jsx
/ofertas                        → OffersPage.jsx
/ofertas/:offerId               → EditOfferPage.jsx
/ofertas-educativas             → EducationalOffersPage.jsx
/ofertas-educativas/:offerId    → EditEducationalOfferPage.jsx
/posts                          → PostsPage.jsx
/posts/new                      → PostFormPage.jsx
/posts/edit/:postId             → PostFormPage.jsx (edición)
/blog                           → BlogPage.jsx
/blog/crear                     → BlogPostFormPage.jsx
/blog/:postId                   → BlogPostFormPage.jsx (edición)
/revistas                       → MagazinesPage.jsx
/revistas/nueva                 → MagazineFormPage.jsx
/revistas/editar/:magazineId    → MagazineFormPage.jsx (edición)
/schools                        → SchoolsPage.jsx
/schools/new                    → SchoolFormPage.jsx
/schools/edit/:schoolId         → SchoolFormPage.jsx (edición)
/industria                      → IndustryPage.jsx
/industria/nueva                → IndustryFormPage.jsx
/industria/editar/:industryId   → IndustryFormPage.jsx (edición)
/configuracion                  → SettingsPage.jsx
*                               → NotFoundPage.jsx
```

---

## 9. FLUJOS PRINCIPALES

### Registro y autenticación

```
1. Landing (/) → Modal de registro
2. Introducir email → POST /api/auth/send-verification-code-pre-registration
3. Código de 6 dígitos por email → POST /api/auth/verify-code-pre-registration
4. Seleccionar tipo: Creativo | Profesional
5a. CREATIVO → /creativo/registro → subtipo → /photo/registro/03
5b. PROFESIONAL → /profesional/registro → subtipo específico (empresa/marca/agencia/institución)
6. JWT almacenado en localStorage como 'authToken'
7. Redirect a /explorer
```

### Login OAuth con Google

```
1. Clic en "Continuar con Google" → GET /api/auth/google
2. Redirect a Google → callback → GET /api/auth/google/callback
3. Backend redirige a frontend con ?token=...
4. TokenHandler.jsx captura el token → localStorage.setItem('authToken', token)
5. Navigate a /explorer
```

### Publicar un post

```
1. Usuario autenticado → /createPost
2. Subir imágenes (max 6, 2MB c/u) → multipart/form-data
3. Añadir título, descripción, tags
4. Mencionar usuarios (peopleTags) → búsqueda en tiempo real
5. POST /api/posts → Cloudinary almacena imágenes
6. Redirect al post creado
```

### Aplicar a una oferta de trabajo

```
1. /JobOfferDetail/:offerId → GET /api/offers/:id
2. Comprobar si ya aplicó → GET /api/offers/:id/check-application
3. Clic en "Aplicar" → ApplyOfferModal.jsx
4. Responder extraQuestions (si las hay)
5. POST /api/offers/:id/apply
6. Estado inicial: 'pending'
```

### Sistema de portadas de perfil

```
1. /myprofile/edit → ProfileEditPage.jsx
2. Seleccionar plantilla desktop (6 opciones) o móvil (4 opciones)
3. Subir imagen de portada → PUT /api/users/featured-header/:variant
4. Plantilla renderiza con heroTemplates/ (D_Centered, D_Fullscreen, etc.)
```

---

## 10. INFRAESTRUCTURA Y DESPLIEGUE

### Puertos locales

| Servicio | Puerto |
|---|---|
| Backend API | 5000 |
| Frontend usuario | 3000 |
| Frontend admin | 3001 |
| MongoDB | 27017 |

### Producción (Railway.app)

- Backend: Railway container
- MongoDB: Railway plugin
- Frontend: Railway container con Nginx
- Admin: Railway container con Nginx

### Cloudinary

- Almacenamiento de todas las imágenes (posts, perfiles, portadas, logos)
- Cloud name: `dv9ctetkn`
- Subida via Multer (multipart) + streamifier

### Email (Brevo)

- Envío de códigos de verificación de registro
- Notificaciones de aplicaciones a ofertas
- SDK: `sib-api-v3-sdk`

---

## 11. ESTADO ACTUAL DEL PROYECTO

### Migración de perfil en progreso

El sistema de perfil está migrando de la arquitectura antigua a una nueva:

| Ruta antigua | Ruta nueva | Estado |
|---|---|---|
| `/editProfile` | `/myprofile/edit` | Redirect activo |
| `/misOfertas` | `/myprofile/offers` | Redirect activo |
| `/configuracion` | `/myprofile/settings` | Redirect activo |
| `/mi-perfil/*` | `/myprofile/*` | Redirect activo |

Los nuevos componentes están en `frontend/src/pages/profile/`.

### Landing page

La landing ha sido completamente renovada. Los componentes activos son:

```
LandingHeader → LandingHero → LandingLinkSection → LandingTemplatesParallax
→ LandingCreatorsShowcase → LandingFinalCTA → LandingFooter
```

### Limpieza realizada (marzo 2026)

Eliminados los siguientes archivos huérfanos:
- `CallToAction.jsx`, `FooterHome.jsx`, `HeaderHome.jsx` (landing antigua)
- `LandingAddressTo.jsx`, `LandingHowItWorks.jsx` (imports muertos en Home.jsx)
- `Parallax.jsx`, `ParallaxContent.jsx` (sustituidos por LandingTemplatesParallax)
- `LandingTypewriter.js` (vanilla JS incompatible con React)
- `css/header-footer.css`, `css/efecto-parallex.css`, `css/page-wrapper.css`, `css/style.css`

### Tipos de usuario

| Tipo | Subtipos | Flujo de registro |
|---|---|---|
| Creativo | Fotografía, Estilismo, Dirección creativa, MUAH, Diseño... | `/creativo/registro` |
| Profesional | Empresa, Marca, Agencia, Institución educativa, Freelance | `/profesional/registro` |
| Admin | — | Creado directamente por otro admin |

### Roles y permisos

| Acción | Público | Usuario | Admin |
|---|---|---|---|
| Ver landing, blog, revistas | ✓ | ✓ | ✓ |
| Ver explorador, creativos, ofertas | ✓ | ✓ | ✓ |
| Ver perfil público | ✓ | ✓ | ✓ |
| Ver post detalle | — | ✓ | ✓ |
| Crear posts, ofertas | — | ✓ | ✓ |
| Aplicar a ofertas | — | ✓ | ✓ |
| Guardar en carpetas | — | ✓ | ✓ |
| Staff picks, moderar contenido | — | — | ✓ |
| Gestión completa (CRUD todo) | — | — | ✓ |
