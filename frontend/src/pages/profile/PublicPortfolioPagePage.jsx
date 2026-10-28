// pages/profile/PublicPortfolioPagePage.jsx
// Vista pública de 1 "página" del portfolio de un usuario — creada en
// /myprofile/projects, visible en thefolder.es/:username/:pageSlug.
//
// Si la plantilla del usuario es DaisyFilm o June Stamp (ambas con
// arquitectura de páginas propias), delega en su Template con los mismos
// datos que usa /:username (perfil + todos los posts + lista de páginas) —
// el Template recorta la galería a la página activa leyendo :pageSlug con
// su propio useParams(), así se ve exactamente igual que el portfolio
// principal (misma navegación, mismo diseño), en vez de la página genérica
// de abajo. Para el resto de plantillas se mantiene el comportamiento
// original: solo título + grid de posts (UserGallery).
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useSearchParams, useLocation, Link, Navigate } from "react-router-dom";
import { readPreviewParams } from "../../utils/previewSession";
import { resolveProfileLayout } from "../../utils/profileLayout";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import api from "../../services/api";
import UserGallery from "../../components/controlPanel/userProfile/UserGallery";
import DaisyFilmTemplate from "./portfolioTemplates/DaisyFilm/DaisyFilmTemplate";
import JuneStampTemplate from "./portfolioTemplates/JuneStamp/JuneStampTemplate";
import { AuthContext } from "../../contexts/AuthContext";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import "../../components/controlPanel/css/UserProfileExtern.css";
import "./PublicPortfolioPagePage.css";

