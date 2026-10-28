// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContextProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import RouteTitle from "./components/RouteTitle";
import RouteHistoryTracker from "./components/RouteHistoryTracker";
import VisitTracker from "./components/VisitTracker";
import { RouteSkeleton } from "./components/skeleton/PageSkeleton";
import TokenHandler from "./components/TokenHandler";

// ControlPanel Layout
import Layout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

// Sidebar persistente compartido por edit/settings/guardados/community/proyectos
// — no lazy: es el layout que ya está montado mientras cargan sus rutas hijas,
// así que debe estar disponible de inmediato (evita otro salto de Suspense).


// CSS
import "./pages/css/control-panel.css";

// Páginas (lazy: cada una se carga en su propio chunk al navegar a su ruta)
const Home = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CompleteRegistration = lazy(() => import("./pages/CompleteRegistration")); // DEPRECATED
const OnboardingWizard = lazy(() => import("./pages/onboarding/OnboardingWizard"));

// Registro creativos
const CompleteRegistrationCreativo = lazy(() => import("./pages/creativos/CompleteRegistrationCreativo"));
const CompleteRegistrationCreativo03 = lazy(() => import("./pages/creativos/CompleteRegistrationCreativo03"));

// Registro profesionales
const CompleteRegistrationProfesional = lazy(() => import("./pages/profesionales/CompleteRegistrationProfesional"));
const CompleteRegistrationProfesionalDatosPersonales = lazy(() => import("./pages/profesionales/CompleteRegistrationProfesionalDatosPersonales"));
const CompleteRegistrationProfesionalInstitucion = lazy(() => import("./pages/profesionales/CompleteRegistrationProfesionalInstitucion"));
const CompleteRegistrationProfesionalMarca05 = lazy(() => import("./pages/profesionales/CompleteRegistrationProfesionalMarca05"));
const CompleteRegistrationProfesionalEmpresa05 = lazy(() => import("./pages/profesionales/CompleteRegistrationProfesionalEmpresa05"));
const CompleteRegistrationProfesionalAgencia05 = lazy(() => import("./pages/profesionales/CompleteRegistrationProfesionalAgencia05"));

// ControlPanel páginas
const MiPerfil = lazy(() => import("./pages/profile/MiPerfilPage"));
const UserProfile = lazy(() => import("./pages/profile/UserProfilePage"));

const UserPost = lazy(() => import("./pages/post/UserPostPage"));
// /createPost abre el mismo modal que editar un proyecto (ProjectEditor en
// modo "crear"), igual que el botón Publicar.
const CreatePost = lazy(() => import("./components/modals/CreatePostModal").then((m) => ({ default: m.CreatePostRoute })));

const Guardados = lazy(() => import("./pages/saved/GuardadosPage"));
// Enlaces antiguos /guardados/folder/:id → /guardados?carpeta=<id> (una sola página "Guardados")
const GuardadosFolderRedirect = lazy(() => import("./pages/saved/GuardadosPage").then((m) => ({ default: m.GuardadosFolderRedirect })));

const OrganizeProjects = lazy(() => import("./pages/proyectos/OrganizeProjectsPage"));
const ProjectPage = lazy(() => import("./pages/proyectos/ProjectPagePage"));
const ProjectEditor = lazy(() => import("./pages/proyectos/ProjectEditorPage"));
// Lazy junto con su CSS (editProfileShell.css): shell y estilos llegan a la
// vez, y quien no entra al panel no descarga nada de esto.
const PanelShellLayout = lazy(() => import("./components/controlPanel/editProfile/ui/PanelShellLayout"));

const Industry = lazy(() => import("./pages/industry/IndustryPage"));
const Explorer = lazy(() => import("./pages/explorer/ExplorerPage"));
const TagFeed = lazy(() => import("./pages/explorer/TagFeedPage"));
const Creatives = lazy(() => import("./pages/creatives/CreativesPage"));
const Fashion = lazy(() => import("./pages/fashion/FashionPage"));
const MyComunity = lazy(() => import("./pages/community/CommunityPage"));

