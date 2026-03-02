# ARQUITECTURA PROPUESTA — frontend/src

> Documento de planificación. Creado: marzo 2026.
> **No ejecutar hasta decisión explícita. Solo referencia.**

---

## El problema central

Todo vive en `components/controlPanel/` — páginas completas, layouts, modales, formularios y secciones reutilizables mezclados en una sola carpeta de ~80 archivos. No hay capa de servicios, no hay contextos, y el CSS está centralizado en una carpeta sin relación directa con sus componentes.

---

## Nueva estructura propuesta

```
src/
├── main.jsx
├── App.jsx
├── index.css
│
├── pages/                          # Solo vistas de ruta (una por página)
├── components/                     # Solo UI reutilizable
├── layouts/                        # Layouts de la app
├── services/                       # Llamadas a la API (nueva)
├── contexts/                       # Estado global (nueva)
├── hooks/                          # Custom hooks (nueva)
└── utils/                          # Utilidades (ya existe)
```

---

## Detalle de cada carpeta

### `pages/` — Vistas completas (una por ruta)

```
pages/
├── Home.jsx                        ← ya está aquí ✓
│
├── explorer/
│   └── ExplorerPage.jsx            ← viene de controlPanel/Explorer.jsx
│
├── creatives/
│   └── CreativesPage.jsx           ← viene de controlPanel/Creatives.jsx
│
├── industry/
│   └── IndustryPage.jsx            ← viene de controlPanel/Industry.jsx
│
├── fashion/
│   └── FashionPage.jsx             ← viene de controlPanel/Fashion.jsx
│
├── blog/
│   ├── BlogPage.jsx                ← viene de controlPanel/Blog.jsx
│   └── ArticleDetailPage.jsx       ← viene de controlPanel/ArticleDetail.jsx
│
├── magazine/
│   └── MagazinePage.jsx            ← viene de controlPanel/Magazine.jsx
│
├── offers/
│   ├── OffersPage.jsx              ← viene de controlPanel/Offers.jsx
│   ├── JobOfferDetailPage.jsx      ← viene de controlPanel/JobOfferDetail.jsx
│   ├── EducationalOfferDetailPage/ ← viene de controlPanel/EducationalOfferDetail/
│   └── ViewOfferPage.jsx           ← viene de controlPanel/ViewOffer.jsx
│
├── community/
│   └── CommunityPage.jsx           ← viene de controlPanel/MyComunity.jsx
│
├── post/
│   ├── UserPostPage.jsx            ← viene de controlPanel/UserPost.jsx
│   └── CreatePostPage.jsx          ← viene de controlPanel/CreatePost.jsx
│
├── create-offer/
│   ├── CreateOfferPage.jsx         ← viene de controlPanel/CreateOffer.jsx
│   └── CreateEducationalOfferPage/ ← viene de controlPanel/CreateEducationalOffer/
│
├── saved/
│   ├── GuardadosPage.jsx           ← viene de controlPanel/Guardados.jsx
│   └── FolderContentPage.jsx       ← viene de controlPanel/FolderContent.jsx
│
├── profile/                        ← ya está bien estructurado ✓
│   ├── ProfileRoot.jsx
│   ├── ProfileEditPage.jsx
│   ├── ProfileOffersPage.jsx
│   ├── ProfileSettingsPage.jsx
│   └── NewEditProfileContent.jsx
│
├── user-profile/
│   └── UserProfilePage.jsx         ← viene de controlPanel/UserProfile.jsx
│
├── my-profile/
│   └── MiPerfilPage.jsx            ← viene de controlPanel/MiPerfil.jsx (vista vieja)
│
├── register/                       ← renombrado y reorganizado
│   ├── CompleteRegistration.jsx    ← ya está aquí ✓
│   ├── creativo/
│   │   ├── Step01.jsx              ← viene de creativos/CompleteRegistrationCreativo.jsx
│   │   └── Step03.jsx              ← viene de creativos/CompleteRegistrationCreativo03.jsx
│   └── profesional/
│       ├── Step01.jsx              ← viene de profesionales/CompleteRegistrationProfesional.jsx
│       ├── DatosPersonales.jsx
│       ├── Institucion.jsx
│       ├── Empresa.jsx
│       ├── Marca.jsx
│       └── Agencia.jsx
│
└── legal/
    ├── AvisoLegalPage.jsx          ← viene de controlPanel/AvisoLegal.jsx
    ├── PrivacidadPage.jsx          ← viene de controlPanel/Privacidad.jsx
    ├── CookiesPage.jsx             ← viene de controlPanel/Cookies.jsx
    ├── ContactoPage.jsx            ← viene de controlPanel/Contacto.jsx
    └── AboutPage.jsx               ← viene de controlPanel/About.jsx
```

