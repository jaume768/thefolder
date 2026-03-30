// templates/desktop/D_SplitTop.jsx
import React from "react";

export default function D_SplitTop({
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
    <div className={`hero hero--split-top ${view === "mobile" ? "is-mobile" : ""}`}>

      <div className="st__layout">
      {/* Imagen grande debajo */}
        <div className="st__media">
          {imageUrl ? (
            <img src={imageUrl} alt="Imagen destacada" className="st__image" />
          ) : (
            <div
              className="st__placeholder"
              style={{ background: getHeaderGradient(profile?.username || "user") }}
            />
          )}
        </div>

        {/* Franja superior — texto arriba derecha */}
        <div className="st__header">
          <div className="st__header-inner">
            <h2 className="st__name">{name} /</h2>
            {tags.length > 0 && (
              <div className="st__tags">
                {tags.map((tag, idx) => (
                  <span key={idx} className="st__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}