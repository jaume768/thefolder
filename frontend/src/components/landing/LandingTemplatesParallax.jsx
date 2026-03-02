// LandingTemplatesParallax.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./css/landing-templates-parallax.css";

export default function LandingTemplatesParallax({ templates }) {
  const sectionRef = useRef(null);
  const rafRef = useRef(null);

  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ITEMS = useMemo(() => {
    const fallback = [
      { id: "t1", src: "/multimedia/Plantilla (4).png", kind: "desktop", label: "Plantilla nº1 horizontal [Ordenador]" },
      { id: "t2", src: "/multimedia/Plantilla (1).png", kind: "mobile",  label: "Plantilla nº1 vertical [Móvil]" },
      { id: "t3", src: "/multimedia/Plantilla (3).png", kind: "desktop", label: "Plantilla nº2 horizontal [Ordenador]", },
      { id: "t4", src: "/multimedia/Plantilla (2).png", kind: "mobile",  label: "Plantilla nº2 vertical [Móvil]", style: "filter:invert(1), brightness(0.9)" },
      { id: "t5", src: "/multimedia/Plantilla (5).png", kind: "desktop", label: "Plantilla nº3 horizontal [Ordenador]" },
      { id: "t6", src: "/multimedia/Plantilla (6).png", kind: "mobile",  label: "Plantilla nº3 vertical [Móvil]" },
    ];
    return templates?.length ? templates : fallback;
  }, [templates]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const el = sectionRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      const total = rect.height + vh;
      const current = vh - rect.top;

      const boost = 1.15;
      const p = Math.min(1, Math.max(0, (current / total) * boost));

      setProgress((prev) => prev + (p - prev) * 0.10);
    };

    const onScroll = () => {
      if (!active) return;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, reducedMotion]);

  const scrubY = (amp, offset = 0) => {
    const t = Math.min(1, Math.max(0, progress));
    const eased = Math.pow(t, 1.35);
    const y = (1 - eased * 2) * amp;
    return reducedMotion ? 0 : y + offset;
  };

  return (
  <section
    ref={sectionRef}
    className={`tf-templates ${active ? "tf-templates--active" : ""}`}
    aria-label="Plantillas"
  >
    <div className="tf-templates__inner">
      <div className="tf-templates__stage" aria-hidden="true">
        <div className="tf-templates__center">
          <div className="tf-templates__centerInner">
            <span className="tf-templates__centerTitle">Elige tu plantilla</span>
            <span className="tf-templates__centerTitle tf-templates__decor">(5)</span>
              <p className="tf-floating-text">
                Adaptadas a Fotografía, Estilismo, Dirección creativa, MUAH y más.
              </p>          
            </div>
        </div>

        <Tile className="tA" item={ITEMS[0]} y={scrubY(320)} z={1} />
        <Tile className="tB" item={ITEMS[1]} y={scrubY(460, -40)} z={3} />
        <Tile className="tC" item={ITEMS[2]} y={scrubY(520, 30)} z={1} />
        <Tile className="tD" item={ITEMS[3]} y={scrubY(580, 15)} z={2} />
        <Tile className="tE" item={ITEMS[4]} y={scrubY(380, -20)} z={2} />
        <Tile className="tF" item={ITEMS[5]} y={scrubY(650, 45)} z={1} />
      </div>

    </div>
  </section>

  );
}

function Tile({ className, item, y = 0, z = 1 }) {
  const kind = item?.kind || "desktop";
  const label =
    item?.label || (kind === "mobile" ? "Template — Mobile" : "Template — Desktop");

  return (
    <figure
      className={`tf-tile ${kind === "mobile" ? "tf-tile--mobile" : "tf-tile--desktop"} ${className}`}
      style={{ transform: `translate3d(0, ${y}px, 0)`, zIndex: z }}
    >
      <div className="tf-tile__frame">
        <div className="tf-tile__media">
          {item?.src ? (
            <img className="tf-tile__img" src={item.src} alt="" loading="lazy" />
          ) : (
            <div className="tf-tile__ph" />
          )}
        </div>

        {/* ✅ label único: derecha + vertical bottom->top */}
       {/* <span className="tf-tile__label tf-tile__label--side">{label}</span> */}
      </div>
    </figure>
  );
}

