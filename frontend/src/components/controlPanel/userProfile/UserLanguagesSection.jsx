import React from "react";

const levelLabel = (lvl) => {
  if (lvl === "basic") return "Básico";
  if (lvl === "intermediate") return "Intermedio";
  if (lvl === "advanced") return "Avanzado / Nativo";
  return "";
};

const UserLanguagesSection = ({ languages = [] }) => {
  const arr = Array.isArray(languages) ? languages : [];

  const normalized = arr
    .map((item) => {
      // soporta formato antiguo: ["Inglés", "Francés"]
      if (typeof item === "string") return { language: item, level: "" };

      // formato nuevo: [{ language, level }]
      return {
        language: (item?.language || "").trim(),
        level: (item?.level || "").trim(),
      };
    })
    .filter((x) => x.language && x.language.trim() !== "");

  if (normalized.length === 0) return null;

  return (
    <section className="user-extern-section">
      <h2>Idiomas</h2>
      <div className="user-extern-languages">
        {normalized.map((l, index) => (
          <div key={`${l.language}-${index}`} className="user-languae-text">
            <p className="user-languae-text">{l.language}</p>
            <p className="user-languae-text">{l.level ? `[ ${levelLabel(l.level)} ]` : ""}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserLanguagesSection;
