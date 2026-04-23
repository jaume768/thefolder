import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTimes, FaCopy } from "react-icons/fa";
import LandingHeader from "../../components/landing/LandingHeader";

import "./ProfileStudioGallery.css";
import UserProfessionalExperienceSection from "../../components/controlPanel/userProfile/UserProfessionalExperienceSection";
import UserSkillsSection from "../../components/controlPanel/userProfile/UserSkillsSection";
import UserSoftwareSection from "../../components/controlPanel/userProfile/UserSoftwareSection";
import UserEducationSection from "../../components/controlPanel/userProfile/UserEducationSection";
import UserLanguagesSection from "../../components/controlPanel/userProfile/UserLanguagesSection";
import { buildSocialMediaUrl } from "../../utils/socialMediaUtils";
import { clImg } from "../../utils/optimizeImage";

const countImages = (post) => {
  if (!post) return 0;
  let count = 0;
  if (typeof post.mainImage === "string" && post.mainImage.trim()) count += 1;
  if (Array.isArray(post.images)) {
    count += post.images.filter((img) => typeof img === "string" && img.trim()).length;
  }
  if (
    Array.isArray(post.images) &&
    typeof post.mainImage === "string" &&
    post.images.includes(post.mainImage)
  ) {
    count -= 1;
  }
  return count;
};

