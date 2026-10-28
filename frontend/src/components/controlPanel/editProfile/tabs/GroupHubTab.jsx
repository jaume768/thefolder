// components/controlPanel/editProfile/tabs/GroupHubTab.jsx
// "Pre-page" de un grupo del sidebar (Perfil/Proyectos/Herramientas) — al
// hacer clic en el .nep-folder-header de un grupo con varios hijos ya no se
// despliega el acordeón inline (ver PanelSidebar.jsx), navega aquí: grid de
// hasta 3 casillas cuadradas (nunca más de 3 hijos por grupo), 1 fila x 3
// columnas — icono centrado, texto debajo, flecha abajo-derecha, badge
// "soon" arriba-izquierda.
import React from "react";
import { ArrowRight } from "lucide-react";

export default function GroupHubTab({ items }) {
  return (
    <nav className="nep-hub-list">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`nep-hub-item${item.soon ? " nep-nav-item--soon" : ""}`}
          onClick={item.onClick}
        >
          {item.soon && <span className="nep-soon-badge">soon</span>}
          {/* Tamaño por breakpoint en .nep-hub-item-icon (editProfileShell.css) */}
          <item.icon size={32} strokeWidth={1.2} aria-hidden="true" className="nep-hub-item-icon" />
          <span className="nep-label-text">{item.label}</span>
          {item.description && <span className="nep-hub-item-desc">{item.description}</span>}
          {/* Misma flecha que "Tus proyectos" del home (20px, mismo desplazamiento al hover), del color del título */}
          <ArrowRight size={20} strokeWidth={1.6} aria-hidden="true" className="nep-hub-item-chevron" />
        </button>
      ))}
    </nav>
  );
}
