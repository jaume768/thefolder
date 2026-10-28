import React, { createContext, useContext } from "react";

// Puente entre PanelShellLayout.jsx (dueño del PanelSidebar compartido) y
// ProfileEditPage.jsx (única página con tabs/mobile-detail que el sidebar
// persistente necesita reflejar). Ver PanelShellLayout.jsx.
//
// subPage: la sub-página abierta (carpeta de Guardados, página de portfolio,
// editor de proyecto, plantilla abierta en Diseño) — la registra
// PanelPageHeader cuando recibe `back`. El sidebar la cuelga de su sección
// padre y el clic en esa sección vuelve atrás (ver PanelSidebar.jsx).
// { parent: "saved" | "proyectos" | "diseno", current, label, onBack } | null
const PanelShellContext = createContext({
  binding: {},
  setBinding: () => {},
  subPage: null,
  setSubPage: () => {},
});

export const PanelShellProvider = ({ children, value }) => (
  <PanelShellContext.Provider value={value}>
    {children}
  </PanelShellContext.Provider>
);

export const usePanelShellBinding = () => useContext(PanelShellContext);
