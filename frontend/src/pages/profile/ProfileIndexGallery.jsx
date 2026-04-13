import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaCopy } from "react-icons/fa";
import LandingHeader from "../../components/landing/LandingHeader";

import "./ProfileIndexGallery.css";
import UserProfessionalExperienceSection from "../../components/controlPanel/userProfile/UserProfessionalExperienceSection";
import UserSkillsSection from "../../components/controlPanel/userProfile/UserSkillsSection";
import UserSoftwareSection from "../../components/controlPanel/userProfile/UserSoftwareSection";
import UserEducationSection from "../../components/controlPanel/userProfile/UserEducationSection";
import UserLanguagesSection from "../../components/controlPanel/userProfile/UserLanguagesSection";
import { buildSocialMediaUrl } from "../../utils/socialMediaUtils";
import { clImg } from "../../utils/optimizeImage";

// ── Patrón de columnas cíclico (12 columnas) ─────────────────────────────
// A → col 5/8  |  B → col 9/12
// Ciclo de 10: a b a a b b a a a b
const COL_PATTERN = ["a", "b", "c", "b", "c", "a", "b", "b", "c", "a", "a", "b", "c", "b", "c"];

// ── Contador de imágenes de un post ──────────────────────────────────────
const countImages = (post) => {
  if (!post) return 0;
  let count = 0;
  if (typeof post.mainImage === "string" && post.mainImage.trim()) count += 1;
  if (Array.isArray(post.images)) {
    count += post.images.filter(
      (img) => typeof img === "string" && img.trim()
    ).length;
  }
  // evitar duplicado si mainImage está también en images[]
  if (
    Array.isArray(post.images) &&
    typeof post.mainImage === "string" &&
    post.images.includes(post.mainImage)
  ) {
    count -= 1;
  }
  return count;
};

