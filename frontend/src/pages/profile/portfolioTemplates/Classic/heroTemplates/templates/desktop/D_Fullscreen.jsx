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
      ? profileHeadlines.map(t => String(t || "").trim()).filter(Boolean).slice(0, 2)
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
    </div>
  );
}