---

### `layouts/` — Estructuras de página (nueva carpeta)

```
layouts/
├── AppLayout.jsx                   ← viene de controlPanel/Layout.jsx
│                                     (wrapper con header + sidebar para usuarios auth)
├── AuthLayout.jsx                  ← viene de components/AuthLayout.jsx
│                                     (wrapper con LandingHeader para usuarios no auth)
├── Header.jsx                      ← viene de controlPanel/Header.jsx
├── MobileTopHeader.jsx             ← viene de controlPanel/MobileTopHeader.jsx
└── MobileSideMenu.jsx              ← viene de controlPanel/MobileSideMenu.jsx
```

> `Sidebar.jsx` ya es `return null` — se queda hasta que se implemente el nuevo sidebar.

---

### `components/` — Solo UI reutilizable

```
components/
│
├── landing/                        ← renombrado desde components/home/
│   ├── LandingHeader.jsx
│   ├── LandingHero.jsx
│   ├── LandingCreatorsShowcase.jsx
│   ├── LandingTemplatesParallax.jsx
│   ├── LandingLinkSection.jsx
│   ├── LandingFinalCTA.jsx
│   ├── LandingFooter.jsx
│   ├── LoginModal.jsx
│   ├── RegisterModal.jsx
│   ├── PasswordResetModal.jsx
│   └── css/                        ← se queda colocado aquí ✓
│
├── profile/                        ← agrupa todas las secciones del perfil
│   ├── own/                        ← viene de controlPanel/miPerfil/
│   │   ├── ProfileHeader.jsx
│   │   ├── BiographySection.jsx
│   │   ├── ProfessionalTitleSection.jsx
│   │   ├── ProfessionalExperienceSection.jsx
│   │   ├── EducationSection.jsx
│   │   ├── LanguagesSection.jsx
│   │   ├── SkillsSection.jsx
│   │   ├── SoftwareSection.jsx
│   │   ├── SocialSection.jsx
│   │   ├── DownloadableFilesSection.jsx
│   │   ├── CompanyTagsSection.jsx
│   │   ├── MilestoneSection.jsx
│   │   ├── ProjectsSection.jsx
│   │   ├── CompanyOffersSection.jsx
│   │   ├── EducationalOffersSection.jsx
│   │   ├── PrintableProfile.jsx
│   │   └── printProfile.js
│   │
│   ├── public/                     ← viene de controlPanel/userProfile/
│   │   ├── UserProfileHeader.jsx
│   │   ├── ExternalProfileHeader.jsx
│   │   ├── UserBiographySection.jsx
│   │   ├── UserProfessionalTitleSection.jsx
│   │   ├── UserProfessionalExperienceSection.jsx
│   │   ├── UserEducationSection.jsx
│   │   ├── UserLanguagesSection.jsx
│   │   ├── UserSkillsSection.jsx
│   │   ├── UserSoftwareSection.jsx
│   │   ├── UserSocialSection.jsx
│   │   ├── UserDownloadableFilesSection.jsx
│   │   ├── UserCompanyTagsSection.jsx
│   │   ├── UserMilestoneSection.jsx
│   │   ├── UserProjectsSection.jsx
│   │   ├── UserCompanyOffersSection.jsx
│   │   ├── UserEducationalOffersSection.jsx
│   │   ├── UserGallery.jsx
│   │   └── ProfileStickyActions.jsx
│   │
│   ├── edit/                       ← viene de controlPanel/editProfile/
│   │   ├── tabs/
│   │   │   ├── CvTab.jsx
│   │   │   ├── InfoTab.jsx
│   │   │   ├── PdfTab.jsx
│   │   │   ├── ProfileAppearanceTab.jsx
│   │   │   ├── SocialTab.jsx
│   │   │   └── cv/
│   │   │       ├── AvailabilitySection.jsx
│   │   │       ├── BiographySection.jsx
│   │   │       ├── EducationSection.jsx
│   │   │       ├── ExperienceSection.jsx
│   │   │       ├── LanguagesSection.jsx
│   │   │       ├── SoftSkillsSection.jsx
│   │   │       └── SoftwareSection.jsx
│   │   ├── templates/
│   │   │   ├── GalleryPreview.jsx
│   │   │   └── MiniHeroPreview.jsx
│   │   └── ui/
│   │       └── AutosaveStatus.jsx
│   │
│   └── hero/                       ← viene de pages/profile/heroTemplates/
│       ├── ProfileHeroTemplates.jsx
│       ├── HeroAtoms.jsx
│       ├── heroShared.js
│       ├── templates/
│       │   ├── desktop/
│       │   └── mobile/
│       └── styles/
│
├── modals/                         ← ya existe, se amplía
│   ├── EditProfileModal.jsx        ← ya está ✓
│   ├── VerificationRequiredModal.jsx ← ya está ✓
│   ├── ApplyOfferModal.jsx         ← viene de controlPanel/
│   └── ProfileOptionsModal.jsx     ← viene de controlPanel/
│
├── search/                         ← nueva subcarpeta
│   ├── SearchFullScreen.jsx        ← viene de controlPanel/
│   └── SearchResults.jsx           ← viene de controlPanel/
│
└── common/                         ← utilidades de UI genéricas
    ├── ScrollToTop.jsx             ← viene de components/
    ├── TokenHandler.jsx            ← viene de components/
    └── PeopleTagsList.jsx          ← viene de components/
```

