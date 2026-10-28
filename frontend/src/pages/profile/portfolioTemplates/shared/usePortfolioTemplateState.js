// portfolioTemplates/shared/usePortfolioTemplateState.js
// Estado y comportamiento comunes a las plantillas con arquitectura de
// páginas propias (hoy DaisyFilm y JuneStamp) — routing por `section`,
// proyecto individual en /:username/project/:slug, páginas organizadas en
// /:username/:pageSlug, edición de "about" sin salir del portfolio, y
// guardar/reportar/eliminar un proyecto. Antes vivía duplicado casi 1:1 en
// DaisyFilmTemplate.jsx y JuneStampTemplate.jsx — ambas plantillas pintan
// los mismos datos de dos formas distintas, así que la lógica solo hace
// falta una vez; cada Template.jsx se limita a llamar a este hook y pintar
// su propia maqueta. Ver docs/arquitectura-plantillas-junestamp-daisyfilm.md.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../../services/api";
import { formatUserLocation, userLocationList } from "../../../../utils/locations";
import { getPostSlug, findPostBySlug, getPagedPostIds } from "../../../../utils/postSlug";

// viewMode devuelto: "portfolio" | "about" | "contact" — nombre canónico
// único para las dos plantillas (antes DaisyFilm usaba internamente
// "individual" para el mismo concepto).
export default function usePortfolioTemplateState({
  profile,
  username,
  section,
  userPosts = [],
  portfolioPages = [],
  isOwner,
  isLoggedIn,
  isCompany,
  isEducationalInstitution,
  onProjectsChanged = () => {},
  isPreview = false,
}) {
  const { t } = useTranslation(["profile", "post"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug, pageSlug } = useParams();

  // isPreview: el iframe de ProfileAppearanceTab.jsx (/myprofile/edit/templates)
  // codifica la plantilla que se está probando en la query string
  // (?preview=1&layout=...). Sin arrastrarla, navegar entre
  // Portfolio/About/Contact/Proyecto DENTRO del propio preview aterriza en
  // una URL sin preview=1 y el estado de preview se pierde a mitad de
  // camino. Fuera del preview esto no hace nada (isPreview es false).
  const withPreviewQuery = (path) => (isPreview && location.search ? `${path}${location.search}` : path);

  // `section` viene de la URL vía UserProfilePage — ver App.jsx. Es
  // undefined cuando se monta desde /:username/project/:slug o desde una
  // página organizada, casos en los que no hay que tocar la pestaña de
  // fondo. El lazy initializer cubre el primer render; el useEffect de abajo
  // cubre navegaciones posteriores (la plantilla no se remonta al cambiar
  // entre esas rutas, así que un valor inicial solo no basta).
  const [viewMode, setViewMode] = useState(() =>
    section === "about" || section === "contact" ? section : "portfolio"
  );

  useEffect(() => {
    if (section === "about" || section === "contact") setViewMode(section);
    else if (section === "portfolio") setViewMode("portfolio");
  }, [section]);

  const [openPost, setOpenPost] = useState(null);

  // ── Página /about (owner): editar info/CV/redes sin salir del portfolio ──
  const [showEditAbout, setShowEditAbout] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const displayProfile = editedProfile || profile;

  // ── Proyecto individual: editar (owner) / guardar + más (visitante) ──────
  const [editedPost, setEditedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProjectSaved, setIsProjectSaved] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const moreMenuRef = useRef(null);

  // Todos los posts-con-imagen del usuario, sin recortar por página — los
  // slugs de proyecto (utils/postSlug) siempre se calculan sobre esta misma
  // lista completa, para que un proyecto tenga el mismo link se abra desde
  // el portfolio completo o desde una página concreta.
  const allSlidePosts = userPosts.filter((p) => p.mainImage || (Array.isArray(p.images) && p.images[0]));

  // Hasta 6 fotos al azar publicadas por el usuario (mezcla de mainImage y
  // el resto de imágenes de cada post) para el carrusel de portada de
  // About/Contact. Se recalcula solo si cambian los posts, no en cada render.
  const heroImages = useMemo(() => {
    const mains = userPosts.map((p) => p.mainImage).filter(Boolean);
    const others = userPosts.flatMap((p) => (p.images || []).filter((img) => img && img !== p.mainImage));
    const shuffled = [...mains, ...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6);
  }, [userPosts]);

  // /:username/:pageSlug (página creada en /myprofile/projects) — misma
  // plantilla que el perfil, solo que el portfolio se recorta a esa página.
  const activePage = pageSlug
    ? (portfolioPages || []).find((p) => p.slug === pageSlug)
    : null;
  // Un proyecto ya organizado en una página no se repite en el Portfolio
  // general — solo vive en un sitio a la vez.
  const pagedPostIds = getPagedPostIds(portfolioPages);
  const scopedPosts = activePage
    ? userPosts.filter((p) => (activePage.posts || []).some((sp) => String(sp._id) === String(p._id)))
    : userPosts.filter((p) => !pagedPostIds.has(String(p._id)));

  // La URL manda: /:username/project/:projectSlug abre el proyecto como
  // página propia. Se resuelve contra allSlidePosts (no el recorte de
  // página) por la misma razón de arriba.
  useEffect(() => {
    setOpenPost(projectSlug ? findPostBySlug(projectSlug, allSlidePosts) : null);
    setEditedPost(null);
    setShowMoreMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug, userPosts]);

  // Al abrir/cambiar de proyecto, entrar a una página organizada o cambiar
  // de sección (Portfolio/CV/Contact), el stage pinta contenido nuevo que
  // normalmente arranca en otra altura que el anterior — sin esto la
  // navegación por SPA (navigate(), no un load real) dejaba la página en el
  // scroll donde estaba, como si el proyecto siguiente se abriera a mitad de
  // página. El scroller real no siempre es window: AppLayout mete todo
  // dentro de .dashboard-content (ver .dashboard-container/100vh en
  // control-panel.css), que en runtime a veces es el que scrollea de verdad
  // y no el documento — así que se resetean todos los candidatos posibles.
  // useLayoutEffect (no useEffect): corre antes del pintado del nuevo
  // contenido, así no se ve el salto.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelector(".dashboard-content")?.scrollTo(0, 0);
  }, [projectSlug, pageSlug, viewMode]);

  // Post a mostrar: la edición local (tras guardar en el modal) manda hasta
  // que userPosts se refresque desde el padre.
  const displayPost = editedPost && openPost && String(editedPost._id) === String(openPost._id)
    ? editedPost
    : openPost;

  // Estado "guardado" del proyecto — solo hace falta para visitantes viendo
  // un proyecto ajeno.
  useEffect(() => {
    if (!displayPost || isOwner || !isLoggedIn) { setIsProjectSaved(false); return; }
    let cancelled = false;
    api.get('/api/users/favorites').then((res) => {
      if (cancelled) return;
      const imageUrl = displayPost.mainImage || (displayPost.images || [])[0] || "";
      const isSaved = (res.data?.favorites || []).some(
        (fav) => String(fav.postId) === String(displayPost._id) &&
          (fav.mainImage || fav.savedImage) === imageUrl
      );
      setIsProjectSaved(isSaved);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [displayPost, isOwner, isLoggedIn]);

  // Cerrar el menú "más" al hacer clic fuera o pulsar Escape.
  useEffect(() => {
    if (!showMoreMenu) return;
    const onClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    const onKeyDown = (e) => { if (e.key === "Escape") setShowMoreMenu(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showMoreMenu]);

  const toggleSaveProject = async () => {
    if (!displayPost) return;
    const imageUrl = displayPost.mainImage || (displayPost.images || [])[0] || "";
    if (!imageUrl) return;
    try {
      if (!isProjectSaved) {
        await api.post(`/api/users/favorites/${displayPost._id}`, { imageUrl });
        setIsProjectSaved(true);
      } else {
        await api.delete(`/api/users/favorites/${displayPost._id}`, { data: { imageUrl } });
        setIsProjectSaved(false);
      }
    } catch (e) {}
  };

  const handleCopyLink = async () => {
    setShowMoreMenu(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const handleDownloadProject = () => {
    setShowMoreMenu(false);
    const imageUrl = displayPost?.mainImage || (displayPost?.images || [])[0];
    if (imageUrl) window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  const openReportModal = () => {
    setShowMoreMenu(false);
    setReportReason("");
    setReportSent(false);
    setShowReportModal(true);
  };
  const closeReportModal = () => setShowReportModal(false);

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !displayPost) return;
    setReportSubmitting(true);
    try {
      await api.post('/api/reports', {
        postId: displayPost._id,
        postImage: displayPost.mainImage || (displayPost.images || [])[0] || '',
        reason: reportReason.trim(),
      });
      setReportSent(true);
    } catch (e) {
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!displayPost) return;
    setDeletingProject(true);
    try {
      await api.delete(`/api/posts/${displayPost._id}`);
      setShowDeleteProjectModal(false);
      onProjectsChanged();
      navigate(withPreviewQuery(`/${username}`));
    } catch (e) {
    } finally {
      setDeletingProject(false);
    }
  };

  // Cambiar de sección navega a su URL propia (/:username, /:username/about,
  // /:username/contact) — el useEffect de arriba sincroniza `viewMode`
  // cuando la prop `section` llegue actualizada. Desde dentro de un proyecto
  // o una página organizada siempre se navega directo (sin toggle) a la
  // sección pedida; en la navegación normal se conserva el toggle: pulsar la
  // pestaña ya activa vuelve a Portfolio.
  const setMode = (mode) => {
    const next = (openPost || activePage) ? mode : (viewMode === mode ? "portfolio" : mode);
    navigate(withPreviewQuery(next === "portfolio" ? `/${username}` : `/${username}/${next}`));
  };

  const openProject = (post) => {
    navigate(withPreviewQuery(`/${username}/project/${getPostSlug(post, allSlidePosts)}`));
  };

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);
  const onPostSaved = (updatedPost) => {
    setShowEditModal(false);
    if (updatedPost === null) { navigate(withPreviewQuery(`/${username}`)); return; }
    setEditedPost(updatedPost);
  };

  // Editor de proyecto del panel (ProjectEditor variant="modal", el mismo que
  // abre "Tus proyectos"): guardar no cierra el modal (igual que en el panel,
  // muestra su propio aviso), solo refresca el proyecto que se ve detrás;
  // borrar cierra y vuelve al portfolio.
  const onEditorSaved = (updatedPost) => {
    if (updatedPost) setEditedPost(updatedPost);
    onProjectsChanged();
  };
  const onEditorDeleted = () => {
    setShowEditModal(false);
    onProjectsChanged();
    navigate(withPreviewQuery(`/${username}`));
  };

  // ── Datos del perfil ─────────────────────────────────────────────────────
  const displayName = isCompany || isEducationalInstitution
    ? displayProfile?.companyName || ""
    : displayProfile?.firstName && displayProfile?.lastName
      ? `${displayProfile.firstName} ${displayProfile.lastName}`
      : displayProfile?.fullName || "";

  const profileImage =
    displayProfile?.profile?.profilePicture || displayProfile?.profilePicture || "/multimedia/usuarioDefault.jpg";

  const locationExtra = {
    city2: displayProfile?.city2,
    country2: displayProfile?.country2,
    city3: displayProfile?.city3,
    country3: displayProfile?.country3,
  };
  const profileLocation = formatUserLocation(displayProfile?.city, displayProfile?.country, t, locationExtra);
  // Las mismas ubicaciones como lista, para plantillas que las separan con
  // espacio en vez de " · " (June Stamp, Sidebar.jsx).
  const profileLocations = userLocationList(displayProfile?.city, displayProfile?.country, t, locationExtra);

  // CV
  const experience = (displayProfile?.professionalFormation || []).filter((e) => !e.isDraft);
  const education = (displayProfile?.education || []).filter((e) => !e.isDraft);
  const skills = displayProfile?.skills || [];
  const software = displayProfile?.software || [];
  const languages = displayProfile?.languages || [];
  const awards = (displayProfile?.awards || []).filter((a) => !a.isDraft);
  const press = (displayProfile?.pressPublications || []).filter((p) => !p.isDraft);
  const hasCv = !!(experience.length || education.length || skills.length ||
                    software.length || languages.length || awards.length || press.length);

  // Imágenes del proyecto abierto (deduplicadas)
  const projectImages = displayPost
    ? [...new Set([displayPost.mainImage, ...(displayPost.images || [])].filter(Boolean))]
    : [];

  return {
    // navegación / ruteo
    navigate,
    withPreviewQuery,
    projectSlug,
    pageSlug,
    viewMode,
    setMode,
    openProject,

    // proyecto abierto
    openPost,
    editedPost,
    setEditedPost,
    displayPost,
    projectImages,
    showEditModal,
    openEditModal,
    closeEditModal,
    onPostSaved,
    onEditorSaved,
    onEditorDeleted,
    isProjectSaved,
    toggleSaveProject,
    showMoreMenu,
    setShowMoreMenu,
    moreMenuRef,
    showReportModal,
    openReportModal,
    closeReportModal,
    reportReason,
    setReportReason,
    reportSubmitting,
    reportSent,
    handleSubmitReport,
    handleCopyLink,
    handleDownloadProject,
    showDeleteProjectModal,
    setShowDeleteProjectModal,
    deletingProject,
    handleDeleteProject,

    // about / edición de perfil
    showEditAbout,
    setShowEditAbout,
    editedProfile,
    setEditedProfile,
    displayProfile,

    // datos derivados
    allSlidePosts,
    heroImages,
    activePage,
    scopedPosts,
    displayName,
    profileImage,
    location: profileLocation,
    locations: profileLocations,
    experience,
    education,
    skills,
    software,
    languages,
    awards,
    press,
    hasCv,
  };
}
