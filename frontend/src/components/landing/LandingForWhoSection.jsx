import React, { useEffect, useState } from "react";
import { getRoleTags } from "../../services/tagService";
import useRevealOnView from "../../hooks/useRevealOnView";
import LandingRuledText from "./LandingRuledText";

// Cada categoría se resuelve sumando los tags de un `group` (varios roles
// afines) o de un `id` concreto (cuando el grupo mezcla roles demasiado
// distintos, p.ej. "Dirección Creativa" incluye tanto dirección creativa
// como dirección de arte, set design, etc.). Ver backend/utils/ensureTags.js
// para el taxonomy completo.
const ROLE_CATEGORIES = [
  { label: "Photographers", group: "Fotografía & Vídeo" },
  { label: "Stylists", group: "Styling" },
  { label: "Art directors", id: "direccion-arte" },
  { label: "Creative directors", id: "direccion-creativa" },
  { label: "Fashion designers", group: "Diseño" },
  { label: "Graphic designers", id: "diseno-grafico" },
  { label: "MUAH", group: "Beauty & Hair" },
];

// (FOR WHO) se queda a la izquierda como el resto de títulos; la lista de
// roles va centrada en el bloque del 74% del ancho, pero su raya sale desde
// la izquierda del todo, como las demás, y acaba antes del final del bloque
// un trozo distinto en cada fila (cut), así no acaban a la par.
const ROLE_CUTS = ["6%", "0%", "11%", "3%", "14%", "8%", "1.5%", "10%"];

export default function LandingForWhoSection() {
  const [counts, setCounts] = useState({});
  const [ref, inView] = useRevealOnView();

  useEffect(() => {
    let cancelled = false;
    getRoleTags()
      .then(({ data }) => {
        if (cancelled) return;
        const byId = {};
        const byGroup = {};
        for (const t of data.tags || []) {
          byId[t.id] = (byId[t.id] || 0) + t.count;
          byGroup[t.group] = (byGroup[t.group] || 0) + t.count;
        }
        const next = {};
        for (const cat of ROLE_CATEGORIES) {
          next[cat.label] = cat.id ? (byId[cat.id] || 0) : (byGroup[cat.group] || 0);
        }
        setCounts(next);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const rows = [
    { text: "(FOR WHO)", tail: "8em" },
    ...[
      ...ROLE_CATEGORIES.map((cat) => ({ text: `${cat.label} (${counts[cat.label] ?? 0})`, key: cat.label })),
      { text: "& more." },
    ].map((row, i) => {
      return { ...row, cut: ROLE_CUTS[i % ROLE_CUTS.length], center: true };
    }),
  ];

  // Texto pautado como la primera pantalla, un rol por fila con su número;
  // las fotos van en la columna de la derecha (LandingProfilesColumn). Oct
  // 2026, decisión del usuario; antes píldora "for who" + nube de roles
  // pequeña centrada + foto debajo.
  return (
    <section ref={ref} className={`tf-ruled-section ${inView ? "is-in" : ""}`}>
      <LandingRuledText rows={rows} wide />
    </section>
  );
}
