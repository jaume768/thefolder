import React, { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clImg } from "../../utils/optimizeImage";

import ClassicTemplate from "./portfolioTemplates/Classic/ClassicTemplate";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import { useAuth } from "../../hooks/useAuth";


const MiPerfil = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("profile");

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [userPosts, setUserPosts] = useState([]);
  const [portfolioPages, setPortfolioPages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fallbackHeaderImage, setFallbackHeaderImage] = useState(null);

  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);
  const [companyOffers, setCompanyOffers] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const headerImageToShow = clImg.cover(
    // Mobile sin portada propia → la de desktop (antes saltaba a la de
    // reserva); el encuadre de mobile se le aplica igual.
    (isMobile
      ? (profile?.featuredHeaderImageMobile || profile?.featuredHeaderImageDesktop)
      : profile?.featuredHeaderImageDesktop) ||
    profile?.featuredHeaderImage ||
    fallbackHeaderImage ||
    null
  );


  // ✅ ocultar dashboard header global (como el externo) — useLayoutEffect
  // (no useEffect): síncrono, antes del pintado, para que coincida con
  // PanelSidebar (que también usa useLayoutEffect para esta misma clase) y
  // no haya un hueco entre frames donde el dashboard-header global se vea
  // duplicado encima al navegar desde el panel persistente hasta aquí.
  useLayoutEffect(() => {
    document.body.classList.add("hide-dashboard-header");
    return () => document.body.classList.remove("hide-dashboard-header");
  }, []);

  // ✅ cargar mi perfil (auth)
  useEffect(() => {
    const fetchMeAndPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/", { state: { showRegister: true } });
          return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const meRes = await api.get('/api/users/profile');

        const me = meRes.data?.user || meRes.data;
        setProfile(me);

        // tipo usuario
        const userIsCompany = me.professionalType === 1 || me.professionalType === 2 || me.professionalType === 3;
        const userIsEducational = me.professionalType === 4;
        setIsCompany(userIsCompany);
        setIsEducationalInstitution(userIsEducational);

        // posts por username
        const username = me.username;
        setPostsLoading(true);
        const postsRes = await axios.get(`${backendUrl}/api/posts/user/${username}`);
        setUserPosts(postsRes.data?.posts || []);
        setPostsLoading(false);

        try {
          const pagesRes = await axios.get(`${backendUrl}/api/sections/user/${username}`);
          setPortfolioPages(pagesRes.data?.sections || []);
        } catch (pagesError) {
          setPortfolioPages([]);
        }

        setLoading(false);
      } catch (e) {
        setError(t("error"));
        setLoading(false);
        setPostsLoading(false);
      }
    };

    fetchMeAndPosts();
  }, [navigate]);

  // Refresco silencioso (sin loading global) tras cerrar el overlay
  // "organizar proyectos" del quick action — mismo patrón que
  // UserProfilePage.jsx: ese overlay tiene su propio fetch/estado, así que
  // reorder/mover/borrar ahí no toca userPosts/portfolioPages hasta este
  // refetch puntual al cerrar.
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  useEffect(() => {
    if (projectsRefreshKey === 0 || !profile?.username) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    (async () => {
      try {
        const postsRes = await axios.get(`${backendUrl}/api/posts/user/${profile.username}`);
        setUserPosts(postsRes.data?.posts || []);
      } catch (e) {}
      try {
        const pagesRes = await axios.get(`${backendUrl}/api/sections/user/${profile.username}`);
        setPortfolioPages(pagesRes.data?.sections || []);
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRefreshKey]);

  // ✅ fallback header image (si no hay featuredHeaderImage)
  useEffect(() => {
    if (!profile) return;
    if (profile.featuredHeaderImage) return;
    if (!Array.isArray(userPosts) || userPosts.length === 0) return;

    const valid = userPosts.filter(
      (p) => p && typeof p.mainImage === "string" && p.mainImage.trim() !== ""
    );
    if (valid.length === 0) return;

    const randomIndex = Math.floor(Math.random() * valid.length);
    setFallbackHeaderImage(valid[randomIndex].mainImage);
  }, [profile, userPosts]);

  // ✅ ofertas si es empresa / institución (igual lógica que externo)
  useEffect(() => {
    const fetchOffers = async () => {
      if (!profile) return;
      if (!isCompany && !isEducationalInstitution) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        let endpoint = `${backendUrl}/api/offers/user/${profile.username}`;
        if (isEducationalInstitution) {
          endpoint = `${backendUrl}/api/offers/educational/user-external/${profile.username}`;
        }
        const res = await axios.get(endpoint);
        setCompanyOffers(res.data?.offers || []);
      } catch (e) {
        setCompanyOffers([]);
      }
    };

    fetchOffers();
  }, [profile, isCompany, isEducationalInstitution]);



  const location = useLocation();
  // Anterior dentro de THEFOLDER; en la primera página de la visita
  // (location.key "default") no hay anterior propio: explorador.
  const handleBack = () => {
    if (location.key && location.key !== "default") navigate(-1);
    else navigate("/explorer");
  };

  const profileImage =
    profile?.profile?.profilePicture ||
    profile?.profilePicture ||
    "/multimedia/usuarioDefault.jpg";

  if (loading) return <PageSkeleton variant="portfolio" />;

  // Sesión caducada: SessionExpiredGate (App.jsx) ya está mandando a /login;
  // no pintamos el 404 mientras tanto.
  if (error && !isAuthenticated) return <PageSkeleton variant="portfolio" />;

  if (error) {
    return <Navigate to="/404" replace />;
  }

  const coverTemplateToShow =
  (isMobile ? profile?.coverTemplateMobile : profile?.coverTemplateDesktop) || "fullscreen";

  const getHeaderGradient = (seed) => {
    // hash simple
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

    const hue1 = h % 360;
    const hue2 = (hue1 + 40 + (h % 60)) % 360;

    return `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 80% 45%))`;
  };

  return (
    <ClassicTemplate
      mode="self"
      profile={profile}
      profileImage={profileImage}
      username={profile?.username}
      userPosts={userPosts}
      postsLoading={postsLoading}
      portfolioPages={portfolioPages}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isOwner={true}
      isLoggedIn={true}
      isCompany={isCompany}
      isEducationalInstitution={isEducationalInstitution}
      isMobile={isMobile}
      companyOffers={companyOffers}
      coverTemplateToShow={coverTemplateToShow}
      headerImageToShow={headerImageToShow}
      getHeaderGradient={getHeaderGradient}
      handleBack={handleBack}
      onProjectsChanged={() => setProjectsRefreshKey((k) => k + 1)}
    />
  );
};

export default MiPerfil;