const ProfileStudioGallery = ({
  profile,
  userPosts = [],
  postsLoading = false,
  activeTab,
  setActiveTab,
  isOwner,
  isFollowing,
  followLoading,
  handleFollow,
  handleUnfollow,
  isLoggedIn,
  isCompany,
  isEducationalInstitution,
}) => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    isCompany || isEducationalInstitution
      ? profile?.companyName
      : profile?.fullName;

  const location = [
    [profile?.city, profile?.country].filter(Boolean).join(", "),
    profile?.city2 ? [profile.city2, profile.country2].filter(Boolean).join(", ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasCvData = !!(
    profile?.professionalFormation?.length ||
    profile?.education?.length ||
    profile?.skills?.length ||
    profile?.software?.length ||
    (profile?.languages || []).length
  );

  const SOCIALS = [
    { key: "instagram", label: "Instagram" },
    { key: "tiktok",    label: "Tik Tok"   },
    { key: "linkedin",  label: "LinkedIn"  },
    { key: "behance",   label: "Behance"   },
    { key: "pinterest", label: "Pinterest" },
    { key: "youtube",   label: "YouTube"   },
    { key: "tumblr",    label: "Tumblr"    },
    { key: "substack",  label: "Substack"  },
  ];
  const activeSocials = SOCIALS.filter((s) => profile?.social?.[s.key]);

  return (
    <>
      {!isLoggedIn && (
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
              en THEFOLDER ↗
            </button>
          </div>
        </>
      )}

      <div className="psg-layout">

        {isLoggedIn && window.history.length > 1 && (
          <button type="button" className="psg-back" onClick={() => navigate(-1)}>
            <p className="psg-back-arrow">[🡠]</p>
          </button>
        )}

        {/* ── Tabs PORTFOLIO / CV ───────────────────────────────────────────── */}
        {hasCvData && (
          <nav className="psg-tabs">
            <button
              type="button"
              className={`psg-tab ${activeTab === "publicaciones" ? "psg-tab--active" : ""}`}
              onClick={() => setActiveTab("publicaciones")}
            >
              Portfolio
            </button>
            <button
              type="button"
              className={`psg-tab ${activeTab === "perfil" ? "psg-tab--active" : ""}`}
              onClick={() => setActiveTab("perfil")}
            >
              About
            </button>
            {profile?.email && (
              <button
                type="button"
                className="psg-action-btn"
                onClick={() => setShowEmailPopup(true)}
              >
                {t("contact.button")}
              </button>
            )}
          </nav>
        )}

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="psg-header">
          <h1 className="psg-name">{displayName}</h1>

          {Array.isArray(profile?.profileHeadlines) &&
            profile.profileHeadlines.filter(Boolean).length > 0 && (
              <p className="psg-role">
                {profile.profileHeadlines.filter(Boolean).slice(0, 2).join(" & ")}
              </p>
            )}
        </header>

        {/* ── Contenido ────────────────────────────────────────────────────── */}
        <main className="psg-main">

          {activeTab === "publicaciones" && (
            <>
              {postsLoading ? (
                <p className="psg-status">{t("loadingProjects")}</p>
              ) : userPosts.length === 0 ? (
                <p className="psg-status">
                  {isOwner
                    ? t("emptyPosts")
                    : t("emptyPostsExternal")}
                </p>
              ) : (
                <div className="psg-grid">
                  {userPosts.map((post) => {
                    const imgCount = countImages(post);
                    const coverImg =
                      post.mainImage ||
                      (Array.isArray(post.images) && post.images[0]) ||
                      null;

                    return (
                      <article
                        key={post._id}
                        className="psg-card"
                        onClick={() => navigate(`/post/${post._id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/post/${post._id}`)}
                      >
                        {coverImg ? (
                          <img
                            className="psg-card__image"
                            src={clImg.post(coverImg)}
                            alt={post.title || t("project")}
                            loading="lazy"
                          />
                        ) : (
                          <div className="psg-card__placeholder" />
                        )}

                        <div className="psg-card__caption">
                          {post.title && (
                            <span className="psg-card__title">{post.title}</span>
                          )}
                          {imgCount > 1 && (
                            <span className="psg-card__count">[+{imgCount - 1}]</span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "perfil" && (
            <div className="psg-cv">

              {/* ── Info de perfil (ubicación, bio, web, acciones) ─────────── */}
              <div className="psg-cv-identity">
                {location && <p className="psg-location">{location}</p>}

                {(profile?.biography || profile?.bio) && (
                  <p className="psg-bio">{profile.biography || profile.bio}</p>
                )}

                {profile?.social?.sitioWeb && (
                  <a
                    className="psg-website"
                    href={
                      profile.social.sitioWeb.startsWith("http")
                        ? profile.social.sitioWeb
                        : `https://${profile.social.sitioWeb}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.social.sitioWeb
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}{" "}↗
                  </a>
                )}

                <div className="psg-actions">
                  {isOwner && (
                    <button
                      type="button"
                      className="psg-action-btn"
                      onClick={() => navigate("/myprofile/edit")}
                    >
                      {t("editProfileBtn")}
                    </button>
                  )}

                  {profile?.email && (
                    <>
                      {isOwner && <span className="psg-action-sep" />}
                      <button
                        type="button"
                        className="psg-action-btn"
                        onClick={() => setShowEmailPopup(true)}
                      >
                        {t("contact.button")}
                      </button>
                    </>
                  )}

                  {!isOwner && (
                    <>
                      {profile?.email && <span className="psg-action-sep" />}
                      <button
                        type="button"
                        className={`psg-action-btn ${isFollowing ? "psg-action-btn--following" : "psg-action-btn--primary"}`}
                        onClick={isFollowing ? handleUnfollow : handleFollow}
                        disabled={followLoading}
                      >
                        {followLoading ? "…" : isFollowing ? t("follow.following") : t("follow.follow")}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="psg-cv-cv">
                <UserProfessionalExperienceSection
                  professionalFormation={profile?.professionalFormation}
                />
                <UserEducationSection education={profile?.education} />
                <UserSkillsSection skills={profile?.skills} />
                <UserSoftwareSection software={profile?.software} />
                <UserLanguagesSection languages={profile?.languages || []} />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Barra social sticky bottom ──────────────────────────────────────── */}
      {activeSocials.length > 0 && (
        <div className="psg-social-bar">
          {activeSocials.map((s) => (
            <a
              key={s.key}
              className="psg-social-bar__item"
              href={buildSocialMediaUrl(s.key, profile.social[s.key])}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      {/* ── Popup email ─────────────────────────────────────────────────────── */}
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
                    setEmailCopied(true);
                    setTimeout(() => {
                      setEmailCopied(false);
                      setShowEmailPopup(false);
                    }, 1200);
                  }}
                  title={t("contact.copy")}
                >
                  <FaCopy /> {emailCopied ? t("copied") : t("contact.copy")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileStudioGallery;
