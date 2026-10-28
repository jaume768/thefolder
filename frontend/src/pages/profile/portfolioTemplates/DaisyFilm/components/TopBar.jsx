// portfolioTemplates/DaisyFilm/components/TopBar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TopBar({ viewMode, setMode, portfolioPages, username, projectOpen, activePageSlug }) {
  const pages = Array.isArray(portfolioPages)
    ? portfolioPages.filter((p) => p?.slug && Array.isArray(p.posts) && p.posts.length > 0)
    : [];

  return (
    <div className="df-top">
      <button
        type="button"
        className={`df-nav-btn${viewMode === "portfolio" && !projectOpen ? " df-nav-btn--active" : ""}`}
        onClick={() => setMode("portfolio")}
      >
        Portfolio
      </button>

      {username && pages.map((page) => (
        <Link
          key={page._id}
          to={`/${username}/${page.slug}`}
          className={`df-nav-btn${page.slug === activePageSlug ? " df-nav-btn--active" : ""}`}
        >
          {page.name}
        </Link>
      ))}

      <button
        type="button"
        className={`df-nav-btn${viewMode === "about" && !projectOpen ? " df-nav-btn--active" : ""}`}
        onClick={() => setMode("about")}
      >
        About
      </button>

      <button
        type="button"
        className={`df-nav-btn${viewMode === "contact" && !projectOpen ? " df-nav-btn--active" : ""}`}
        onClick={() => setMode("contact")}
      >
        Contact
      </button>
    </div>
  );
}
