// templates/desktop/D_FullscreenAlt.jsx
import React from "react";

export default function D_FullscreenAlt({
  profile,
  isCompany,
  isEducationalInstitution,
  imageUrl,
  getHeaderGradient,
  view,
  profileHeadlines, 
}) {
  const name =
    isCompany || isEducationalInstitution
      ? profile?.companyName || "Mi empresa"
      : profile?.fullName || "Mi nombre";

    const tags = Array.isArray(profileHeadlines)
      ? profileHeadlines.map(t => String(t || "").trim()).filter(Boolean)
      : [];

  return (
    <div className={`hero hero--fullscreen-alt ${view === "mobile" ? "is-mobile" : ""}`}>

      {/* Imagen de fondo */}
      <div className="fsa__media">
        {imageUrl ? (
          <img src={imageUrl} alt="Imagen destacada" className="fsa__image" />
        ) : (
          <div
            className="fsa__placeholder"
            style={{ background: getHeaderGradient(profile?.username || "user") }}
          />
        )}
        <div className="fsa__overlay" />
      </div>

      {/* Texto centrado */}
      <div className="fsa__content">
        <h2 className="fsa__name">{name}</h2>
        {tags.length > 0 && (
          <div className="fsa__tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="fsa__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chevron */}
      <div className="hero__scroll" aria-hidden="true">
        <svg width="16" height="12" viewBox="0 0 22 12">
          <path d="M1 1 L11 11 L21 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

    </div>
  );
}