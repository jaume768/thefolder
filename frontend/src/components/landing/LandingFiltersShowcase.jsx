import React, { useEffect, useRef, useState } from "react";
import "./css/landing-filters-showcase.css";

const FILTERS = [
  {
    id: "f1",
    text: "Fotografía + Copenhage + #backstage",
    img: "/multimedia/polaroid1.jpg",
    imgPos: "bottom", // imagen abajo derecha
  },
  {
    id: "f2",
    text: "Makeup + Valencia + #testshoot",
    img: "/multimedia/polaroid2.jpg",
    imgPos: "top", // imagen arriba derecha
  },
  {
    id: "f3",
    text: "Diseño moda + Barcelona + #fitting",
    img: "/multimedia/polaroid3.jpg",
    imgPos: "center", // imagen centro derecha
  },
];

export default function LandingFilterShowcase() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 cuando entra, 1 cuando sale
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - vh)));
      const index = Math.min(
        FILTERS.length - 1,
        Math.floor(progress * FILTERS.length)
      );
      setActiveIndex(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // altura 300vh para que haya scroll suficiente dentro
    <div className="tf-filter-scroll" ref={sectionRef}>
      {/* sticky container — 100vh */}
      <div className="tf-filter-sticky">

       {/* TEXTO — izquierda */}
        <div className="tf-filter__text">
          {FILTERS.map((f, i) => (
            <p
              key={f.id}
              className={`tf-filter__line ${i === activeIndex ? "is-active" : ""}`}
            >
              {f.text}
            </p>
          ))}

          {/* Filtra a tu gusto — centro */}
          <p className="tf-filter__sub">Filtra a tu gusto</p>

          {/* Ubicación / Especialidad / Experiencia */}
          <div className="tf-filter__tags">
            <span>Ubicación</span>
            <span>Especialidad</span>
            <span>Experiencia</span>
          </div>
        </div>

        {/* IMÁGENES — derecha, posiciones fijas */}
        <div className="tf-filter__images">
          {FILTERS.map((f, i) => (
            <div
              key={f.id}
              className={`tf-filter__img tf-filter__img--${f.imgPos} ${i === activeIndex ? "is-active" : ""}`}
            >
              <img src={f.img} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}