// templates/desktop/D_VerticalCentered.jsx
import React from "react";

export default function D_VerticalCentered({
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
    <div className={`hero hero--vertical-centered ${view === "mobile" ? "is-mobile" : ""}`}>

      <div className="vc__layout">

        {/* Texto arriba centrado */}
        <div className="vc__header">
          <h2 className="vc__name">{name}</h2>
          {tags.length > 0 && (
            <div className="vc__tags">
              {tags.map((tag, idx) => (
                <span key={idx} className="vc__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Imagen horizontal centrada debajo */}
        <div className="vc__media">
          {imageUrl ? (
            <img src={imageUrl} alt="Imagen destacada" className="vc__image" />
          ) : (
            <div
              className="vc__placeholder"
              style={{ background: getHeaderGradient(profile?.username || "user") }}
            />
          )}
        </div>

      </div>
    </div>
  );
}