// portfolioTemplates/shared/HeroSlideshow.jsx
// Carrusel "gif" de portada — desliza una foto al lado de la otra cada 4s,
// en bucle, sin contador ni controles visibles. Antes vivía duplicado tal
// cual en DaisyFilm/components/AboutPage.jsx (dentro del CV) y en
// JuneStamp/components/ContactPage.jsx (mismo componente, solo que June
// Stamp lo mueve a Contacto en vez de About) — mismo comportamiento en las
// dos, así que vive en un solo sitio.
//
// `baseClass` fija el namespace de CSS de cada plantilla (ej.
// "df-about__cv-slideshow", "js-contact__cv-slideshow"): el wrapper usa
// baseClass tal cual, el track y cada imagen añaden los sufijos
// "-track"/"-img" — así cada plantilla conserva su propio bloque de reglas
// CSS sin tocar nada aquí.
//
// Truco de loop sin salto: se clona la primera foto al final de la tira
// para que el paso de la última a la primera también se deslice; al llegar
// a esa copia se desactiva la transición un frame (requestAnimationFrame) y
// se recoloca al índice 0 — imperceptible porque ambos frames son la misma
// imagen.
import React, { useEffect, useState } from "react";
import { clImg } from "../../../../utils/optimizeImage";

export default function HeroSlideshow({ images = [], baseClass }) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  const hasLoop = images.length > 1;
  const slides = hasLoop ? [...images, images[0]] : images;

  useEffect(() => {
    if (!hasLoop) return undefined;
    const id = setInterval(() => setIndex((i) => i + 1), 4000);
    return () => clearInterval(id);
  }, [hasLoop, images]);

  useEffect(() => {
    if (animate) return undefined;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const handleTransitionEnd = () => {
    if (index === images.length) {
      setAnimate(false);
      setIndex(0);
    }
  };

  if (!images.length) return null;

  return (
    <div className={baseClass}>
      <div
        className={`${baseClass}-track`}
        onTransitionEnd={handleTransitionEnd}
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(index * 100) / slides.length}%)`,
          transition: animate ? "transform 0.6s ease" : "none",
        }}
      >
        {slides.map((src, i) => (
          <img
            key={i}
            src={clImg.heroSlide(src)}
            alt=""
            className={`${baseClass}-img`}
            style={{ width: `${100 / slides.length}%` }}
          />
        ))}
      </div>
    </div>
  );
}
