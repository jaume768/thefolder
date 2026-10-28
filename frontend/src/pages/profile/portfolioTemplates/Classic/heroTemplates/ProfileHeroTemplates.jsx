// ProfileHeroTemplates.jsx
import React from "react";

// DESKTOP
import D_FullscreenAlt from "./templates/desktop/D_FullscreenAlt";
import D_Fullscreen from "./templates/desktop/D_Fullscreen";
import D_Centered from "./templates/desktop/D_Centered";
import D_VerticalEditorial from "./templates/desktop/D_VerticalEditorial";
import D_VerticalCentered from "./templates/desktop/D_VerticalCentered";
import D_SplitTop from "./templates/desktop/D_SplitTop";

// MOBILE
import M_Fullscreen from "./templates/mobile/M_Fullscreen";
import M_FullscreenAlt from "./templates/mobile/M_FullscreenAlt";
import M_SplitImage from "./templates/mobile/M_SplitImage";
import M_VerticalCard from "./templates/mobile/M_VerticalCard";

// CSS
import "./styles/hero.base.css";
import "./styles/hero.fullscreen.css";
import "./styles/hero.fullscreen-alt.css";
import "./styles/hero.centered.css";
import "./styles/hero.vertical-editorial.css";
import "./styles/hero.vertical-centered.css";
import "./styles/hero.split-top.css";
import "./styles/hero.split-image.css";
import "./styles/hero.vertical-card.css";

// focus: punto de enfoque { x, y } (%) de la portada, elegido en el diálogo
// "Imagen de portada" de /myprofile/edit/templates. Sin él, cada hero usa su
// encuadre de siempre (algunos "top center", ver styles/*.css).
const isValidFocus = (f) => Number.isFinite(f?.x) && Number.isFinite(f?.y);

export default function ProfileHeroTemplates({ templateId, view = "desktop", isPreview, focus, ...props }) {
  const id = templateId || "fullscreen";

  // ── MOBILE ───────────────────────────────────────────────────────────────
  const hero = (() => {
    if (view === "mobile") {
      switch (id) {
        case "fullscreen":
          return <M_Fullscreen {...props} templateId={id} view={view} />;
        case "fullscreen-alt":
          return <M_FullscreenAlt {...props} templateId={id} view={view} />;
        case "split-image":
          return <M_SplitImage {...props} templateId={id} view={view} />;
        case "vertical-card":
          return <M_VerticalCard {...props} templateId={id} view={view} />;
        // Plantillas solo desktop → caen en M_Fullscreen
        default:
          return <M_Fullscreen {...props} templateId={id} view={view} />;
      }
    }

    // ── DESKTOP ────────────────────────────────────────────────────────────
    switch (id) {
      case "fullscreen-alt":
        return <D_FullscreenAlt {...props} templateId={id} view={view} />;
      case "fullscreen":
        return <D_Fullscreen {...props} templateId={id} view={view} />;
      case "centered":
        return <D_Centered {...props} templateId={id} view={view} />;
      case "vertical-editorial":
        return <D_VerticalEditorial {...props} templateId={id} view={view} />;
      case "vertical-centered":
        return <D_VerticalCentered {...props} templateId={id} view={view} />;
      case "split-top":
        return <D_SplitTop {...props} templateId={id} view={view} />;
      default:
        return <D_Fullscreen {...props} templateId={id} view={view} />;
    }
  })();

  // Envuelve solo dentro del iframe de ProfileAppearanceTab.jsx (?preview=1):
  // .hero usa height:100dvh, y dvh dentro de un <iframe> anidado tiene bugs
  // documentados en varios motores donde resuelve contra el viewport de la
  // ventana de NIVEL SUPERIOR en vez del viewport propio del iframe — dentro
  // de .pat-preview-frame--mobile (iframe angosto, ~300-600px) eso hacía que
  // .hero calculara su alto contra la ventana real del navegador (mucho más
  // alta), renderizando más grande que el propio marco de teléfono. .hero-preview-scope
  // fuerza 100vh (sin el comportamiento "dinámico" de dvh, pero tampoco su bug
  // de anidado) SOLO aquí — el perfil real (sin iframe) sigue con 100dvh tal cual.
  // Punto de enfoque: variable CSS en un envoltorio display:contents (no
  // cambia el layout del hero); hero.base.css la aplica a la imagen de
  // cualquier plantilla como object-position.
  const focused = isValidFocus(focus) ? (
    <div className="hero-focus" style={{ "--hero-focus": `${focus.x}% ${focus.y}%` }}>
      {hero}
    </div>
  ) : hero;

  if (!isPreview) return focused;
  return <div className="hero-preview-scope">{focused}</div>;
}