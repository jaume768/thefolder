// templates/desktop/D_Centered.jsx
import React from "react";

export default function D_Centered({
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
    <div className={`hero hero--centered ${view === "mobile" ? "is-mobile" : ""}`}>

      <div className="dc__layout">

        <div className="dc__col dc__col--left">
          <h2 className="dc__name">{name}</h2>
        </div>

        <div className="dc__col dc__col--center">
          <div className="dc__media">
            {imageUrl ? (
              <img src={imageUrl} alt="Imagen destacada" className="dc__image" />
            ) : (
              <div
                className="dc__placeholder"
                style={{ background: getHeaderGradient(profile?.username || "user") }}
              />
            )}
          </div>
        </div>

        <div className="dc__col dc__col--right">
          {tags.length > 0 && (
            <div className="dc__tags">
              {tags.map((tag, idx) => (
                <span key={idx} className="dc__tag">
                  {tag} 
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}