const Offers = lazy(() => import("./pages/offers/OffersPage"));
const ViewOffer = lazy(() => import("./pages/offers/ViewOfferPage"));
const JobOfferDetail = lazy(() => import("./pages/offers/JobOfferDetailPage"));
const EducationalOfferDetail = lazy(() => import("./pages/offers/EducationalOfferDetailPage"));
const CreateOffer = lazy(() => import("./pages/offers/CreateOfferPage"));
const CreateEducationalOffer = lazy(() => import("./pages/offers/CreateEducationalOfferPage"));

const Magazine = lazy(() => import("./pages/magazine/MagazinePage"));
const Blog = lazy(() => import("./pages/blog/BlogPage"));
const ArticleDetail = lazy(() => import("./pages/blog/ArticleDetailsPage"));

const AvisoLegal = lazy(() => import("./pages/legal/AvisoLegalPage"));
const Privacidad = lazy(() => import("./pages/legal/PrivacidadPage"));
const Cookies = lazy(() => import("./pages/legal/CookiesPage"));
const Contacto = lazy(() => import("./pages/legal/ContactoPage"));
const Terminos = lazy(() => import("./pages/legal/TerminosPage"));

// const About = lazy(() => import("./pages/legal/AboutPage")); // oculta, ver /about más abajo
// const Templates = lazy(() => import("./pages/templates/TemplatesPage")); // oculta, ver /templates más abajo

// ✅ Nuevo perfil por rutas
const ProfileRoot = lazy(() => import("./pages/profile/ProfileRoot"));
const PublicPortfolioPage = lazy(() => import("./pages/profile/PublicPortfolioPagePage"));
const ProfileEditPage = lazy(() => import("./pages/profile/ProfileEditPage"));
const ProfileOffersPage = lazy(() => import("./pages/profile/ProfileOffersPage"));
const ProfileSettingsPage = lazy(() => import("./pages/profile/ProfileSettingsPage"));

// Vive dentro de AuthContextProvider (para leer sessionExpired) y dentro de
// Router (para poder navegar). Cuando la sesión caduca, redirige a /login
// en vez de mostrar un modal encima de la página actual — LoginPage lee
// location.state.sessionExpired para mostrar el aviso, y location.state.from
// para devolver al usuario a la página donde estaba tras volver a entrar.
function SessionExpiredGate() {
  const { sessionExpired, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionExpired) return;
    dismissSessionExpired();
    if (location.pathname !== "/login") {
      const from = location.pathname + location.search;
      navigate("/login", { state: { sessionExpired: true, from }, replace: true });
    }
  }, [sessionExpired, location.pathname, location.search, navigate, dismissSessionExpired]);

  return null;
}

// Rutas que exigen sesión. Sin token → /login (antes: home con el modal de
// registro), guardando la ruta para volver a ella tras iniciar sesión.
function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!localStorage.getItem("authToken")) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

// Redirección de una URL antigua del panel a su sitio bajo /myprofile/,
// conservando parámetros de ruta (:id...), query (?carpeta=...) y hash —
// <Navigate to="..."> a secas los perdería.
function LegacyPanelRedirect({ to }) {
  const params = useParams();
  const location = useLocation();
  const path = to.replace(/:(\w+)/g, (_, key) => encodeURIComponent(params[key] ?? ""));
  return <Navigate to={`${path}${location.search}${location.hash}`} replace state={location.state} />;
}

// /profile/:username → /:username (misma página), conservando ?query y #hash.
function ProfileUsernameRedirect() {
  const { username } = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`/${username}${search}${hash}`} replace />;
}

