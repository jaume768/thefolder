import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/landing-creators-showcase.css";

export default function LandingCreatorsShowcase({
  explorePath = "/creatives",
  onRegisterClick,
  creators = [
    {
      slug: "ana-vega",
      name: "Sofia Danis",
      role: "FOTOGRAFÍA",
      project: "Valya (2025)",
      imgDesktop: "/multimedia/polaroid1.jpg",
      imgMobile: "/multimedia/templates-3m.png",
      count: "+2",
    },
    {
      slug: "maria-cappone",
      name: "Jemilm",
      role: "TRANSVERSAL / IONES",
      imgDesktop: "/multimedia/polaroid2.jpg",
      imgMobile: "/multimedia/templates-1m.png",
      count: "+4",
    },
    {
      slug: "nava-rose",
      name: "Miriam Reina",
      role: "JAN",
      imgDesktop: "/multimedia/polaroid3.jpg",
      imgMobile: "/multimedia/templates-2m.png",
      count: "+4",
    },
    {
      slug: "jan",
      name: "",
      role: "",
      imgDesktop: "/multimedia/polaroid1.jpg",
      imgMobile: "/multimedia/templates-3m.png",
      count: "",
    },
  ],
}) {
  const navigate = useNavigate();
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
      className={`tf-creators ${inView ? "is-in" : ""}`}
    >

      {/* ===== HEADER — 12 cols =====
          Título: cols 1-4
          Textos derecha: cols 6-12
      */}
      <div className="tf-creators__header">
        <h2 className="tf-creators__title tf-reveal" style={{ "--d": "0ms" }}>
          Explora todas las imágenes<br />subidas por los creativos
        </h2>

        <div className="tf-creators__headerRight">
          <p className="tf-creators__floatText tf-reveal" style={{ "--d": "80ms" }}>
            Guarda tus fotos favoritas
          </p>
          <p className="tf-creators__floatText tf-reveal" style={{ "--d": "160ms" }}>
            Conecta con otros creativos
          </p>
        </div>
      </div>

      {/* ===== FILA 4 IMÁGENES — sin gap, todo el ancho ===== */}
      <div className="tf-creators__row" aria-label="Perfiles destacados">
        {creators.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            className={`tf-creatorCard tf-reveal tf-creatorCard--${i}`}
            style={{ "--d": `${200 + i * 80}ms` }}
            onClick={() => navigate(`/profile/${c.slug}`)}
            aria-label={`Ver perfil de ${c.name}`}
          >
            <div className="tf-creatorCard__imgWrap">
              <img
                className="tf-img tf-img--desktop"
                src={c.imgDesktop}
                alt=""
                loading="lazy"
              />
              <img
                className="tf-img tf-img--mobile"
                src={c.imgMobile || c.imgDesktop}
                alt=""
                loading="lazy"
              />
              {c.count && (
                <span className="tf-creatorCard__count">{c.count}</span>
              )}
            </div>

            <div className="tf-creatorCard__meta">
              {c.name && (
                <div className="tf-creatorCard__nameRow">
                  <h3 className="tf-creatorCard__name">{c.name}</h3>
                </div>
              )}
              {c.role && <p className="tf-creatorCard__role">{c.role}</p>}
            </div>
          </button>
        ))}
      </div>

    </section>
  );
}
