// UserProfile.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import ProfileIndexGallery from "./ProfileIndexGallery";
import ProfileStudioGallery from "./ProfileStudioGallery";
import { AuthContext } from "../../contexts/AuthContext";
import { useCreatePost } from "../../contexts/CreatePostContext";
import "../../components/controlPanel/css/UserProfileExtern.css";
import "../../components/controlPanel/css/UserProfile.css";
import { clImg } from "../../utils/optimizeImage";
import { FaCheckCircle, FaExclamationCircle, FaCopy, FaTimes } from "react-icons/fa";

// Componentes
import ProfileHeroTemplates from "./heroTemplates/ProfileHeroTemplates";
import UserBiographySection from "../../components/controlPanel/userProfile/UserBiographySection";
import UserProfessionalExperienceSection from  "../../components/controlPanel/userProfile/UserProfessionalExperienceSection";
import UserSkillsSection from "../../components/controlPanel/userProfile/UserSkillsSection";
import UserSoftwareSection from "../../components/controlPanel/userProfile/UserSoftwareSection";
import UserEducationSection from "../../components/controlPanel/userProfile/UserEducationSection";
import UserPressPublicationsSection from "../../components/controlPanel/userProfile/UserPressPublicationsSection";
import UserAwardsSection from "../../components/controlPanel/userProfile/UserAwardsSection";
import UserLanguagesSection from "../../components/controlPanel/userProfile/UserLanguagesSection";
import UserSocialSection from "../../components/controlPanel/userProfile/UserSocialSection";
import UserDownloadableFilesSection from "../../components/controlPanel/userProfile/UserDownloadableFilesSection"; 
import UserCompanyTagsSection from "../../components/controlPanel/userProfile/UserCompanyTagsSection";
import UserMilestoneSection from "../../components/controlPanel/userProfile/UserMilestoneSection";
import UserCompanyOffersSection from "../../components/controlPanel/userProfile/UserCompanyOffersSection";
import UserEducationalOffersSection from "../../components/controlPanel/userProfile/UserEducationalOffersSection"; 
import UserGallery from "../../components/controlPanel/userProfile/UserGallery";
import ExternalProfileHeader from "../../components/controlPanel/userProfile/ExternalProfileHeader";
import LandingHeader from "../../components/landing/LandingHeader";


