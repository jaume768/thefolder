import React from "react";
import "./css/landing-ruled.css";

// Texto "pautado" de las secciones de la landing (why, how, for who, cierre):
// cada fila con su raya debajo, sangría al principio (in) y la raya
// siguiendo vacía un trozo distinto (tail), así ninguna acaba a la par; con
// long la raya llega hasta el 74% del ancho de la página y con full, de
// lado a lado. Mismo
// tamaño y raya que la primera pantalla (LandingFinalCTA.jsx).
// wide: el bloque ocupa el 74% del ancho (para poder centrar filas dentro
// con center).
export default function LandingRuledText({ rows, as: Tag = "h2", delay = "0ms", wide = false }) {
  return (
    <Tag className={`tf-ruled tf-reveal${wide ? " tf-ruled--wide" : ""}`} style={{ "--d": delay }}>
      {rows.map((row) => (
        <span
          key={typeof row.text === "string" ? row.text : row.key}
          className={`tf-ruled__row${row.long ? " tf-ruled__row--long" : ""}${row.center ? " tf-ruled__row--center" : ""}${row.full ? " tf-ruled__row--full" : ""}`}
          style={{ "--in": row.in || "0em", "--tail": row.tail || "0em", "--cut": row.cut || "0%" }}
        >
          {row.text}
        </span>
      ))}
    </Tag>
  );
}
