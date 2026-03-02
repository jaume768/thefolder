import React from "react";

export default function M_FullscreenAlt({
  profile,
  isCompany,
  isEducationalInstitution,
  imageUrl,
  getHeaderGradient,
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
    <div className="hero hero--fullscreen-alt is-mobile hero--alt-vertical">
      {/* Texto arriba */}
      <div className="hero__header hero__header--alt">
        <h2 className="hero__name hero__name--dark">{name}</h2>

        {tags.length > 0 && (
          <div className="hero__tags hero__tags--alt">
            {tags.map((tag, idx) => (
              <span key={idx} className="hero__tag hero__tag--dark">
                {tag} 
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Imagen centrada */}
      <div className="hero__media hero__media--alt-vertical">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Imagen destacada"
            className="hero__image hero__image--alt-vertical"
          />
        ) : (
          <div
            className="hero__placeholder hero__placeholder--alt-vertical"
            style={{ background: getHeaderGradient(profile?.username || "user") }}
          />
        )}
      </div>
    </div>
  );
}
