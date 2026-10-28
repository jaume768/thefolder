// src/components/controlPanel/editProfile/templates/TemplateThumbnail.jsx
import React, { useEffect, useRef, useState } from "react";
import { clImg } from "../../../../utils/optimizeImage";

// Composición estática (no iframe, por rendimiento) de cada layout de perfil,
// usando las primeras imágenes reales del usuario en vez de bloques grises
// abstractos. Reutiliza tal cual las clases .ulp-*/.ux-layout-preview que ya
// existían en HomeTab.jsx (definidas en UserProfileExtern.css, que no se
// toca) — aquí solo se les añade una <img> real dentro de cada hueco; sin
// imagen disponible, el div se queda vacío y el fondo gris de esa clase hace
// de placeholder, igual que antes.
// Página de escritorio en miniatura: se maqueta a tamaño real (1440 × 900,
// los mismos px que la plantilla) y se escala al ancho de la tarjeta. Así la
// miniatura es la plantilla de verdad en pequeño (mismas fuentes, tamaños y
// aire), no un dibujo con barras grises.
const PAGE_W = 1440;
const PAGE_H = 900;

function MiniPage({ className, children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setScale(el.clientWidth / PAGE_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      <div className="tpm-page" style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

// Nombre de muestra cuando no hay usuario (página pública /templates).
const SAMPLE_NAME = "María González Alonso";

export default function TemplateThumbnail({ templateId, images = [], titles = [], name = "", className = "" }) {
  const displayName = String(name || "").trim() || SAMPLE_NAME;
  const pics = images.filter(Boolean);
  const img = (i) => (pics.length ? clImg.post(pics[i % pics.length]) : null);
  const rootClass = (base) => `${base} ${className}`.trim();

  const Slot = ({ index, className, style }) => {
    const src = img(index);
    return <div className={className} style={style}>{src && <img src={src} alt="" loading="lazy" />}</div>;
  };

  if (templateId === "studio-gallery") {
    // Rebeca's Gallery real (RebecasGalleryTemplate.css): pestañas arriba a
    // la derecha (11px, mayúsculas, gris; la activa negra), nombre grande en
    // mayúsculas alineado a la izquierda a 24vh del borde, y grid de 4
    // columnas sin hueco con fotos 3.5:4 y el título debajo.
    return (
      <MiniPage className={rootClass("ux-layout-preview tpm tpm--rg")}>
        <div className="tpm-rg-tabs">
          <span className="tpm-rg-tab is-active">Portfolio</span>
          <span className="tpm-rg-tab">About</span>
          <span className="tpm-rg-tab">Contact</span>
        </div>
        <div className="tpm-rg-header">
          <span className="tpm-rg-name">{displayName}</span>
        </div>
        <div className="tpm-rg-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tpm-rg-card">
              <Slot index={i} className="tpm-rg-img" />
              <span className="tpm-rg-title">{titles.length ? titles[i % titles.length] : ""}</span>
            </div>
          ))}
        </div>
      </MiniPage>
    );
  }

  if (templateId === "index-gallery") {
    // June Stamp real: .js-sidebar a la izquierda (nombre + nav vertical)
    // + .js-stage a la derecha — aquí como grid de 3 columnas x 2 filas,
    // todas las tarjetas del mismo tamaño (ver JuneStampTemplate.css).
    // Clases .jst-* propias de este thumbnail (UserProfileExtern.css) —
    // no reutiliza .ulp-*, pensadas para Classic/Daisy Film.
    return (
      <div className={rootClass("ux-layout-preview ux-layout-preview--index")}>
        <div className="jst-body">
          <div className="jst-sidebar">
            <span className="jst-name" />
            <div className="jst-nav">
              <span className="jst-nav-item" style={{ width: "70%" }} />
              <span className="jst-nav-item" style={{ width: "50%" }} />
              <span className="jst-nav-item" style={{ width: "60%" }} />
            </div>
          </div>
          <div className="jst-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <Slot key={i} index={i} className="jst-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "daisy-film") {
    // Daisy Film real (DaisyFilmTemplate.css): fondo #fdfdfd, letra mono,
    // menú arriba (14px, mayúsculas, repartido en 1100px, el activo
    // subrayado) y una sola columna centrada de fotos enteras (contain, 350px
    // de alto) con 64px de aire entre ellas.
    return (
      <MiniPage className={rootClass("ux-layout-preview tpm tpm--df")}>
        <div className="tpm-df-top">
          <span className="tpm-df-nav is-active">Portfolio</span>
          <span className="tpm-df-nav">About</span>
          <span className="tpm-df-nav">Contact</span>
        </div>
        <div className="tpm-df-stack">
          {[0, 1, 2].map((i) => (
            <Slot key={i} index={i} className="tpm-df-item" />
          ))}
        </div>
      </MiniPage>
    );
  }

  // "default" / Classic
  return (
    <div className={rootClass("ux-layout-preview ux-layout-preview--default")}>
      <div className="ulp-hero">{img(0) && <img src={img(0)} alt="" loading="lazy" />}</div>
      <div className="ulp-content">
        <div className="ulp-sidebar ulp-centered">
          <div className="ulp-line" />
          <div className="ulp-line ulp-line--short" />
        </div>
        <div className="ulp-grid ulp-grid--masonry">
          <Slot index={1} className="ulp-thumb ulp-thumb--tall" />
          <Slot index={2} className="ulp-thumb" />
          <Slot index={3} className="ulp-thumb ulp-thumb--tall" />
          <Slot index={0} className="ulp-thumb" />
        </div>
      </div>
    </div>
  );
}
