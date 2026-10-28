// UserProfile.jsx
import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import axios from "axios";
import api from "../../services/api";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams, useLocation, Navigate } from "react-router-dom";
import JuneStampTemplate from "./portfolioTemplates/JuneStamp/JuneStampTemplate";
import RebecasGalleryTemplate from "./portfolioTemplates/RebecasGallery/RebecasGalleryTemplate";
import DaisyFilmTemplate from "./portfolioTemplates/DaisyFilm/DaisyFilmTemplate";
import ClassicTemplate from "./portfolioTemplates/Classic/ClassicTemplate";
import { AuthContext } from "../../contexts/AuthContext";
import { useCreatePost } from "../../contexts/CreatePostContext";
import { Helmet } from "react-helmet-async";
import { clImg } from "../../utils/optimizeImage";
import { buildSocialMediaUrl } from "../../utils/socialMediaUtils";
import { readPreviewParams } from "../../utils/previewSession";
import { resolveProfileLayout } from "../../utils/profileLayout";
import PageSkeleton from "../../components/skeleton/PageSkeleton";

// `section` viene de la ruta (App.jsx: /:username, /:username/about,
// /:username/contact) — contrato de URL estable entre plantillas. Cada
// PortfolioTemplate recibe el mismo prop y decide si lo usa; así la URL no
// depende de qué diseño esté activo ni cambia si se rediseña la plantilla.
const UserProfile = ({ section }) => {
  const { t } = useTranslation("profile");

  const isLoggedIn = !!localStorage.getItem("authToken");

  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCreatives = !!location.state?.fromCreatives;
  const [searchParams] = useSearchParams();
  const layoutParam = searchParams.get("layout");

  // Preview en vivo desde ProfileAppearanceTab.jsx (iframe con ?preview=1):
  // los overrides de query string pisan lo persistido en `profile` para que
  // el iframe refleje selecciones sin guardar todavía — nunca esperan al
  // autosave debounced de 900ms del editor. Solo activos con preview=1 (no
  // pisan valores reales en un link normal sin ese flag). readPreviewParams
  // (utils/previewSession.js) trae también la red de seguridad: si alguna
  // navegación dentro del preview pierde el query string, sigue sabiendo
  // que estamos en preview y con qué plantilla — ver ese archivo.
  const { isPreview, previewOverride } = readPreviewParams(searchParams, username);

  const { user: currentUser } = useContext(AuthContext);
  const { openCreatePost } = useCreatePost();
  const isOwner = !!currentUser && currentUser.username === username;

  const [profile, setProfile] = useState(null);

  // Rol
  const [roleLabelById, setRoleLabelById] = useState({});

  // follow / notif
  const [isFollowing, setIsFollowing] = useState(false);
  const [isNotificationActive, setIsNotificationActive] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // tabs + data
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [portfolioPages, setPortfolioPages] = useState([]);

  // layout + hero
  const [fallbackHeaderImage, setFallbackHeaderImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // state general
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // notification toast
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // tipo usuario + ofertas
  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);
  const [companyOffers, setCompanyOffers] = useState([]);

  // responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Ocultar el dashboard-header global mientras se muestra el ext-profile-header propio.
  // useLayoutEffect (no useEffect): tiene que ser síncrono, antes del pintado —
  // PanelSidebar (panel persistente) también usa useLayoutEffect para esta misma
  // clase, y si esta página la añadiera un tick más tarde (useEffect corre después
  // del paint) se ve un parpadeo con el dashboard-header global duplicado encima
  // durante ese hueco al navegar desde el panel hacia aquí.
  useLayoutEffect(() => {
    document.body.classList.add("hide-dashboard-header");
    return () => {
      document.body.classList.remove("hide-dashboard-header");
    };
  }, []);

  const profileImage =
    profile?.profile?.profilePicture || profile?.profilePicture || "/multimedia/usuarioDefault.jpg";

  const headerImageToShow = clImg.cover(
    // Mobile sin portada propia → la de desktop (antes saltaba a la de
    // reserva); el encuadre de mobile se le aplica igual.
    (isMobile
      ? (profile?.featuredHeaderImageMobile || profile?.featuredHeaderImageDesktop)
      : profile?.featuredHeaderImageDesktop) ||
    profile?.featuredHeaderImage ||
    fallbackHeaderImage ||
    profile?.profile?.profilePicture ||
    null
  );

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  // Anterior dentro de THEFOLDER, o el explorador si esta es la primera
  // página de la visita (location.key "default"; ver QuickActions.jsx).
  const handleBack = () => {
    if (location.key && location.key !== "default") navigate(-1);
    else navigate("/explorer");
  };

  const getHeaderGradient = (seed = "") => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const hue1 = h % 360;
    const hue2 = (hue1 + 40 + (h % 60)) % 360;
    return `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 80% 45%))`;
  };
  

  // carga perfil + posts (sin hoisting issues)
  useEffect(() => {
    // Reset al cambiar de usuario para evitar que datos del perfil anterior
    // (especialmente fallbackHeaderImage) se muestren en el nuevo perfil.
    setProfile(null);
    setUserPosts([]);
    setPortfolioPages([]);
    setFallbackHeaderImage(null);

    // Fire-and-forget analytics ping — no await, no error handling.
    // Se salta en preview=1: el iframe de ProfileAppearanceTab.jsx recarga
    // en cada selección, y son siempre auto-visitas del propio dueño del
    // perfil, no visitas reales. También se salta si isOwner: el dueño
    // viendo su propio perfil público (para revisar cómo queda, compartir
    // el link, etc.) tampoco es una visita real — sin esto inflaba las
    // "visitas este mes" de HomeTab.jsx cada vez que el dueño entraba a su
    // propio perfil.
    if (!isPreview && !isOwner) {
      const _api = import.meta.env.VITE_BACKEND_URL;
      fetch(`${_api}/api/analytics/profile-view/${username}`, { method: 'POST' });
    }

    const fetchUserProfileAndPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = localStorage.getItem("authToken");

        // 1) perfil público
        const res = await axios.get(`${backendUrl}/api/users/profile/${username}`);
        const user = res.data;
        setProfile(user);

        // tipo usuario
        const userIsCompany = user.professionalType === 1 || user.professionalType === 2 || user.professionalType === 3;
        const userIsEducationalInstitution = user.professionalType === 4;
        setIsCompany(userIsCompany);
        setIsEducationalInstitution(userIsEducationalInstitution);

        // 2) posts
        setPostsLoading(true);
        const postsRes = await axios.get(`${backendUrl}/api/posts/user/${username}`);
        setUserPosts(postsRes.data?.posts || []);
        setPostsLoading(false);

        // 2b) páginas del portfolio (creadas en /myprofile/projects)
        try {
          const pagesRes = await axios.get(`${backendUrl}/api/sections/user/${username}`);
          setPortfolioPages(pagesRes.data?.sections || []);
        } catch (pagesError) {
          setPortfolioPages([]);
        }

        // 3) info extra si hay token (follow + notifs)
        if (token) {
          try {
            const currentUser = await api.get('/api/users/profile');

            const current = currentUser.data?.user || currentUser.data;
            const isFollowingUser = Array.isArray(current?.following) && current.following.includes(user._id);
            setIsFollowing(!!isFollowingUser);

            if (isFollowingUser && Array.isArray(current?.notifications)) {
              const notificationActive = current.notifications.some(
                (notif) => notif.userId === user._id && notif.active
              );
              setIsNotificationActive(!!notificationActive);
            } else {
              setIsNotificationActive(false);
            }
          } catch (authError) {
            // no crítico
          }
        }

        setLoading(false);
      } catch (e) {
        setError(
          t("notifications.profileLoadError")
        );
        setLoading(false);
        setPostsLoading(false);
      }
    };

    fetchUserProfileAndPosts();
  }, [username]);

  // Refresco silencioso de posts + páginas (sin loading global) tras cerrar
  // el overlay "organizar proyectos" del quick action de DaisyFilm — ese
  // overlay tiene su propio fetch/estado (ProjectsOrganizerPanel), así que
  // reorder/mover/borrar ahí no toca userPosts/portfolioPages hasta que se
  // cierra y se dispara este refetch puntual.
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  useEffect(() => {
    if (projectsRefreshKey === 0) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    (async () => {
      try {
        const postsRes = await axios.get(`${backendUrl}/api/posts/user/${username}`);
        setUserPosts(postsRes.data?.posts || []);
      } catch (e) {}
      try {
        const pagesRes = await axios.get(`${backendUrl}/api/sections/user/${username}`);
        setPortfolioPages(pagesRes.data?.sections || []);
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRefreshKey]);

  //Rol
  useEffect(() => {
    const fetchRoleLabels = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/tags?type=role&status=active`);
        const tags = res.data?.tags || [];

        const map = {};
        for (const t of tags) map[t.id] = t.label;

        setRoleLabelById(map);
      } catch (e) {
        setRoleLabelById({});
      }
    };

    fetchRoleLabels();
  }, []);

  // fallback header image (si no hay featuredHeaderImage)
  useEffect(() => {
    if (!profile) {
      setFallbackHeaderImage(null);
      return;
    }
    if (
      profile.featuredHeaderImage ||
      profile.featuredHeaderImageDesktop ||
      profile.featuredHeaderImageMobile
    ) {
      setFallbackHeaderImage(null);
      return;
    }

    const validPosts = (Array.isArray(userPosts) ? userPosts : []).filter(
      (p) => p && typeof p.mainImage === "string" && p.mainImage.trim() !== ""
    );
    if (validPosts.length === 0) {
      setFallbackHeaderImage(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * validPosts.length);
    setFallbackHeaderImage(validPosts[randomIndex].mainImage);
  }, [profile, userPosts]);

  // ofertas (UN SOLO flujo)
  useEffect(() => {
    const fetchOffers = async () => {
      if (!profile) return;
      if (!isCompany && !isEducationalInstitution) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        let endpoint = `${backendUrl}/api/offers/user/${username}`;
        if (isEducationalInstitution) {
          endpoint = `${backendUrl}/api/offers/educational/user-external/${username}`;
        }

        const res = await axios.get(endpoint);
        setCompanyOffers(res.data?.offers || []);
      } catch (e) {
        setCompanyOffers([]);
      }
    };

    fetchOffers();
  }, [profile, isCompany, isEducationalInstitution, username]);

  // follow/unfollow
  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await api.post(`/api/users/follow/${profile._id}`, {});

      setIsFollowing(true);
      setIsNotificationActive(true);
      showNotification("success", t("notifications.nowFollowing"));
    } catch (e) {
      let errorMessage = t("notifications.genericError");
      if (e.response) {
        if (e.response.status === 401) {
          errorMessage = t("notifications.loginRequired");
          navigate("/login");
        } else if (e.response.status === 404) {
          errorMessage = t("notifications.userNotFound");
        } else if (e.response.status === 400) {
          errorMessage = e.response.data?.error || errorMessage;
        }
      } else if (e.request) {
        errorMessage = t("notifications.connectionError");
      }

      showNotification("error", errorMessage);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setFollowLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await api.delete(`/api/users/follow/${profile._id}`);

      setIsFollowing(false);
      setIsNotificationActive(false);
      showNotification("success", t("notifications.unfollowed"));
    } catch (e) {
      let errorMessage = t("notifications.genericError");
      if (e.response) {
        if (e.response.status === 401) {
          errorMessage = t("notifications.loginRequired");
          navigate("/login");
        } else if (e.response.status === 404) {
          errorMessage = t("notifications.userNotFound");
        } else if (e.response.status === 400) {
          errorMessage = e.response.data?.error || errorMessage;
        }
      } else if (e.request) {
        errorMessage = t("notifications.connectionError");
      }

      showNotification("error", errorMessage);
    } finally {
      setFollowLoading(false);
    }
  };

  const toggleNotification = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      if (isNotificationActive) {
        await api.post(`/api/users/notifications/deactivate/${profile._id}`, {});
      } else {
        await api.post(`/api/users/notifications/activate/${profile._id}`, {});
      }

      setIsNotificationActive((prev) => !prev);
    } catch (e) {
    }
  };

  // ── SEO ──────────────────────────────────────────────────────────────────
  const SITE_URL = 'https://thefolder.es';
  const seoName = profile?.fullName || username;
  const seoSpecialty = roleLabelById[profile?.professionalTags?.[0]] || '';
  const seoTitle = seoSpecialty
    ? `${seoName} · ${seoSpecialty} | THEFOLDER`
    : `${seoName} | THEFOLDER`;
  const rawBio = profile?.biography
    ? profile.biography.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';
  const seoBio = rawBio
    ? (rawBio.length > 157 ? rawBio.slice(0, 157).trimEnd() + '…' : rawBio)
    : `Descubre el perfil de @${username} en THEFOLDER, el directorio de creativos de moda.`;
  const seoImage = profileImage && profileImage !== '/multimedia/usuarioDefault.jpg'
    ? profileImage
    : `${SITE_URL}/og-thefolder.jpg`;
  const seoUrl = `${SITE_URL}/${username}`;
  const sameAs = profile?.social
    ? Object.entries({
        instagram: profile.social.instagram,
        linkedin: profile.social.linkedin,
        behance: profile.social.behance,
        tiktok: profile.social.tiktok,
        youtube: profile.social.youtube,
        pinterest: profile.social.pinterest,
        sitioweb: profile.social.sitioWeb,
      })
        .filter(([, v]) => v?.trim())
        .map(([platform, v]) => buildSocialMediaUrl(platform, v))
        .filter(Boolean)
    : [];
  const jsonLd = profile ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: seoName,
    ...(seoSpecialty && { jobTitle: seoSpecialty }),
    image: seoImage,
    url: seoUrl,
    ...(sameAs.length && { sameAs }),
  }) : null;

  const seoHelmet = (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoBio} />
      <link rel="canonical" href={seoUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoBio} />
      <meta property="og:image" content={seoImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoBio} />
      <meta name="twitter:image" content={seoImage} />
      {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
    </Helmet>
  );

  if (loading) return <PageSkeleton variant="portfolio" />;

  if (error) {
    return <Navigate to="/404" replace />;
  }

  // Layout efectivo: el override de ?layout= (preview=1) pisa profile.profileLayout —
  // ver previewOverride arriba. layoutParam ("studio"/"daisy"/"index", el escape
  // hatch de preview que ya existía) sigue funcionando igual, independiente de preview=1.
  // Plantillas retiradas (Rebeca's Gallery, Daisy Film) se ven como June
  // Stamp: ver utils/profileLayout.js. El ?layout= de preview no se toca.
  const effectiveLayout = previewOverride("layout", resolveProfileLayout(profile?.profileLayout));

  // ── Layout alternativo: Rebeca's Gallery (antes "Studio Gallery") — misma
  // arquitectura de páginas propias que Daisy Film/June Stamp (routing por
  // `section`, no el `activeTab` local de Classic), ver
  // docs/arquitectura-plantillas-junestamp-daisyfilm.md.
  if (effectiveLayout === "studio-gallery" || layoutParam === "studio") {
    return (
      <>
        {seoHelmet}
        <RebecasGalleryTemplate
        profile={profile}
        username={username}
        section={section}
        userPosts={userPosts}
        postsLoading={postsLoading}
        portfolioPages={portfolioPages}
        onProjectsChanged={() => setProjectsRefreshKey((k) => k + 1)}
        isPreview={isPreview}
        isOwner={isOwner}
        isLoggedIn={isLoggedIn}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
      />
      </>
    );
  }

  // ── Layout alternativo: Daisy Film (fullscreen carousel)
  if (effectiveLayout === "daisy-film" || layoutParam === "daisy") {
    return (
      <>
        {seoHelmet}
        <DaisyFilmTemplate
        profile={profile}
        username={username}
        section={section}
        userPosts={userPosts}
        postsLoading={postsLoading}
        portfolioPages={portfolioPages}
        onProjectsChanged={() => setProjectsRefreshKey((k) => k + 1)}
        isPreview={isPreview}
        isOwner={isOwner}
        isLoggedIn={isLoggedIn}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
      />
      </>
    );
  }

  // ── Layout alternativo: June Stamp (por profileLayout del usuario, id
  // persistido "index-gallery" — antes "Editorial Index" — o ?layout=index
  // para preview; ninguno de los dos se renombró, ver memoria del proyecto)
  if (effectiveLayout === "index-gallery" || layoutParam === "index") {
    return (
      <>
        {seoHelmet}
        <JuneStampTemplate
        profile={profile}
        username={username}
        section={section}
        userPosts={userPosts}
        postsLoading={postsLoading}
        portfolioPages={portfolioPages}
        galleryDisplayMode={previewOverride("galleryMode", profile?.juneStampGalleryMode) || "projects"}
        onProjectsChanged={() => setProjectsRefreshKey((k) => k + 1)}
        isPreview={isPreview}
        isOwner={isOwner}
        isLoggedIn={isLoggedIn}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
      />
      </>
    );
  }

  const coverTemplateToShow = isMobile
    ? previewOverride("coverMobile", profile?.coverTemplateMobile) || "fullscreen"
    : previewOverride("coverDesktop", profile?.coverTemplateDesktop) || "fullscreen";

  // Encuadre de la portada: en el preview de /myprofile/edit/templates llega
  // por ?focusDesktop / ?focusMobile ("x,y") antes de que se guarde; fuera,
  // el guardado en el perfil.
  const focusParam = previewOverride(isMobile ? "focusMobile" : "focusDesktop", null);
  const [focusX, focusY] = String(focusParam || "").split(",").map(Number);
  const heroFocus = focusParam && Number.isFinite(focusX) && Number.isFinite(focusY)
    ? { x: focusX, y: focusY }
    : (isMobile ? profile?.featuredHeaderFocusMobile : profile?.featuredHeaderFocusDesktop);

    const DARK_HERO_TEMPLATES = ["fullscreen", "fullscreen-alt", "split-top"];
    const headerIsDark = DARK_HERO_TEMPLATES.includes(coverTemplateToShow);

  return (
    <ClassicTemplate
      mode="public"
      profile={profile}
      profileImage={profileImage}
      username={username}
      userPosts={userPosts}
      postsLoading={postsLoading}
      portfolioPages={portfolioPages}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isOwner={isOwner}
      isFollowing={isFollowing}
      followLoading={followLoading}
      handleFollow={handleFollow}
      handleUnfollow={handleUnfollow}
      isLoggedIn={isLoggedIn}
      isCompany={isCompany}
      isEducationalInstitution={isEducationalInstitution}
      isMobile={isMobile}
      roleLabelById={roleLabelById}
      companyOffers={companyOffers}
      openCreatePost={openCreatePost}
      coverTemplateToShow={coverTemplateToShow}
      headerImageToShow={headerImageToShow}
      heroFocus={heroFocus}
      getHeaderGradient={getHeaderGradient}
      headerIsDark={headerIsDark}
      isPreview={isPreview}
      handleBack={handleBack}
      notification={notification}
      showNotification={showNotification}
      fromCreatives={fromCreatives}
      onPostClick={(postId) => navigate(`/post/${postId}`, { state: { fromCreatives: true } })}
      galleryStyle={previewOverride("gallery", profile?.galleryStyle) || "gap"}
      seoHelmet={seoHelmet}
      onProjectsChanged={() => setProjectsRefreshKey((k) => k + 1)}
    />
  );
};

export default UserProfile;

