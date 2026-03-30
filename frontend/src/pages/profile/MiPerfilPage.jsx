import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../components/controlPanel/css/UserProfileExtern.css";
import "../../components/controlPanel/css/miPerfil.css";

import { FaTimes, FaCopy } from "react-icons/fa";

import ProfileHeroTemplates from "./heroTemplates/ProfileHeroTemplates";   

import ExternalProfileHeader from "../../components/controlPanel/userProfile/ExternalProfileHeader";
import UserBiographySection from "../../components/controlPanel/userProfile/UserBiographySection";
import UserProfessionalExperienceSection from "../../components/controlPanel/userProfile/UserProfessionalExperienceSection";
import UserSkillsSection from "../../components/controlPanel/userProfile/UserSkillsSection";
import UserSoftwareSection from "../../components/controlPanel/userProfile/UserSoftwareSection";
import UserEducationSection from "../../components/controlPanel/userProfile/UserEducationSection";
import UserSocialSection from "../../components/controlPanel/userProfile/UserSocialSection";
import UserDownloadableFilesSection from "../../components/controlPanel/userProfile/UserDownloadableFilesSection"; 
import UserCompanyTagsSection from "../../components/controlPanel/userProfile/UserCompanyTagsSection";
import UserMilestoneSection from "../../components/controlPanel/userProfile/UserMilestoneSection";
import UserCompanyOffersSection from "../../components/controlPanel/userProfile/UserCompanyOffersSection";
import UserEducationalOffersSection from "../../components/controlPanel/userProfile/UserEducationalOffersSection"; 
import ProfileStickyActions from "../../components/controlPanel/userProfile/ProfileStickyActions";
import UserLanguagesSection from "../../components/controlPanel/userProfile/UserLanguagesSection";
import UserGallery from "../../components/controlPanel/userProfile/UserGallery";

import chevronDown from "../../../public/iconos/chevrondown.svg";

const MiPerfil = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [userPosts, setUserPosts] = useState([]);
  const [isGalleryView] = useState(true);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fallbackHeaderImage, setFallbackHeaderImage] = useState(null);

  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);
  const [companyOffers, setCompanyOffers] = useState([]);

  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const headerImageToShow =
    (isMobile ? profile?.featuredHeaderImageMobile : profile?.featuredHeaderImageDesktop) ||
    profile?.featuredHeaderImage ||
    fallbackHeaderImage ||
    null;


  // ✅ ocultar dashboard header global (como el externo)
  useEffect(() => {
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

        const meRes = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

        setLoading(false);
      } catch (e) {
        setError("No se pudo cargar tu perfil.");
        setLoading(false);
        setPostsLoading(false);
      }
    };

    fetchMeAndPosts();
  }, [navigate]);

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



  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/explorer");
  };

  const profileImage =
    profile?.profile?.profilePicture ||
    profile?.profilePicture ||
    "/multimedia/usuarioDefault.jpg";

  if (loading) {
    return (
      <div className="user-extern-loading miPerfil-loading">
        <p className="loading-indicator">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-extern-error miPerfil-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/explorer")}>Volver al explorador</button>
      </div>
    );
  }

  const coverTemplateToShow =
  (isMobile ? profile?.coverTemplateMobile : profile?.coverTemplateDesktop) || "fullscreen";

  const heroName =
    isCompany || isEducationalInstitution
      ? profile?.companyName || "Mi empresa"
      : profile?.fullName || "Mi nombre";




  const getHeaderGradient = (seed) => {
    // hash simple
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

    const hue1 = h % 360;
    const hue2 = (hue1 + 40 + (h % 60)) % 360;

    return `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 80% 45%))`;
  };

  const countPostImages = (post) => {
  if (!post) return 0;

  let count = 0;

  if (typeof post.mainImage === "string" && post.mainImage.trim() !== "") {
    count += 1;
  }

  if (Array.isArray(post.images)) {
    count += post.images.filter((img) => typeof img === "string" && img.trim() !== "").length;
  }

  if (Array.isArray(post.images) && typeof post.mainImage === "string") {
    const hasMainInImages = post.images.some((img) => img === post.mainImage);
    if (hasMainInImages) count -= 1;
  }

  return count;
};