// ─────────────────────────────────────────────────────────────────────────
const ProfileIndexGallery = ({
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
  openCreatePost,
  isLoggedIn,
  isCompany,
  isEducationalInstitution,
  handleBack,
}) => {
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
    profile?.city2 ? [profile.city2, profile.country2].filter(Boolean).join(", ") : null
  ].filter(Boolean).join(" · ");

  const hasCvData = !!(
    profile?.professionalFormation?.length ||
    profile?.education?.length ||
    profile?.skills?.length ||
    profile?.software?.length ||
    (profile?.languages || []).length
  );

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
          <div className="tf-guest-profile" role="dialog" aria-label="Invitación registro">
            <button
              type="button"
              className="tf-btn tf-btn--CTA"
              onClick={() => navigate("/", { state: { showRegister: true } })}
            >
              Crea tu perfil 
              <br />
              en THEFOLDER ↗
            </button>
          </div>
        </>
      )}

    <div className="pig-layout">

      {/* ── Botón volver (solo usuarios registrados) ─────────────────── */}
      {isLoggedIn && window.history.length > 1 && (
        <button
          type="button"
          className="pig-back"
          onClick={() => navigate(-1)}
        >
          <p className="pig-back-arrow">[🡠]</p>
        </button>
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="pig-sidebar">

        {/* Identidad: nombre, rol, ubicación */}
        <div className="pig-identity">
          <h1 className="pig-name">{displayName}</h1>

          {Array.isArray(profile?.profileHeadlines) &&
            profile.profileHeadlines.filter(Boolean).length > 0 && (
              <p className="pig-role">
                {profile.profileHeadlines
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(" & ")}
              </p>
            )}

          {location && <p className="pig-location">{location}</p>}
        </div>

        {(profile?.biography || profile?.bio) && (
          <p className="pig-bio">{profile.biography || profile.bio}</p>
        )}

        {profile?.social?.sitioWeb && (
          <a
            className="pig-website"
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
              .replace(/\/$/, "")}{" "}
            ↗
          </a>
        )}

        <div className="pig-actions">
          {isOwner && (
            <button
              type="button"
              className="pig-action-btn"
              onClick={() => navigate("/myprofile/edit")}
            >
              Editar perfil
            </button>
          )}

          {profile?.email && (
            <button
              type="button"
              className="pig-action-btn pig-action-btn--ghost"
              onClick={() => setShowEmailPopup(true)}
            >
              Contactar
            </button>
          )}

          {!isOwner && (
            <button
              type="button"
              className={`pig-action-btn ${
                isFollowing ? "pig-action-btn--following" : ""
              }`}
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={followLoading}
            >
              {followLoading ? "…" : isFollowing ? "Siguiendo" : "Seguir +"}
            </button>
          )}
        </div>
      </aside>

      {/* ── Zona principal ───────────────────────────────────────────── */}
      <main className="pig-main">

      {/* Toggle PORTFOLIO / CV — solo si hay datos de CV */}
      {hasCvData && (
        <div className="pig-toggle">
          <button
            type="button"
            className={`pig-toggle-btn ${
              activeTab === "publicaciones" ? "pig-toggle-btn--active" : ""
            }`}
            onClick={() => setActiveTab("publicaciones")}
          >
            PORTFOLIO
          </button>
          <span className="pig-toggle-sep">/</span>
          <button
            type="button"
            className={`pig-toggle-btn ${
              activeTab === "perfil" ? "pig-toggle-btn--active" : ""
            }`}
            onClick={() => setActiveTab("perfil")}
          >
            About (CV)
          </button>
        </div>
      )}

        {/* PORTFOLIO — grid editorial */}
        {activeTab === "publicaciones" && (
          <>
            {postsLoading ? (
              <p className="pig-status">Cargando proyectos…</p>
            ) : userPosts.length === 0 ? (
              <p className="pig-status">
                {isOwner
                  ? "Aún no has publicado ningún proyecto."
                  : "Este perfil todavía no tiene publicaciones."}
              </p>
            ) : (
              <div className="pig-grid">
                {userPosts.map((post, idx) => {
                  const colClass = `pig-card--col-${COL_PATTERN[idx % COL_PATTERN.length]}`;
                  const imgCount = countImages(post);
                  const coverImg =
                    post.mainImage ||
                    (Array.isArray(post.images) && post.images[0]) ||
                    null;

                  return (
                    <article
                      key={post._id}
                      className={`pig-card ${colClass}`}
                      onClick={() => navigate(`/post/${post._id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && navigate(`/post/${post._id}`)
                      }
                    >
                      <div className="pig-card__image-wrap">
                        {coverImg ? (
                          <img
                            className="pig-card__image"
                            src={clImg.post(coverImg)}
                            alt={post.title || "Proyecto"}
                            loading="lazy"
                          />
                        ) : (
                          <div className="pig-card__placeholder" />
                        )}
                      </div>

                      <div className="pig-card__caption">
                        {post.title && (
                          <span className="pig-card__title">{post.title}</span>
                        )}
                        {imgCount > 0 && (
                          <span className="pig-card__count">
                            {imgCount === 1 ? "[1]" : `[+${imgCount - 1}]`}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CV — tipografía limpia */}
        {activeTab === "perfil" && (
          <div className="pig-cv">
            <UserProfessionalExperienceSection
              professionalFormation={profile?.professionalFormation}
            />
            <UserEducationSection education={profile?.education} />
            <UserSkillsSection skills={profile?.skills} />
            <UserSoftwareSection software={profile?.software} />
            <UserLanguagesSection
              languages={profile?.languages || []}
            />
          </div>
        )}
      </main>
    </div>

    {/* ── Barra social sticky bottom ───────────────────────────────────── */}
    {profile?.social && Object.values(profile.social).some(Boolean) && (() => {
      const SOCIALS = [
        { key: "instagram",  label: "Instagram" },
        { key: "tiktok",     label: "Tik Tok"   },
        { key: "linkedin",   label: "LinkedIn"  },
        { key: "behance",    label: "Behance"   },
        { key: "pinterest",  label: "Pinterest" },
        { key: "youtube",    label: "YouTube"   },
        { key: "tumblr",     label: "Tumblr"    },
        { key: "substack",   label: "Substack"  },
      ];
      const active = SOCIALS.filter(s => profile.social[s.key]);
      if (!active.length) return null;
      return (
        <div className="pig-social-bar">
          {active.map(s => (
            <a
              key={s.key}
              className="pig-social-bar__item"
              href={buildSocialMediaUrl(s.key, profile.social[s.key])}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.label}
            </a>
          ))}
        </div>
      );
    })()}

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
                  navigator.clipboard.writeText(profile?.email || "");
                  setEmailCopied(true);
                  setTimeout(() => {
                    setEmailCopied(false);
                    setShowEmailPopup(false);
                  }, 1200);
                }}
                title="Copiar email"
              >
                <FaCopy /> {emailCopied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ProfileIndexGallery;