const UserProfile = () => {
  const { t } = useTranslation("profile");

  const isLoggedIn = !!localStorage.getItem("authToken");

  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCreatives = !!location.state?.fromCreatives;
  const [searchParams] = useSearchParams();
  const layoutParam = searchParams.get("layout");

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

  // layout + hero
  const [fallbackHeaderImage, setFallbackHeaderImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  // state general
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // notification toast
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // tipo usuario + ofertas
  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);
  const [companyOffers, setCompanyOffers] = useState([]);

  // email popup
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // external link warning
  const [externalLinkModal, setExternalLinkModal] = useState({ open: false, url: "" });
  const openExternalLink = (url) => {
    const full = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    setExternalLinkModal({ open: true, url: full });
  };

  // responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Ocultar el dashboard-header global mientras se muestra el ext-profile-header propio
  useEffect(() => {
    document.body.classList.add("hide-dashboard-header");
    return () => {
      document.body.classList.remove("hide-dashboard-header");
    };
  }, []);

  const profileImage =
    profile?.profile?.profilePicture || profile?.profilePicture || "/multimedia/usuarioDefault.jpg";

  const hasCvData = !!(
    profile?.biography ||
    profile?.professionalFormation?.length ||
    profile?.education?.length ||
    profile?.skills?.length ||
    profile?.software?.length ||
    (profile?.languages || profile?.profile?.languages || []).length ||
    profile?.companyTags?.length ||
    profile?.professionalMilestones?.length ||
    profile?.cvUrl ||
    profile?.portfolioUrl
  );

  const headerImageToShow = clImg.cover(
    (isMobile ? profile?.featuredHeaderImageMobile : profile?.featuredHeaderImageDesktop) ||
    profile?.featuredHeaderImage ||
    fallbackHeaderImage ||
    profile?.profile?.profilePicture ||
    null
  );

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
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
    setFallbackHeaderImage(null);

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

        // 3) info extra si hay token (follow + notifs)
        if (token) {
          try {
            const headers = { Authorization: `Bearer ${token}` };
            const currentUser = await axios.get(`${backendUrl}/api/users/profile`, { headers });

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

      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.post(
        `${backendUrl}/api/users/follow/${profile._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.delete(`${backendUrl}/api/users/follow/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      if (isNotificationActive) {
        await axios.post(
          `${backendUrl}/api/users/notifications/deactivate/${profile._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${backendUrl}/api/users/notifications/activate/${profile._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsNotificationActive((prev) => !prev);
    } catch (e) {
    }
  };

  if (loading) {
    return (
      <div className="user-extern-loading">
        <p className="loading-indicator">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-extern-error">
        <h2>{t("common.error")}</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/explorer")}>{t("backToExplorer")}</button>
      </div>
    );
  }

  // ── Layout alternativo: Studio Gallery
  if (profile?.profileLayout === "studio-gallery" || layoutParam === "studio") {
    return (
      <ProfileStudioGallery
        profile={profile}
        userPosts={userPosts}
        postsLoading={postsLoading}
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
      />
    );
  }

  // ── Layout alternativo: por profileLayout del usuario (o ?layout=index para preview)
  if (profile?.profileLayout === "index-gallery" || layoutParam === "index") {
    return (
      <ProfileIndexGallery
        profile={profile}
        userPosts={userPosts}
        postsLoading={postsLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOwner={isOwner}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
        openCreatePost={openCreatePost}
        isLoggedIn={isLoggedIn}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        setShowEmailPopup={setShowEmailPopup}
        handleBack={handleBack}
      />
    );
  }

  const coverTemplateToShow =
    (isMobile ? profile?.coverTemplateMobile : profile?.coverTemplateDesktop) || "fullscreen";

    const DARK_HERO_TEMPLATES = ["fullscreen", "fullscreen-alt", "split-top"];
    const headerIsDark = DARK_HERO_TEMPLATES.includes(coverTemplateToShow);

  return (
    <div className="user-extern-container">
      {isLoggedIn ? (
        <ExternalProfileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBack={handleBack}
          viewedName={
            isCompany || isEducationalInstitution
              ? profile?.companyName
              : profile?.fullName
          }
          viewedAvatar={profileImage}
          isDark={headerIsDark}
        />
      ) : (
        <>
          <LandingHeader
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onLoginClick={() => navigate("/", { state: { showLogin: true } })}
            onRegisterClick={() => navigate("/", { state: { showRegister: true } })}
          />
          <div className="tf-guest-profile" role="dialog" aria-label={t("guestAriaLabel")}>
            <button
              type="button"
              className="tf-btn tf-btn--CTA"
              onClick={() => navigate("/", { state: { showRegister: true } })}
            >
              {t("guestCta")}
              <br />
              {t("guestCtaLine2")}
            </button>
          </div>
        </>
      )}

      {notification.show && (
        <div className={`user-extern-notification ${notification.type}`}>
          {notification.type === "success" ? (
            <FaCheckCircle className="user-extern-notification-icon" />
          ) : (
            <FaExclamationCircle className="user-extern-notification-icon" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <ProfileHeroTemplates
        templateId={coverTemplateToShow}
        view={isMobile ? "mobile" : "desktop"}
        profile={profile}
        imageUrl={headerImageToShow}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        getHeaderGradient={getHeaderGradient}
        roleLabelById={roleLabelById}
        profileHeadlines={profile?.profileHeadlines || []} 
      />

      <div className="user-extern-content">
        {/* IZQUIERDA */}
        <div className="user-extern-left-column">
          <div className="user-extern-profile-info">
            <div className="resume-avatar-card">
              <div className="resume-avatar-wrapper">
                <img
                  src={profileImage}
                  alt={profile?.username || t("default.profilePictureAlt")}
                  className="resume-avatar"
                />
              </div>
            </div>

            <div className="title-user-extern-container">
              <h1 className="user-extern-fullname">
                {isCompany || isEducationalInstitution
                  ? profile?.companyName || t("default.externalCompanyName")
                  : profile?.fullName || t("default.externalFullName")}
              </h1>

              {Array.isArray(profile?.profileHeadlines) &&
                profile.profileHeadlines.filter(Boolean).length > 0 && (
                  <div className="user-extern-tags-profile">
                    {profile.profileHeadlines
                      .map((t) => String(t || "").trim())
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((tag, index, arr) => (
                        <React.Fragment key={`${tag}-${index}`}>
                          <span className="creative-type">{tag}</span>
                          {index < arr.length - 1 && <span className="separator">|</span>}
                        </React.Fragment>
                      ))}
                  </div>
                )}

              {profile?.bio && (
                <div className="resume-section">
                  <p className="resume-bio">{profile.bio}</p>
                </div>
              )}
            </div>

            {(profile?.city || profile?.country || profile?.city2) && (
              <div className="resume-section">
                <p className="resume-location">
                  <span>[</span>
                  {profile?.city && profile?.country
                    ? `${profile.city}, ${profile.country}`
                    : profile?.city || profile?.country || ""}
                  {profile?.city2 ? ` | ${profile.city2}${profile.country2 ? `, ${profile.country2}` : ""}` : ""}
                  <span>]</span>
                </p>
              </div>
            )}

            <div className="user-extern-action-buttons">
              <div className="button-group">
                {!isOwner && (
                <button
                  className={`user-extern-follow-button ${isFollowing ? "following" : ""}`}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? t("follow.loading") : isFollowing ? (
                    <p className="normal-14px-text">
                      <i>{t("follow.following")} </i>
                    </p>
                  ) : (
                    <p className="normal-14px-text">{t("follow.follow")}</p>
                  )}
                </button>
                )}

                {profile?.email && (
                  <button className="resume-contact-btn" onClick={() => setShowEmailPopup(true)}>
                    {t("contact.button")}
                  </button>
                )}
              </div>

              {profile?.social?.sitioWeb && (
                <div className="resume-website">
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

              {profile?.social?.representationName && (
                <div className="resume-website resume-representation">
                  <span className="resume-representation__label">{t("representation.label")}</span>
                  {profile.social.representationWeb ? (
                    <button
                      type="button"
                      className="resume-website-btn"
                      onClick={() => openExternalLink(profile.social.representationWeb)}
                    >
                      {profile.social.representationName}
                    </button>
                  ) : (
                    <span>{profile.social.representationName}</span>
                  )}
                  {profile.social.representationWeb && <span>↗</span>}
                </div>
              )}

              <UserSocialSection social={profile?.social} />
            </div>
          </div>
        </div>

        {/* TABS — solo si hay datos de CV */}
        {hasCvData && (
          <nav className="guardados-tabs" aria-label={t("guestAriaLabel")}>
            <button
              type="button"
              className={`tab portfolio ${activeTab === "publicaciones" ? "active" : ""}`}
              onClick={() => setActiveTab("publicaciones")}
            >
              {t("tabs.portfolio")}
            </button>

            <button
              type="button"
              className={`tab portfolio ${activeTab === "perfil" ? "active" : ""}`}
              onClick={() => setActiveTab("perfil")}
            >
              {t("tabs.cv")}
            </button>
          </nav>
        )}

        {/* DERECHA (simplificada + UserGallery) */}
        <div className="user-extern-right-column">
          {activeTab === "publicaciones" && (
            <UserGallery
              posts={userPosts}
              loading={postsLoading}
              emptyMessage={isOwner ? undefined : t("emptyPostsExternal")}
              emptyContent={isOwner ? (
                <p className="user-extern-no-content user-extern-no-content--owner">
                  <button
                    type="button"
                    className="user-extern-publish-link"
                    onClick={openCreatePost}
                  >
                    {t("publishFirst")}
                  </button>
                  {t("publishFirstRest")}
                </p>
              ) : undefined}
              galleryStyle={profile?.galleryStyle || "gap"}
              onPostClick={fromCreatives ? (postId) => navigate(`/post/${postId}`, { state: { fromCreatives: true } }) : undefined}
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
                    <UserPressPublicationsSection pressPublications={profile?.pressPublications} />
                    <UserAwardsSection awards={profile?.awards} />
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
                  username={username}
                />
              </div>
            </div>
          )}

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
              <h3>{t("contact.popupTitle")}</h3>
              <button
                className="email-popup-close"
                onClick={() => setShowEmailPopup(false)}
                title={t("contact.closeTitle")}
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
                    navigator.clipboard.writeText(profile?.email || "");
                    showNotification("success", t("contact.copied"));
                    setShowEmailPopup(false);
                  }}
                  title={t("contact.copy") + " email"}
                >
                  <FaCopy /> {t("contact.copy")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {externalLinkModal.open && (
        <div
          className="modal-overlay"
          onClick={() => setExternalLinkModal({ open: false, url: "" })}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p className="modal-content-title">{t("externalLink.title")}</p>
            <p className="modal-content-subtitle">{t("externalLink.subtitle")}</p>
            <div className="modal-content-link">{externalLinkModal.url}</div>
            <div className="modal-actions">
              <button onClick={() => setExternalLinkModal({ open: false, url: "" })}>
                {t("externalLink.cancel")}
              </button>
              <button
                onClick={() => {
                  window.open(externalLinkModal.url, "_blank", "noopener,noreferrer");
                  setExternalLinkModal({ open: false, url: "" });
                }}
              >
                {t("externalLink.continue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;