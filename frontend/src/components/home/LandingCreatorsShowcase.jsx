import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/landing-creators-showcase.css";

export default function LandingCreatorsShowcase({
  explorePath = "/creatives",
  onRegisterClick, // ✅ NUEVO: abre modal registro
  creators = [
    {
      slug: "ana-vega",
      name: "Lolo Vega",
      role: "FOTÓGRAFO",
      imgDesktop: "/multimedia/polaroid1.jpg",
      imgMobile: "/multimedia/templates-3m.png",
    },
    {
      slug: "maria-cappone",
      name: "María Coppola",
      role: "ESTILISTA",
      imgDesktop: "/multimedia/polaroid2.jpg",
      imgMobile: "/multimedia/templates-1m.png",
    },
    {
      slug: "nava-rose",
      name: "Nava Rose",
      role: "DIRECCIÓN CREATIVA",
      imgDesktop: "/multimedia/polaroid3.jpg",
      imgMobile: "/multimedia/templates-2m.png",
    },
  ],
}) {
  const navigate = useNavigate();
  const goProfile = (slug) => navigate(`${explorePath}/${slug}`);

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
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`tf-creators ${inView ? "is-in" : ""}`}
    >
      {/* ===== COPY MOBILE ===== */}
      <div className="tf-creators__cta tf-creators__cta--mobile">
        <h2
          className="tf-creators__headlineMobile tf-reveal"
          style={{ ["--d"]: "0ms" }}
        >
          TODO EL TALENTO
          <br />
          EMERGENTE EN MODA
        </h2>

        <p
          className="tf-sub tf-only-mobile tf-reveal"
          style={{ ["--d"]: "120ms" }}
        >
          En un mismo espacio.
          <br />
          Descubre creativos y filtra por especialidad para encontrar a tu próximo equipo.
        </p>
      </div>

      {/* ===== CARDS ===== */}
      <div className="tf-creators__row" aria-label="Perfiles destacados">
        {creators.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            className="tf-creatorCard tf-reveal"
            style={{ ["--d"]: `${160 + i * 110}ms` }}
            onClick={() => goProfile(c.slug)}
            aria-label={`Ver perfil de ${c.name}`}
          >
            <div className="tf-creatorCard__media">
              <div className="tf-creatorCard__img tf-creatorCard__img--single">
                <img
                  className="tf-img tf-img--mobile"
                  src={c.imgMobile || c.imgDesktop}
                  alt=""
                  loading="lazy"
                />

                <img
                  className="tf-img tf-img--desktop"
                  src={c.imgDesktop}
                  alt=""
                  loading="lazy"
                />
              </div>
            </div>

            <div className="tf-creatorCard__meta">
              <div className="tf-creatorCard__nameRow">
                <h3 className="tf-creatorCard__name">{c.name}</h3>
              </div>
              <p className="tf-creatorCard__role">{c.role}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ===== COPY DESKTOP ===== */}
      <div className="tf-creators__cta tf-creators__cta--desktop">
        <h2 className="tf-link__title">
          <span className="tf-reveal" style={{ ["--d"]: "0ms" }}>
            DESCUBRE TODO EL TALENTO EMERGENTE
          </span>
          <br />
          <span className="tf-reveal" style={{ ["--d"]: "90ms" }}>
            EN UN MISMO LUGAR
          </span>
        </h2>

        <p className="tf-sub tf-reveal" style={{ ["--d"]: "190ms" }}>
          Explora nuevos perfiles y conecta con
          <br />
          creativos de moda.
        </p>

        <div className="tf-creators__actions">
          <button
            type="button"
            className="tf-btn tf-btn--pill tf-reveal"
            style={{ ["--d"]: "310ms" }}
            onClick={() => navigate(explorePath)}
          >
            EXPLORA CREATIVOS
          </button>

          {/* ✅ Antes: navigate(publishPath). Ahora abre modal registro */}
          <button
            type="button"
            className="tf-link__cta tf-reveal"
            style={{ ["--d"]: "390ms" }}
            onClick={onRegisterClick}
          >
            Publica tu perfil <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* ===== CTA MOBILE FOOTER ===== */}
      <div className="tf-creators__footerMobile">
        {/* ✅ Antes: exploraba. Ahora (según tu petición) abre registro */}
        <button
          type="button"
          className="tf-link__cta tf-reveal"
          style={{ ["--d"]: "220ms" }}
          onClick={onRegisterClick}
        >
          Publica tu perfil <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
