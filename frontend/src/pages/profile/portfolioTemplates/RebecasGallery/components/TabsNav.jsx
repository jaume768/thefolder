// portfolioTemplates/RebecasGallery/components/TabsNav.jsx
// Nav fija (rg-tabs) — misma arquitectura que TopBar.jsx (DaisyFilm) /
// Sidebar.jsx (JuneStamp): Portfolio / cada página organizada / About /
// Contact son enlaces reales a su propia URL, no un estado local de pestaña.
import React from "react";
import { Link } from "react-router-dom";

export default function TabsNav({ viewMode, setMode, portfolioPages, username, projectOpen, activePageSlug }) {
  const pages = Array.isArray(portfolioPages)
    ? portfolioPages.filter((p) => p?.slug && Array.isArray(p.posts) && p.posts.length > 0)
    : [];

  return (
    <nav className="rg-tabs">
      <button
        type="button"
        className={`rg-tab ${viewMode === "portfolio" && !projectOpen ? "rg-tab--active" : ""}`}
        onClick={() => setMode("portfolio")}
      >
        Portfolio
      </button>

      {username && pages.map((page) => (
        <Link
          key={page._id}
          to={`/${username}/${page.slug}`}
          className={`rg-tab ${page.slug === activePageSlug ? "rg-tab--active" : ""}`}
        >
          {page.name}
        </Link>
      ))}

      <button
        type="button"
        className={`rg-tab ${viewMode === "about" && !projectOpen ? "rg-tab--active" : ""}`}
        onClick={() => setMode("about")}
      >
        About
      </button>

      <button
        type="button"
        className={`rg-tab ${viewMode === "contact" && !projectOpen ? "rg-tab--active" : ""}`}
        onClick={() => setMode("contact")}
      >
        Contact
      </button>
    </nav>
  );
}
