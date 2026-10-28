// components/controlPanel/editProfile/ui/PanelPageHeader.jsx
// Cabecera común de las páginas del panel (todas las de .nep-desktop-groups,
// sus sub-páginas y Ajustes; no el home). Plantilla: la cabecera de "Tus
// proyectos" (.pl-head) — título + subtítulo a la izquierda y TODOS los
// botones de la página a la derecha (gris secundario, negro el principal).
//
// Botones desde dentro de la página: <PageHeaderActions> los "sube" a la
// cabecera con un portal (p. ej. el estado de autoguardado de Info/CV/Redes,
// que vive dentro del formulario). Fuera de una página con cabecera (el
// overlay de DaisyFilm, que reutiliza ProjectsOrganizerPanel) no hay destino
// y se pintan donde estaban, sin cambios.
//
// Sub-páginas (`back = { parent, label, onClick, current? }`): se registran
// en el shell (PanelShellContext → subPage) y en desktop el "volver" vive en
// el sidebar — la sección padre (`parent`: "saved" | "proyectos" | "diseno")
// vuelve atrás al hacer clic y lleva colgada la sub-página (`current`, por
// defecto el título si es texto). En tablet/mobile, la ← encima del título
// (.nep-ph-back). El CSS enseña la que toca.
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import { usePanelShellBinding } from "../../../../contexts/PanelShellContext";
import "./PanelPageHeader.css";

const PageHeaderSlotContext = createContext(null);

// Envuelve la página: guarda el nodo DOM de la zona de botones de su cabecera.
export function PageHeaderProvider({ children }) {
  const [slot, setSlot] = useState(null);
  return (
    <PageHeaderSlotContext.Provider value={{ slot, setSlot }}>
      {children}
    </PageHeaderSlotContext.Provider>
  );
}

// Botones que deben ir a la cabecera de la página. `fallback` decide qué
// pasa sin cabecera: "inline" (por defecto) los pinta en su sitio.
export function PageHeaderActions({ children, fallback = "inline" }) {
  const ctx = useContext(PageHeaderSlotContext);
  if (ctx?.slot) return createPortal(children, ctx.slot);
  if (ctx && !ctx.slot) return null; // la cabecera aún se está montando
  return fallback === "inline" ? children : null;
}

// Hay cabecera de página con zona de botones disponible.
export function useHasPageHeader() {
  return !!useContext(PageHeaderSlotContext);
}

export default function PanelPageHeader({ title, subtitle, eyebrow, actions, back, className = "" }) {
  const ctx = useContext(PageHeaderSlotContext);
  const { setSubPage } = usePanelShellBinding();

  // onClick puede cambiar en cada render (closures de la página): se lee
  // del ref en el momento del clic, así el registro no se rehace por eso.
  const backRef = useRef(back);
  backRef.current = back;
  const parent = back?.parent;
  const backLabel = back?.label;
  const current = back?.current ?? (typeof title === "string" ? title : "");

  useEffect(() => {
    if (!parent) return undefined;
    setSubPage({ parent, current, label: backLabel, onBack: () => backRef.current?.onClick?.() });
    return () => setSubPage(null);
  }, [parent, current, backLabel, setSubPage]);

  const backLink = back && (
    <button type="button" className="nep-ph-back" onClick={back.onClick} aria-label={back.label}>
      <ArrowLeft size={20} strokeWidth={1.6} aria-hidden="true" />
    </button>
  );

  return (
    <header className={`nep-ph ${className}`.trim()}>
      <div className="nep-ph-text">
        {eyebrow && <div className="nep-ph-eyebrow">{eyebrow}</div>}
        {!eyebrow && backLink && <div className="nep-ph-eyebrow nep-ph-eyebrow--back">{backLink}</div>}
        {title && <h1 className="nep-ph-title">{title}</h1>}
        {subtitle && <p className="nep-ph-subtitle">{subtitle}</p>}
      </div>
      <div className="nep-ph-actions" ref={ctx?.setSlot}>
        {actions}
      </div>
    </header>
  );
}
