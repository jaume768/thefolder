// portfolioTemplates/Classic/components/IdentityPanel.jsx
// mode="public" (UserProfilePage) y mode="self" (MiPerfilPage/"mi perfil")
// comparten estructura pero difieren en: de dónde sale el listado de tags
// (public: profileHeadlines con fallback a professionalTags vía
// roleLabelById; self: professionalTags tal cual, sin roleLabelById) y el
// sufijo de clases miPerfil-* que pisa estilos puntuales solo en self (ver
// Classic/miPerfil.css). Seguir y Contactar ya no viven aquí: están en las
// acciones rápidas (shared/QuickActions.jsx, desde ClassicTemplate.jsx).
import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import UserSocialSection from "../../../../../components/controlPanel/userProfile/UserSocialSection";
import { userLocationList } from "../../../../../utils/locations";

const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function IdentityPanel({
  mode,
  profile,
  profileImage,
  isCompany,
  isEducationalInstitution,
  roleLabelById,
  onExternalLink,
}) {
  const { t } = useTranslation("profile");
  const isSelf = mode === "self";

  const displayName = isCompany || isEducationalInstitution
    ? profile?.companyName || t(isSelf ? "default.companyName" : "default.externalCompanyName")
    : profile?.fullName || t(isSelf ? "default.fullName" : "default.externalFullName");

  return (
    <div className={cx("user-extern-profile-info", isSelf && "miPerfil-profile-info")}>
      <div className={cx("resume-avatar-card", isSelf && "miPerfil-avatar-card")}>
        <div className={cx("resume-avatar-wrapper", isSelf && "miPerfil-avatar-wrapper")}>
          <img
            src={profileImage}
            alt={profile?.username || t("default.profilePictureAlt")}
            className={cx("resume-avatar", isSelf && "miPerfil-avatar")}
          />
        </div>
      </div>

      <div className={cx("title-user-extern-container", isSelf && "miPerfil-title-container")}>
        <h1 className={cx("user-extern-fullname", isSelf && "miPerfil-fullname")}>{displayName}</h1>

        {isSelf ? (
          Array.isArray(profile?.professionalTags) && profile.professionalTags.length > 0 && (
            <div className="user-extern-tags-profile miPerfil-tags-profile">
              {profile.professionalTags.map((tag, index) => (
                <React.Fragment key={index}>
                  <span className="creative-type">{tag}</span>
                  {index < profile.professionalTags.length - 1 && <span className="separator">{"&"}</span>}
                </React.Fragment>
              ))}
            </div>
          )
        ) : (
          (() => {
            const headlines = (profile?.profileHeadlines || [])
              .map((h) => String(h || "").trim())
              .filter(Boolean)
              .slice(0, 3);
            const fallback = headlines.length === 0
              ? (profile?.professionalTags || []).map((id) => roleLabelById[id]).filter(Boolean).slice(0, 3)
              : [];
            const displayTags = headlines.length > 0 ? headlines : fallback;
            if (displayTags.length === 0) return null;
            return (
              <div className="user-extern-tags-profile">
                {displayTags.map((tag, index, arr) => (
                  <React.Fragment key={`${tag}-${index}`}>
                    <span className="creative-type">{tag}</span>
                    {index < arr.length - 1 && <span className="separator">{"&"}</span>}
                  </React.Fragment>
                ))}
              </div>
            );
          })()
        )}

        {profile?.bio && (
          <div className={cx("resume-section", isSelf && "miPerfil-bio-section")}>
            <p className={cx("resume-bio", isSelf && "miPerfil-bio")}>{profile.bio}</p>
          </div>
        )}
      </div>

      {(profile?.city || profile?.country || profile?.city2) && (
        <div className={cx("resume-section", isSelf && "miPerfil-location-section")}>
          <p className={cx("resume-location", isSelf && "miPerfil-location")}>
            {userLocationList(profile?.city, profile?.country, t, {
              city2: profile?.city2,
              country2: profile?.country2,
              city3: profile?.city3,
              country3: profile?.country3,
            }).map((loc) => (
              // Sin separador de texto: las separa el gap de .resume-location
              <span key={loc}>{loc}</span>
            ))}
          </p>
        </div>
      )}

      {/* Seguir y Contactar viven en las acciones rápidas (QuickActions,
          ver ClassicTemplate.jsx); aquí solo web, representación y redes. */}
      <div className={cx("user-extern-action-buttons", isSelf && "miPerfil-action-buttons")}>

        {profile?.social?.sitioWeb && (
          <div className={cx("resume-website", isSelf && "miPerfil-website")}>
            <a
              href={
                profile.social.sitioWeb.startsWith("http://") || profile.social.sitioWeb.startsWith("https://")
                  ? profile.social.sitioWeb
                  : `https://${profile.social.sitioWeb}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.social.sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
            <ArrowUpRight className="resume-website-arrow" size={12} strokeWidth={1.6} aria-hidden="true" />
          </div>
        )}

        {profile?.social?.representationName && (
          <div className={cx("resume-website resume-representation", isSelf && "miPerfil-website")}>
            <span className="resume-representation__label">{t("representation.label")}</span>
            {profile.social.representationWeb ? (
              <button
                type="button"
                className="resume-website-btn"
                onClick={() => onExternalLink(profile.social.representationWeb)}
              >
                {profile.social.representationName}
              </button>
            ) : (
              <span>{profile.social.representationName}</span>
            )}
            {profile.social.representationWeb && (
              <ArrowUpRight className="resume-website-arrow" size={12} strokeWidth={1.6} aria-hidden="true" />
            )}
          </div>
        )}

        <UserSocialSection social={profile?.social} />
      </div>
    </div>
  );
}