function App() {
  const isLoggedIn = !!localStorage.getItem("authToken");

  const AppWithLayout = ({ children, activeMenu, contentClassName, hideAtTop, hideOwnHeader, hideDesktopHeader }) => (
    <Layout activeMenu={activeMenu} contentClassName={contentClassName} hideAtTop={hideAtTop} hideOwnHeader={hideOwnHeader} hideDesktopHeader={hideDesktopHeader}>
      {children}
    </Layout>
  );

  return (
    <AuthContextProvider>
    <Router>
      <SessionExpiredGate />
      <ScrollToTop />
      <RouteTitle />
      <RouteHistoryTracker />
      <VisitTracker />
      <CookieBanner />
      <Suspense fallback={<RouteSkeleton fullscreen />}>
      <Routes>
        {/* ✅ NUEVA ZONA PERFIL — index y offers sin cambios, fuera del panel
            persistente (offers no lleva PanelSidebar, se deja tal cual). */}
        <Route
          path="/myprofile"
          element={
            <AppWithLayout activeMenu="editProfile" contentClassName="overflow-hidden-desktop">
              <ProtectedRoute>
                <ProfileRoot />
              </ProtectedRoute>
            </AppWithLayout>
          }
        >
          <Route index element={<Navigate to="edit" replace />} />
          <Route path="offers" element={<ProfileOffersPage />} />
        </Route>

        {/* ✅ PANEL PERSISTENTE — .nep-shell + PanelSidebar se montan una sola
            vez en PanelShellLayout; estas páginas viven como <Outlet/> dentro
            de él, así que cambiar de una a otra no remonta el sidebar. */}
        <Route
          element={
            <AppWithLayout activeMenu="editProfile" contentClassName="overflow-hidden-desktop" hideDesktopHeader>
              <ProtectedRoute>
                <PanelShellLayout />
              </ProtectedRoute>
            </AppWithLayout>
          }
        >
          {/* Cada pestaña del editor es su propia URL (/myprofile/edit/:tab) —
              ver TAB_SLUGS en NewEditProfileContent.jsx. La ruta sin sufijo
              redirige a la pestaña por defecto en vez de renderizar nada. */}
          <Route path="/myprofile/edit" element={<Navigate to="/myprofile/edit/home" replace />} />
          <Route path="/myprofile/edit/:tab" element={<ProfileEditPage />} />
          {/* Todo el panel cuelga de /myprofile/ (antes Guardados, Comunidad
              y Proyectos iban sueltos en /guardados, /community y
              /proyectos/...: ver redirecciones más abajo). Cualquier página
              nueva del panel, también aquí debajo. */}
          <Route path="/myprofile/settings" element={<ProfileSettingsPage />} />
          <Route path="/myprofile/saved" element={<Guardados />} />
          <Route path="/myprofile/saved/folder/:folderId" element={<GuardadosFolderRedirect />} />
          <Route path="/myprofile/community" element={<MyComunity />} />
          {/* Organizar proyectos: :opTab = pages | unassigned. Segmento
              estático "page" de por medio para la página del portfolio, y
              "edit" al final para el editor, así que no chocan con :opTab. */}
          <Route path="/myprofile/projects" element={<Navigate to="/myprofile/projects/pages" replace />} />
          <Route path="/myprofile/projects/:opTab" element={<OrganizeProjects />} />
          <Route path="/myprofile/projects/page/:pageId" element={<ProjectPage />} />
          {/* Editor de proyecto a página completa (enlaces directos; desde
              "Tus proyectos" se abre en modal) */}
          <Route path="/myprofile/projects/:id/edit" element={<ProjectEditor />} />
        </Route>

        {/* URLs antiguas del panel → /myprofile/... (conservan ?query) */}
        <Route path="/guardados" element={<LegacyPanelRedirect to="/myprofile/saved" />} />
        <Route path="/guardados/folder/:folderId" element={<LegacyPanelRedirect to="/myprofile/saved/folder/:folderId" />} />
        <Route path="/community" element={<LegacyPanelRedirect to="/myprofile/community" />} />
        <Route path="/proyectos/organizar" element={<LegacyPanelRedirect to="/myprofile/projects/pages" />} />
        <Route path="/proyectos/organizar/:opTab" element={<LegacyPanelRedirect to="/myprofile/projects/:opTab" />} />
        <Route path="/proyectos/organizar/pagina/:pageId" element={<LegacyPanelRedirect to="/myprofile/projects/page/:pageId" />} />
        <Route path="/proyectos/:id/editar" element={<LegacyPanelRedirect to="/myprofile/projects/:id/edit" />} />

        {/* ✅ REDIRECCIONES (mientras migras links) */}
        <Route path="/editProfile" element={<Navigate to="/myprofile/edit" replace />} />
        <Route path="/misOfertas" element={<Navigate to="/myprofile/offers" replace />} />
        <Route path="/configuracion" element={<Navigate to="/myprofile/settings" replace />} />

        {/* si todavía existe algún link viejo */}
        <Route path="/mi-perfil" element={<Navigate to="/myprofile/edit" replace />} />
        <Route path="/mi-perfil/editar" element={<Navigate to="/myprofile/edit" replace />} />
        <Route path="/mi-perfil/ofertas" element={<Navigate to="/myprofile/offers" replace />} />
        <Route path="/mi-perfil/configuracion" element={<Navigate to="/myprofile/settings" replace />} />
        <Route path="/token-handler" element={<TokenHandler />} />

        {/* Login/Registro — páginas propias (antes modales). /login también es
            el destino al expirar la sesión, ver SessionExpiredGate arriba. */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Registro — wizard nuevo */}
        <Route path="/complete-registration" element={<OnboardingWizard />} />

        {/* Rutas deprecated del onboarding viejo — no borrar */}
        <Route path="/complete-registration-legacy" element={<CompleteRegistration />} />
        <Route path="/creativo/registro" element={<CompleteRegistrationCreativo />} />
        <Route path="/photo/registro/03" element={<CompleteRegistrationCreativo03 />} />
        <Route path="/profesional/registro" element={<CompleteRegistrationProfesional />} />
        <Route path="/profesional/registro/datos-personales" element={<CompleteRegistrationProfesionalDatosPersonales />} />
        <Route path="/profesional/registro/institucion" element={<CompleteRegistrationProfesionalInstitucion />} />
        <Route path="/profesional/registro/marca/05" element={<CompleteRegistrationProfesionalMarca05 />} />
        <Route path="/profesional/registro/empresa/05" element={<CompleteRegistrationProfesionalEmpresa05 />} />
        <Route path="/profesional/registro/agencia/05" element={<CompleteRegistrationProfesionalAgencia05 />} />

        {/* Públicas con Layout */}
        <Route path="/explorer" element={<AuthLayout activeMenu="explorer"><Explorer /></AuthLayout>} />
        <Route path="/tags/:tag" element={<AuthLayout activeMenu="explorer"><TagFeed /></AuthLayout>} />
        <Route path="/post/:id" element={<AuthLayout activeMenu="explorer"><UserPost /></AuthLayout>}/>
        <Route path="/offers" element={<AppWithLayout activeMenu="offers"><Offers /></AppWithLayout>} />
        <Route path="/offers/:offerId" element={<AppWithLayout activeMenu="offers"><Offers /></AppWithLayout>} />
        <Route path="/JobOfferDetail/:offerId" element={<AppWithLayout activeMenu="offers"><JobOfferDetail /></AppWithLayout>} />
        <Route path="/EducationalOfferDetail/:offerId" element={<AppWithLayout activeMenu="offers"><EducationalOfferDetail /></AppWithLayout>} />
        <Route path="/creatives" element={<AuthLayout activeMenu="creatives" landingNav><Creatives /></AuthLayout>} />
        <Route path="/industry" element={<AuthLayout activeMenu="industry"><Industry /></AuthLayout>} />
        <Route path="/fashion" element={<AuthLayout activeMenu="fashion"><Fashion /></AuthLayout>} />
        <Route path="/blog" element={<AuthLayout activeMenu="blog"><Blog /></AuthLayout>} />
        <Route path="/magazine" element={<AuthLayout activeMenu="magazine"><Magazine /></AuthLayout>} />
        <Route path="/article/:id" element={<AuthLayout activeMenu="blog"><ArticleDetail /></AuthLayout>} />
        <Route path="/legal" element={<AuthLayout activeMenu="info" landingNav><AvisoLegal /></AuthLayout>} />
        <Route path="/privacy" element={<AuthLayout activeMenu="info" landingNav><Privacidad /></AuthLayout>} />
        <Route path="/cookies" element={<AuthLayout activeMenu="info" landingNav><Cookies /></AuthLayout>} />
        <Route path="/terminos" element={<AuthLayout activeMenu="info" landingNav><Terminos /></AuthLayout>} />
        <Route path="/contact" element={<AuthLayout activeMenu="info"><Contacto /></AuthLayout>} />
        {/* "About us" oculta (oct 2026, decisión del usuario): /about lleva a
            la landing. AboutPage.jsx sigue en el proyecto para recuperarla:
            <Route path="/about" element={<AuthLayout activeMenu="info"><About /></AuthLayout>} /> */}
        <Route path="/about" element={<Navigate to="/" replace />} />
        {/* Página de plantillas oculta (oct 2026, decisión del usuario): lleva
            a la landing. TemplatesPage.jsx sigue en el proyecto:
            <Route path="/templates" element={<AuthLayout activeMenu="info"><Templates /></AuthLayout>} /> */}
        <Route path="/templates" element={<Navigate to="/" replace />} />


        {/* Perfil público */}
        {/* La URL de un perfil es thefolder.es/username. /profile/username
            (enlaces antiguos o compartidos) redirige ahí, con su ?query. */}
        <Route path="/profile/:username" element={<ProfileUsernameRedirect />} />
        {/* Proyecto individual dentro de una plantilla (hoy solo DaisyFilm lo
            usa) — misma page que el perfil, DaisyFilmTemplate resuelve
            :projectSlug contra sus posts (ver utils/postSlug). Segmento
            estático "project" de por medio para no chocar con :pageSlug. */}
        <Route path="/:username/project/:projectSlug" element={<AppWithLayout activeMenu="creatives" hideAtTop={!isLoggedIn} hideOwnHeader={!isLoggedIn}><UserProfile /></AppWithLayout>} />
        {/* Secciones fijas del perfil (About/Contact) — contrato de URL estable
            e independiente de la plantilla: cualquier diseño de perfil (hoy
            DaisyFilm, mañana otro) recibe `section` como prop y decide cómo
            pintarlo, pero la URL no cambia si se rediseña la plantilla. */}
        <Route path="/:username/about" element={<AppWithLayout activeMenu="creatives" hideAtTop={!isLoggedIn} hideOwnHeader={!isLoggedIn}><UserProfile section="about" /></AppWithLayout>} />
        <Route path="/:username/contact" element={<AppWithLayout activeMenu="creatives" hideAtTop={!isLoggedIn} hideOwnHeader={!isLoggedIn}><UserProfile section="contact" /></AppWithLayout>} />
        {/* Página del portfolio (creada en /proyectos/organizar) — 2 segmentos
            dinámicos, pero React Router prioriza rutas con segmentos estáticos
            (todas las de arriba) antes que esta, así que no hay colisión.
            "about"/"contact" están reservados como slugs en el backend por
            la misma razón (ver sections.js). */}
        <Route path="/:username/:pageSlug" element={<AuthLayout activeMenu="creatives"><PublicPortfolioPage /></AuthLayout>} />
        <Route path="/:username" element={<AppWithLayout activeMenu="creatives" hideAtTop={!isLoggedIn} hideOwnHeader={!isLoggedIn}><UserProfile section="portfolio" /></AppWithLayout>} />

        {/* Protegidas */}
        <Route path="/profile" element={<AppWithLayout activeMenu="profile"><ProtectedRoute><MiPerfil /></ProtectedRoute></AppWithLayout>} />
        <Route path="/createPost" element={<AppWithLayout activeMenu="community"><ProtectedRoute><CreatePost /></ProtectedRoute></AppWithLayout>} />
        <Route path="/createOffer" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/createEducationalOffer" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateEducationalOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/offer/:offerId" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><ViewOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/edit-offer/:offerId" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/edit-educational-offer/:offerId" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateEducationalOffer /></ProtectedRoute></AppWithLayout>} />        
        {/* Home/Login */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />

        {/* 404 único — todas las páginas redirigen aquí cuando algo no
            existe, y cualquier URL sin ruta cae en el comodín. */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </Router>
    </AuthContextProvider>
  );
}

export default App;
