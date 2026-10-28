// portfolioTemplates/JuneStamp/components/Sidebar.jsx
// Identidad + navegación persistente de June Stamp — antes (IdentitySidebar.jsx)
// solo mostraba identidad y un toggle local Portfolio/CV; ahora hace también
// el trabajo de TopBar.jsx en DaisyFilm: Portfolio / About / Contact / cada
// página organizada son enlaces reales (mismas URLs que el resto de la web:
// /:username, /:username/about, /:username/contact, /:username/:pageSlug),
// no un estado local que se pierde al recargar o compartir el link.
import React from "react";
import { Link } from "react-router-dom";

// page.name es texto libre del dueño del perfil (/myprofile/projects) — si
// lo escribió en mayúsculas, CSS text-transform:capitalize no lo "arregla"
// (solo mayúsculiza la primera letra, no toca el resto), así que aquí se
// normaliza a title case antes de pintarlo en el nav. No toca el nombre
// guardado, solo cómo se muestra.
const toTitleCase = (str = "") =>
  str.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export default function Sidebar({
  displayName,
  location,
  locations = [],
  profile,
  viewMode,
  setMode,
  portfolioPages,
  username,
  projectOpen,
  projectInPortfolio = false,
  activePageSlug,
  projectInfo = null,
}) {
  const pages = Array.isArray(portfolioPages)
    ? portfolioPages.filter((p) => p?.slug && Array.isArray(p.posts) && p.posts.length > 0)
    : [];

  return (
    <aside className="js-sidebar">
      {/* Proyecto abierto: su miga de pan + texto (projectInfo, desde
          JuneStampTemplate.jsx) en el sitio de la info del portfolio. */}
      <div className="js-sidebar-top">
      {projectInfo || (
        <>
        <div className="js-identity">
          <h1 className="js-identity-heading">
            <button type="button" className="js-name" onClick={() => setMode("portfolio")}>
              {displayName}
            </button>
          </h1>
        </div>

        {(profile?.biography || profile?.bio) && (
          <p className="js-bio">{profile.biography || profile.bio}</p>
        )}

        <div className="js-meta">
          {Array.isArray(profile?.profileHeadlines) &&
            profile.profileHeadlines.filter(Boolean).length > 0 && (
              <p className="js-role">
                {profile.profileHeadlines.filter(Boolean).slice(0, 2).map((headline, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="js-role__sep">&amp;</span>}
                    <span>{headline}</span>
                  </React.Fragment>
                ))}
              </p>
            )}

          {/* Varias ubicaciones: sin separador, solo el gap de .js-location */}
          {locations.length > 0 ? (
            <p className="js-location">
              {locations.map((loc) => <span key={loc}>{loc}</span>)}
            </p>
          ) : location && <p className="js-location">{location}</p>}
        </div>

        </>
      )}
      </div>

      {/* Con un proyecto abierto (projectInfo), la sección a la que pertenece
          se convierte en el "volver": "Back to portfolio" o "Back to
          {página}", en su mismo sitio del menú. */}
      <nav className="js-nav">
        <button
          type="button"
          className={`js-nav-btn${(viewMode === "portfolio" && !projectOpen) || projectInPortfolio ? " js-nav-btn--active" : ""}`}
          onClick={() => setMode("portfolio")}
        >
          {projectInfo && projectInPortfolio ? "Back to portfolio" : "Portfolio"}
        </button>

        {username && pages.map((page) => (
          <Link
            key={page._id}
            to={`/${username}/${page.slug}`}
            className={`js-nav-btn${page.slug === activePageSlug ? " js-nav-btn--active" : ""}`}
          >
            {projectInfo && page.slug === activePageSlug
              ? `Back to ${toTitleCase(page.name)}`
              : toTitleCase(page.name)}
          </Link>
        ))}

        <button
          type="button"
          className={`js-nav-btn${viewMode === "about" && !projectOpen ? " js-nav-btn--active" : ""}`}
          onClick={() => setMode("about")}
        >
          CV
        </button>

        <button
          type="button"
          className={`js-nav-btn${viewMode === "contact" && !projectOpen ? " js-nav-btn--active" : ""}`}
          onClick={() => setMode("contact")}
        >
          Contact
        </button>
      </nav>
    </aside>
  );
}
