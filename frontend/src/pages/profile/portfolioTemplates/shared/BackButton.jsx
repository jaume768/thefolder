// portfolioTemplates/shared/BackButton.jsx
// Lógica de "volver" común a las 4 plantillas de portfolio (Classic,
// JuneStamp, RebecasGallery, DaisyFilm). El diseño es el mismo círculo
// transparente + chevron-left que .gf-back-btn del panel, pero cada llamador
// pasa su propia clase (className) para no compartir nombre con .gf-back-btn
// del panel (namespaces distintos, mismo look). Por defecto usa .gf-back-btn
// fijo a top/left: 24px del viewport; DaisyFilm pasa su propia variante.
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./BackButton.css";

export default function BackButton({ onClick, fallback = "/explorer", className = "gf-back-btn", tooltip, mark = false }) {
  const navigate = useNavigate();

  const location = useLocation();
  // Anterior dentro de THEFOLDER; si esta es la primera página de la
  // visita (location.key "default"), el destino de reserva.
  const handleClick =
    onClick ||
    (() => {
      if (location.key && location.key !== "default") navigate(-1);
      else navigate(fallback);
    });

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label="Volver"
    >
      {/* mark: "THEFOLDER/" en vertical en vez del chevron — solo lo pide
          df-back-btn (QuickActions.jsx), como recordatorio de que vuelve a
          /explorer, no a "atrás" genérico. */}
      {mark ? (
        <span className="df-back-mark" aria-hidden="true">
          <span className="df-back-mark-t">THEFOLDER</span>
          <span className="df-back-mark-slash">/</span>
        </span>
      ) : (
        <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
      )}
      {tooltip && <span className="nep-icon-tooltip">{tooltip}</span>}
    </button>
  );
}