---

### `services/` — Capa de API (nueva, patrón del frontend-admin)

```
services/
├── api.js                          # Instancia axios con interceptor JWT
├── authService.js                  # login, register, OAuth, reset password
├── userService.js                  # perfil, follow, favoritos, búsqueda
├── postService.js                  # crear, leer, editar, eliminar posts
├── offerService.js                 # ofertas de trabajo + aplicaciones
├── educationalOfferService.js      # ofertas educativas
├── folderService.js                # carpetas de guardados
├── blogService.js                  # artículos del blog
├── magazineService.js              # revistas
├── industryService.js              # directorio de industria
└── tagService.js                   # etiquetas
```

---

### `contexts/` — Estado global (nueva)

```
contexts/
└── AuthContext.jsx                 # isAuthenticated, user, login(), logout()
                                    # sustituye los localStorage.getItem() dispersos
```

---

### `hooks/` — Custom hooks (nueva)

```
hooks/
├── useAuth.js                      # consume AuthContext
└── useScrollToTop.js               # extrae lógica de ScrollToTop.jsx
```

---

### CSS — Estrategia de colocalización

Actualmente todo el CSS está en `controlPanel/css/` desacoplado de sus componentes. La propuesta es colocar cada CSS **junto a su componente**:

```
pages/blog/
├── BlogPage.jsx
└── BlogPage.css                    ← junto al componente, no en una carpeta css/ central
```

Excepción: `index.css` y `control-panel.css` se mantienen globales en la raíz.

---

## Resumen del movimiento de archivos

| Origen actual | Destino nuevo |
|---|---|
| `components/controlPanel/*.jsx` (páginas) | `pages/[sección]/` |
| `components/controlPanel/Layout.jsx` | `layouts/AppLayout.jsx` |
| `components/controlPanel/Header.jsx` | `layouts/Header.jsx` |
| `components/controlPanel/MobileTopHeader.jsx` | `layouts/MobileTopHeader.jsx` |
| `components/controlPanel/MobileSideMenu.jsx` | `layouts/MobileSideMenu.jsx` |
| `components/controlPanel/miPerfil/` | `components/profile/own/` |
| `components/controlPanel/userProfile/` | `components/profile/public/` |
| `components/controlPanel/editProfile/` | `components/profile/edit/` |
| `components/controlPanel/ApplyOfferModal.jsx` | `components/modals/` |
| `components/controlPanel/ProfileOptionsModal.jsx` | `components/modals/` |
| `components/controlPanel/SearchFullScreen.jsx` | `components/search/` |
| `components/controlPanel/SearchResults.jsx` | `components/search/` |
| `components/controlPanel/css/` | colocado junto a cada componente |
| `components/home/` | `components/landing/` |
| `components/AuthLayout.jsx` | `layouts/AuthLayout.jsx` |
| `components/ScrollToTop.jsx` | `components/common/` |
| `components/TokenHandler.jsx` | `components/common/` |
| `components/PeopleTagsList.jsx` | `components/common/` |
| `pages/profile/heroTemplates/` | `components/profile/hero/` |
| `pages/creativos/` | `pages/register/creativo/` |
| `pages/profesionales/` | `pages/register/profesional/` |
| — | `services/` (crear desde cero) |
| — | `contexts/AuthContext.jsx` (crear) |
| — | `hooks/` (crear) |

---

## Notas de implementación

- Esta reorganización **no cambia lógica**, solo mueve y renombra archivos.
- Hay que actualizar todos los imports en `App.jsx` y en cada componente afectado.
- La migración puede hacerse de forma **progresiva por sección** (p.ej. primero `services/`, luego `layouts/`, luego páginas una a una).
- La capa `services/` es independiente y puede crearse sin mover ningún archivo existente.
- `contexts/AuthContext.jsx` también puede crearse sin romper nada — solo sustituye los `localStorage.getItem('authToken')` dispersos.