return (
  <div className="user-extern-container miPerfil-container">
    {/* ✅ mismo header externo */}
    <ExternalProfileHeader
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onBack={handleBack}
      viewedName={
        (isCompany || isEducationalInstitution)
          ? (profile?.companyName || profile?.fullName || profile?.username)
          : (profile?.fullName || profile?.username)
      }
      viewedAvatar={profileImage}
    />

    {/* HERO HEADER (idéntico estructura) */}
    <ProfileHeroTemplates
      templateId={coverTemplateToShow}
      view={isMobile ? "mobile" : "desktop"}
      profile={profile}
      imageUrl={headerImageToShow}
      isCompany={isCompany}
      isEducationalInstitution={isEducationalInstitution}
      getHeaderGradient={getHeaderGradient}
    />

    <div className="user-extern-content miPerfil-content">
      {/* IZQUIERDA */}
      <div className="user-extern-left-column miPerfil-left-column">
        <div className="user-extern-profile-info miPerfil-profile-info">
          <div className="resume-avatar-card miPerfil-avatar-card">
            <div className="resume-avatar-wrapper miPerfil-avatar-wrapper">
              <img
                src={profileImage}
                alt={profile?.username || "Foto de perfil"}
                className="resume-avatar miPerfil-avatar"
              />
            </div>
          </div>

          <div className="title-user-extern-container miPerfil-title-container">
            <h1 className="user-extern-fullname miPerfil-fullname">
              {isCompany || isEducationalInstitution
                ? profile?.companyName || "Mi empresa"
                : profile?.fullName || "Mi nombre"}
            </h1>

            {Array.isArray(profile?.professionalTags) && profile.professionalTags.length > 0 && (
              <div className="user-extern-tags-profile miPerfil-tags-profile">
                {profile.professionalTags.map((tag, index) => (
                  <React.Fragment key={index}>
                    <span className="creative-type">{tag}</span>
                    {index < profile.professionalTags.length - 1 && (
                      <span className="separator">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {profile?.bio && (
              <div className="resume-section miPerfil-bio-section">
                <p className="resume-bio miPerfil-bio">{profile.bio}</p>
              </div>
            )}
          </div>

          {(profile?.city || profile?.country || profile?.city2) && (
            <div className="resume-section miPerfil-location-section">
              <p className="resume-location miPerfil-location">
                <span>[</span>
                {profile?.city && profile?.country
                  ? `${profile.city}, ${profile.country}`
                  : profile?.city || profile?.country || ""}
                {profile?.city2 ? ` | ${profile.city2}${profile.country2 ? `, ${profile.country2}` : ""}` : ""}
                <span>]</span>
              </p>
            </div>
          )}

          {/* ✅ mismos botones/espaciados, pero versión “mi perfil” */}
          <div className="user-extern-action-buttons miPerfil-action-buttons">
            <div className="button-group miPerfil-button-group">
              {profile?.email && (
                <button
                  className="resume-contact-btn miPerfil-email-btn"
                  onClick={() => setShowEmailPopup(true)}
                >
                  Contactar
                </button>
              )}
            </div>

            {/* Web */}
            {profile?.social?.sitioWeb && (
              <div className="resume-website miPerfil-website">
                <a
                  href={
                    profile.social.sitioWeb.startsWith("http://") ||
                    profile.social.sitioWeb.startsWith("https://")
                      ? profile.social.sitioWeb
                      : `https://${profile.social.sitioWeb}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.social.sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
                <span>↗</span>
              </div>
            )}

            {/* Iconos sociales */}
            <UserSocialSection social={profile?.social} />
          </div>
        </div>
      </div>

            {/* PORTFOLIO + CV */}
      <nav className="guardados-tabs" aria-label="Navegación perfil">
        <button
          type="button"
          className={`tab portfolio ${activeTab === "publicaciones" ? "active" : ""}`}
          onClick={() => setActiveTab("publicaciones")}
        >
          Portfolio
        </button>

        <button
          type="button"
          className={`tab portfolio ${activeTab === "perfil" ? "active" : ""}`}
          onClick={() => setActiveTab("perfil")}
        >
          CV / Resumé
        </button>
      </nav>

      {/* DERECHA */}
      <div className="user-extern-right-column miPerfil-right-column">
        {activeTab === "publicaciones" && (
          <UserGallery
            posts={userPosts}
            loading={postsLoading}
            emptyMessage="Todavía no tienes publicaciones."
          />
        )}

        {activeTab === "perfil" && (
          <div className="resume-two-col">
            <div className="resume-main">
              {isCompany ? (
                <div className="user-extern-company-profile">
                  <UserCompanyTagsSection
                    companyTags={profile?.companyTags}
                    offersPractices={profile?.offersPractices}
                  />
                  <UserBiographySection biography={profile?.biography} />
                  <UserMilestoneSection professionalMilestones={profile?.professionalMilestones} />
                  <UserSocialSection social={profile?.social} />
                  <UserLanguagesSection
                    languages={profile?.languages || profile?.profile?.languages || []}
                  />
                </div>
              ) : isEducationalInstitution ? (
                <div className="user-extern-institution-profile">
                  <UserBiographySection biography={profile?.biography} />
                  <UserSkillsSection skills={profile?.skills} />
                  <UserSocialSection social={profile?.social} />
                  <UserLanguagesSection
                    languages={profile?.languages || profile?.profile?.languages || []}
                  />
                </div>
              ) : (
                <div className="user-extern-creative-profile">
                  <UserBiographySection biography={profile?.biography} />
                  <UserProfessionalExperienceSection
                    professionalFormation={profile?.professionalFormation}
                  />
                  <UserEducationSection education={profile?.education} />
                  <UserSkillsSection skills={profile?.skills} />
                  <UserSoftwareSection software={profile?.software} />
                  <UserLanguagesSection
                    languages={profile?.languages || profile?.profile?.languages || []}
                  />
                </div>
              )}
            </div>

            <div className="resume-aside">
              <UserDownloadableFilesSection
                cvUrl={profile?.cvUrl}
                portfolioUrl={profile?.portfolioUrl}
                userId={profile?._id}
                username={profile?.username}
              />
            </div>
          </div>
        )}

        {/* si en MiPerfil también quieres “ofertas”, añade un 3er tab y este bloque */}
        {activeTab === "ofertas" && (
          <div className="user-extern-offers-content">
            {isCompany ? (
              <UserCompanyOffersSection offers={companyOffers} />
            ) : isEducationalInstitution ? (
              <UserEducationalOffersSection offers={companyOffers} />
            ) : null}
          </div>
        )}
      </div>
    </div>

    {/* POPUP EMAIL */}
    {showEmailPopup && (
      <div className="success-popup-overlay" onClick={() => setShowEmailPopup(false)}>
        <div className="success-popup" onClick={(e) => e.stopPropagation()}>
          <div className="success-popup-header">
            <h3>Información de contacto</h3>
            <button
              className="email-popup-close"
              onClick={() => setShowEmailPopup(false)}
              title="Cerrar"
            >
              <FaTimes />
            </button>
          </div>
          <div className="email-popup-content">
            <div className="email-display">
              <span className="email-text">{profile?.email}</span>
              <button
                className="copy-email-btn"
                onClick={() => {
                  navigator.clipboard.writeText(profile?.email);
                  setShowEmailPopup(false);
                }}
                title="Copiar email"
              >
                <FaCopy /> Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <ProfileStickyActions username={profile?.username} />
  </div>
);
};

export default MiPerfil;