export default function PublicPortfolioPagePage() {
  const { t } = useTranslation("profile");
  const { username, pageSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isLoggedIn = !!localStorage.getItem("authToken");
  const { user: currentUser } = useContext(AuthContext);

  // Preview en vivo desde /myprofile/edit/templates (mismo mecanismo que
  // UserProfilePage.jsx, ver utils/previewSession.js) — sin esto, entrar a
  // una página organizada DENTRO del iframe de preview usaba el
  // profileLayout REAL guardado (no la plantilla que se está probando) y
  // montaba DaisyFilmTemplate sin isPreview, mostrando .df-quick-actions y
  // enlaces reales que no deberían verse ahí.
  const { isPreview, previewOverride } = readPreviewParams(searchParams, username);
  const previewLayoutParam = searchParams.get("layout");

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Solo se rellenan para las plantillas con arquitectura de páginas propias
  // (DaisyFilm/June Stamp, ver efecto abajo) — templatedLayout dice cuál.
  const [daisyProfile, setDaisyProfile] = useState(null);
  const [daisyPosts, setDaisyPosts] = useState([]);
  const [daisySections, setDaisySections] = useState([]);
  const [templatedLayout, setTemplatedLayout] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Igual que UserProfilePage/MiPerfilPage: esta página tiene su propia
  // cabecera (ppp-header o, en DaisyFilm, df-top), así que oculta la barra
  // de navegación global del dashboard mientras está montada.
  useLayoutEffect(() => {
    document.body.classList.add("hide-dashboard-header");
    return () => document.body.classList.remove("hide-dashboard-header");
  }, []);

  useEffect(() => {
    setPage(null);
    setDaisyProfile(null);
    setDaisyPosts([]);
    setDaisySections([]);
    setTemplatedLayout(null);
    setError(false);
    const load = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const profileRes = await axios.get(`${backendUrl}/api/users/profile/${username}`);
        const profileData = profileRes.data;
        const effectiveLayout = previewOverride("layout", resolveProfileLayout(profileData?.profileLayout));

        if (effectiveLayout === "daisy-film" || effectiveLayout === "index-gallery") {
          const [postsRes, sectionsRes] = await Promise.all([
            axios.get(`${backendUrl}/api/posts/user/${username}`),
            axios.get(`${backendUrl}/api/sections/user/${username}`),
          ]);
          const sections = sectionsRes.data?.sections || [];
          const found = sections.find((s) => s.slug === pageSlug);
          if (!found) { setError(true); return; }

          setDaisyProfile(profileData);
          setDaisyPosts(postsRes.data?.posts || []);
          setDaisySections(sections);
          setTemplatedLayout(effectiveLayout);
          setPage(found);

          // Estado de "seguir" (igual que UserProfilePage) — solo hace
          // falta en estas ramas, la genérica no tiene ese botón.
          const token = localStorage.getItem("authToken");
          if (token) {
            try {
              const meRes = await api.get('/api/users/profile');
              const me = meRes.data?.user || meRes.data;
              setIsFollowing(Array.isArray(me?.following) && me.following.includes(profileData._id));
            } catch (followError) {
              // no crítico
            }
          }
        } else {
          const res = await axios.get(`${backendUrl}/api/sections/user/${username}/${pageSlug}`);
          setPage(res.data?.section || null);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    // previewLayoutParam (no previewOverride/isPreview, funciones/objetos
    // nuevos en cada render): re-ejecuta el fetch si cambia la plantilla
    // que se está probando sin salir de esta página organizada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, pageSlug, previewLayoutParam]);

  // Refresco silencioso tras cerrar el overlay "organizar proyectos" del
  // quick action de DaisyFilm (mismo patrón que UserProfilePage.jsx) — ese
  // overlay tiene su propio fetch/estado, así que reorder/mover/borrar ahí
  // no toca daisyPosts/daisySections hasta este refetch puntual al cerrar.
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  useEffect(() => {
    if (projectsRefreshKey === 0 || !daisyProfile) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    (async () => {
      try {
        const [postsRes, sectionsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/posts/user/${username}`),
          axios.get(`${backendUrl}/api/sections/user/${username}`),
        ]);
        const sections = sectionsRes.data?.sections || [];
        const found = sections.find((s) => s.slug === pageSlug);
        if (!found) { setError(true); return; }
        setDaisyPosts(postsRes.data?.posts || []);
        setDaisySections(sections);
        setPage(found);
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRefreshKey]);

  // Anterior dentro de THEFOLDER; en la primera página de la visita
  // (location.key "default"), a la portada del portfolio.
  const handleBack = () => {
    if (location.key && location.key !== "default") navigate(-1);
    else navigate(`/${username}`);
  };

  const handleFollow = async () => {
    if (!daisyProfile) return;
    try {
      setFollowLoading(true);
      await api.post(`/api/users/follow/${daisyProfile._id}`, {});
      setIsFollowing(true);
    } catch (e) {
      // no crítico
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!daisyProfile) return;
    try {
      setFollowLoading(true);
      await api.delete(`/api/users/follow/${daisyProfile._id}`);
      setIsFollowing(false);
    } catch (e) {
      // no crítico
    } finally {
      setFollowLoading(false);
    }
  };

  if (daisyProfile) {
    const isCompany = daisyProfile.professionalType === 1 || daisyProfile.professionalType === 2 || daisyProfile.professionalType === 3;
    const isEducationalInstitution = daisyProfile.professionalType === 4;
    const TemplateComponent = templatedLayout === "index-gallery" ? JuneStampTemplate : DaisyFilmTemplate;
    return (
      <TemplateComponent
        profile={daisyProfile}
        username={username}
        userPosts={daisyPosts}
        postsLoading={false}
        portfolioPages={daisySections}
        onProjectsChanged={() => setProjectsRefreshKey((k) => k + 1)}
        isPreview={isPreview}
        isOwner={!!currentUser && currentUser.username === username}
        isLoggedIn={isLoggedIn}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
      />
    );
  }

  if (loading) return <PageSkeleton variant="portfolio" />;

  if (error || !page) {
    return <Navigate to="/404" replace />;
  }

  const seoTitle = `${page.name} · ${username} | THEFOLDER`;

  return (
    <div className="user-extern-container ppp-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="ppp-header">
        <button type="button" className="ppp-back" onClick={handleBack}>
          ← {t("portfolioPages.backToProfile")}
        </button>
        <h1 className="ppp-title">{page.name}</h1>
        <Link to={`/${username}`} className="ppp-username">@{username}</Link>
      </div>

      <UserGallery posts={page.posts || []} emptyMessage={t("portfolioPages.emptyPage")} />
    </div>
  );
}
