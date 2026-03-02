// templates/mobile/M_SplitImage.jsx
import React from "react";

export default function M_SplitImage({
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
    <div className="hero hero--split-image is-mobile">

      {/* Imagen arriba */}
      <div className="si__media">
        {imageUrl ? (
          <img src={imageUrl} alt="Imagen destacada" className="si__image" />
        ) : (
          <div
            className="si__placeholder"
            style={{ background: getHeaderGradient(profile?.username || "user") }}
          />
        )}
      </div>

      {/* Franja blanca abajo — nombre izquierda, tags derecha */}
      <div className="si__bar">
        <h2 className="si__name">{name}</h2>
        {tags.length > 0 && (
          <div className="si__tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="si__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}