// templates/mobile/M_VerticalCard.jsx
import React from "react";

export default function M_VerticalCard({
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
    ? profileHeadlines.map(t => String(t || "").trim()).filter(Boolean).slice(0, 2)
    : [];

  return (
    <div className="hero hero--vertical-card is-mobile">

      {/* Nombre arriba */}
      <div className="vcard__footer vcard__footer--top">
        <h2 className="vcard__name">{name} /</h2>
      </div>

      {/* Imagen vertical centrada */}
      <div className="vcard__media">
        {imageUrl ? (
          <img src={imageUrl} alt="Imagen destacada" className="vcard__image" />
        ) : (
          <div
            className="vcard__placeholder"
            style={{ background: getHeaderGradient(profile?.username || "user") }}
          />
        )}
      </div>

      {/* Tags abajo */}
      <div className="vcard__footer">
        {tags.length > 0 && (
          <div className="vcard__tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="vcard__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}