import React from "react";
import useRevealOnView from "../../hooks/useRevealOnView";
import LandingRuledText from "./LandingRuledText";

// HOW: texto pautado como la primera pantalla; las fotos van en la columna
// de la derecha (LandingProfilesColumn, en Home.jsx). Oct 2026, decisión del
// usuario; antes píldora "how" + texto y lista pequeños centrados + foto
// debajo. Mismo contenido que tenía.
const ROWS = [
  { in: "0em", tail: "8em", text: "(HOW)" },
  { in: "0em", tail: "5em", text: "Build your", long: true },
  { in: "0em", tail: "2.5em", text: "fashion portfolio in minutes:" },
  { in: "2em", tail: "6.5em", text: "Curated templates." },
  { in: "0em", tail: "7em", text: "Online CV.", long: true },
  { in: "3em", tail: "2em", text: "One shareable link." },
];

export default function LandingHowSection() {
  const [ref, inView] = useRevealOnView();

  return (
    <section ref={ref} className={`tf-ruled-section ${inView ? "is-in" : ""}`}>
      <LandingRuledText rows={ROWS} />
    </section>
  );
}
