// portfolioTemplates/DaisyFilm/components/OrganizeProjectsOverlay.jsx
// Overlay de organización rápida — mismo chrome que EditAboutOverlay.jsx
// (eao-overlay/eao-panel/eao-header/eao-tabs/eao-close, ver EditAboutOverlay.css)
// con las 2 pestañas de /myprofile/projects ("Páginas del portfolio" y
// "Todos tus proyectos"). El cuerpo es ProjectsOrganizerPanel.jsx montado
// con las mismas opciones que OrganizeProjectsPage.jsx (withPageHeader /
// variant="library"), así que se ve y funciona igual que en el panel, sin
// salir del portfolio. Cada acción persiste al vuelo: solo hay ×.
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import ProjectsOrganizerPanel from "../../../../../components/controlPanel/proyectos/ProjectsOrganizerPanel";
import "../../shared/EditAboutOverlay.css";

export default function OrganizeProjectsOverlay({ onClose, pagesEnabled = true }) {
  const { t } = useTranslation("profile");
  // Classic no tiene páginas de portfolio propias (ver QuickActions.jsx) —
  // ni pestaña "Páginas del portfolio" aquí ni, dentro de ProjectsOrganizerPanel,
  // el picker "mover a página" en "Todos los proyectos".
  const TABS = pagesEnabled ? ["pages", "unassigned"] : ["unassigned"];
  const [activeTab, setActiveTab] = useState(pagesEnabled ? "pages" : "unassigned");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="eao-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("editProfile.nav.projects")}
    >
      <div className="eao-panel eao-panel--organizer" onClick={(e) => e.stopPropagation()}>
        <div className="eao-header">
          <div className="eao-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`eao-tab${activeTab === tab ? " is-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(tab === "pages" ? "editProfile.nav.portfolioPages" : "editProfile.nav.allProjects")}
              </button>
            ))}
          </div>

          <div className="eao-header-actions">
            {/* Cada acción ya persiste al vuelo y los botones de cada pestaña
                (Reordenar, Nueva página, Seleccionar...) van en su propia
                cabecera, como en /myprofile/projects: aquí solo la ×. */}
            <button type="button" className="eao-close" onClick={onClose} aria-label={t("common:actions.close")}>
              <X size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mismo cuerpo que /myprofile/projects (OrganizeProjectsPage.jsx):
            "Páginas" con su cabecera del panel (withPageHeader) y "Todos tus
            proyectos" con la vista nueva de "Tus proyectos" (variant="library"). */}
        <div className="eao-body eao-body--organizer">
          {activeTab === "unassigned" ? (
            <ProjectsOrganizerPanel key="unassigned" activeTab="unassigned" pagesEnabled={pagesEnabled} variant="library" />
          ) : (
            <ProjectsOrganizerPanel key="pages" activeTab="pages" pagesEnabled={pagesEnabled} withPageHeader />
          )}
        </div>
      </div>
    </div>
  );
}
