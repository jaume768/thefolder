// templates/desktop/D_Fullscreen.jsx
import React from "react";

export default function D_Fullscreen({
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
    <div className={`hero hero--fullscreen ${view === "mobile" ? "is-mobile" : ""}`}>

      {/* Imagen de fondo */}
      <div className="fs__media">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Imagen destacada"
            className="fs__image"
          />
        ) : (
          <div
            className="fs__placeholder"
            style={{ background: getHeaderGradient(profile?.username || "user") }}
          />
        )}
        <div className="fs__overlay" />
      </div>

      {/* Texto superpuesto */}
      <div className="fs__content">
        <h2 className="fs__name">{name}</h2>
        {tags.length > 0 && (
          <div className="fs__tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="fs__tag">
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