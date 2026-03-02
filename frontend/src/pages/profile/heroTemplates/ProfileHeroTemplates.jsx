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

export default function ProfileHeroTemplates({ templateId, view = "desktop", ...props }) {
  const id = templateId || "fullscreen";

  // ── MOBILE ───────────────────────────────────────────────────────────────
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

  // ── DESKTOP ──────────────────────────────────────────────────────────────
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
}