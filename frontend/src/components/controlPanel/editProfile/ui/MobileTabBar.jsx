import React from "react";

// Barra de pestañas inferior — solo mobile (ver editProfileShell.css), en
// todas las páginas del panel. Sustituye al antiguo índice 2×2 del sidebar:
// mismos 6 destinos, iconos y orden que el rail de desktop. Los items y su
// navegación/estado activo los arma PanelSidebar.jsx (misma lógica go()/
// isTab() que el rail), aquí solo se pintan — los grupos navegan directo a
// su pre-page, sin flyouts.
export default function MobileTabBar({ items }) {
  return (
    <nav className="nep-tabbar">
      {items.map(({ key, icon: Icon, mark, label, active, onClick }) => (
        <button
          key={key}
          type="button"
          className={`nep-tabbar-item${mark ? " nep-tabbar-item--mark" : ""}${active ? " active" : ""}`}
          onClick={onClick}
          aria-label={label}
          aria-current={active ? "page" : undefined}
        >
          {/* mark: texto en vez de icono (el "T/" que lleva al explorador) */}
          {mark
            ? <span aria-hidden="true">{mark}</span>
            : <Icon size={20} strokeWidth={1.5} aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
}
