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
    ? profileHeadlines.map(t => String(t || "").trim()).filter(Boolean)
    : [];

  return (
    <div className="hero hero--vertical-card is-mobile">

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

      {/* Texto centrado debajo */}
      <div className="vcard__footer">
        <h2 className="vcard__name">{name}</h2>
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