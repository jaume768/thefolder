import React, { useEffect, useRef, useState } from "react";
import "./css/landing-final-cta.css";

export default function LandingFinalCTA({ onCtaClick }) {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`tf-finalCta ${inView ? "is-in" : ""}`}
    >
      {/* ===== MANIFIESTO ===== */}
      <div className="tf-manifesto">
        <span className="tf-manifesto__side tf-reveal" style={{ ["--d"]: "0ms" }}>
          CONECTAMOS
        </span>

        <div className="tf-manifesto__center">
          <img
            src="/multimedia/polas-ManelAbella.png"
            alt=""
            className="tf-manifesto__image tf-reveal"
            style={{ ["--d"]: "80ms" }}
            loading="lazy"
          />

          <p
            className="tf-sub tf-reveal"
            style={{ ["--d"]: "240ms" }}
          >
            Creamos herramientas para creativos de moda
            <br />
            que necesitan mostrar su trabajo de forma profesional.
          </p>

          <p
            className="tf-sub tf-reveal"
            style={{ ["--d"]: "320ms" }}
          >
            Sin que el diseño, la técnica o el formato
            <br />
            sean un obstáculo.
          </p>
        </div>

        <span
          className="tf-manifesto__side tf-reveal"
          style={{ ["--d"]: "120ms" }}
        >
          TALENTO
        </span>
      </div>

      {/* ===== CTA FINAL ===== */}
      <div className="tf-finalCta__cta">
        <h2 className="tf-finalCta__title tf-reveal" style={{ ["--d"]: "420ms" }}>
          CV + PORTFOLIO EN MINUTOS
        </h2>

        <p className="tf-sub tf-reveal" style={{ ["--d"]: "520ms" }}>
          Comparte todo tu perfil profesional en un solo link.
          <br />
          Sin conocimientos técnicos.
        </p>

        <button
          type="button"
          className="tf-btn tf-btn--primary tf-finalCta__btn tf-reveal"
          style={{ ["--d"]: "640ms" }}
          onClick={onCtaClick}
        >
          PUBLICA TU PERFIL <em>[GRATIS]</em>
        </button>
      </div>
    </section>
  );
}
