import React from "react";
import useRevealOnView from "../../hooks/useRevealOnView";
import LandingRuledText from "./LandingRuledText";

// WHY: mismo texto pautado que la primera pantalla (LandingFinalCTA.jsx).
// Las fotos van en la columna de la derecha (LandingProfilesColumn, en
// Home.jsx). Oct 2026, decisión del usuario; antes píldora "why" + título
// pequeño centrado + foto debajo.
const ROWS = [
  { in: "0em", tail: "9em", text: "(WHY)" },
  { in: "0em", tail: "3em", text: "We know your work is ready,", long: true },
  { in: "2em", tail: "4em", text: "but your portfolio isn't." },
];

export default function LandingWhySection() {
  const [ref, inView] = useRevealOnView();

  return (
    <section ref={ref} className={`tf-ruled-section ${inView ? "is-in" : ""}`}>
      <LandingRuledText rows={ROWS} />
    </section>
  );
}
