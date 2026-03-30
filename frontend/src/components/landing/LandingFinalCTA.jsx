import React, { useEffect, useRef, useState } from "react";
import "./css/landing-final-cta.css";

const IMAGES = [
  "/multimedia/thefolder-gif.gif",
];

export default function LandingFinalCTA({ onCtaClick }) {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`tf-finalCta ${inView ? "is-in" : ""}`}
    >

      {/* ===== FILA DE IMÁGENES — todo el ancho, sin gap ===== */}
      <div className="tf-finalCta__imgRow">
        {IMAGES.map((src, i) => (
          <div key={i} className="tf-finalCta__imgCell">
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      {/* ===== THEFOLDER/ — tipografía gigante ===== */}
      <div className="tf-finalCta__brand tf-reveal" style={{ "--d": "0ms" }}>
        THEFOLDER/
      </div>

      {/* ===== GRID 12 cols — texto descriptivo + CTA ===== */}
      <div className="tf-finalCta__grid">

        {/* Texto descriptivo — cols 1-5 */}
        <p className="tf-finalCta__desc tf-reveal" style={{ "--d": "120ms", gridColumn: "1 / 4" }}>
          El directorio que reúne todo el talento emergente en moda [ estilismo,
          dirección creativa,
          fotografía,
          muah,
          diseño,
          & + ]. Filtra. Conecta. Encuentra a tu equipo.
          / HOW / Publica tus fotos de portfolio y edita tu info de CV. 
          Tu link estará listo para compartir con marcas y agencias.
        </p>

        {/* Texto descriptivo — cols 8-10 */}
        <p className="tf-finalCta__desc tf-reveal" style={{ "--d": "120ms" }}>
          / ABOUT / Creamos herramientas para creativos de moda que necesitan
          mostrar su trabajo de forma profesional. / WHY / Para que el diseño, la técnica
          o el formato no sean un obstáculo para acceder a la industria.
        </p>

      </div>

      {/* ===== CTA centrado ===== */}
      <div className="tf-finalCta__cta">
        <button
          type="button"
          className="tf-finalCta__btn tf-reveal"
          style={{ "--d": "240ms" }}
          onClick={onCtaClick}
        >
          Crea tu perfil <em className="tf-italic">gratis</em>
        </button>
      </div>

    </section>
  );
}