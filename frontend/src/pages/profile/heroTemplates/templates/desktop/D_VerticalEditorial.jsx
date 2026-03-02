// templates/desktop/D_VerticalEditorial.jsx
import React from "react";

export default function D_VerticalEditorial({
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
    <div className={`hero hero--vertical-editorial ${view === "mobile" ? "is-mobile" : ""}`}>

      <div className="ve__layout">

        {/* Columna texto — izquierda */}
        <div className="ve__col ve__col--text">
          <h2 className="ve__name">{name}</h2>
          {tags.length > 0 && (
            <div className="ve__tags">
              {tags.map((tag, idx) => (
                <span key={idx} className="ve__tag">
                  {tag} 
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Columna imagen — derecha, ocupa todo el alto */}
        <div className="ve__col ve__col--media">
          {imageUrl ? (
            <img src={imageUrl} alt="Imagen destacada" className="ve__image" />
          ) : (
            <div
              className="ve__placeholder"
              style={{ background: getHeaderGradient(profile?.username || "user") }}
            />
          )}
        </div>

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