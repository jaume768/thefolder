// portfolioTemplates/RebecasGallery/components/Header.jsx
import React from "react";

export default function Header({ displayName, profileHeadlines }) {
  return (
    <header className="rg-header">
      <h1 className="rg-name">{displayName}</h1>

      {Array.isArray(profileHeadlines) && profileHeadlines.filter(Boolean).length > 0 && (
        <p className="rg-role">{profileHeadlines.filter(Boolean).slice(0, 2).join(" & ")}</p>
      )}
    </header>
  );
}
