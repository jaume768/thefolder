import React from "react";
import useRevealOnView from "../../hooks/useRevealOnView";
import { ArrowUpRight } from "lucide-react";
import LandingRuledText from "./LandingRuledText";

// Cierre: texto pautado como la primera pantalla, solo, en una sección
// aparte (fuera de la columna de fotos de perfiles) de ~90vh con el texto
// abajo del todo, pegado al footer (su "Find Creatives" sigue como una
// fila más); la última raya ocupa todo el ancho y lleva al final, a la
// derecha, el enlace "Create profile". Oct 2026, decisión del usuario;
// antes título pequeño centrado + botón "Create your portfolio".
export default function LandingClosingCTA({ onCtaClick }) {
  const [ref, inView] = useRevealOnView();

  const rows = [
    { in: "0em", tail: "6em", text: "We are where" },
    {
      in: "2em",
      full: true,
      key: "lives",
      text: (
        <>
          your portfolio lives.
          <a
            className="tf-ruled__link"
            href="/register"
            onClick={(e) => { e.preventDefault(); onCtaClick?.(); }}
          >
            Create profile
            <ArrowUpRight className="tf-ruled__arrow" aria-hidden="true" />
          </a>
        </>
      ),
    },
  ];

  return (
    <section ref={ref} className={`tf-ruled-section tf-ruled-section--closing ${inView ? "is-in" : ""}`}>
      <LandingRuledText rows={rows} />
    </section>
  );
}
