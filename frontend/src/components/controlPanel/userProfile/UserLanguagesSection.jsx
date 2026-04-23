import React from "react";
import { useTranslation } from "react-i18next";

const levelLabel = (t, lvl) => {
  if (lvl === "basic") return t("languageLevels.basic");
  if (lvl === "intermediate") return t("languageLevels.intermediate");
  if (lvl === "advanced") return t("languageLevels.advanced");
  if (lvl === "native") return t("languageLevels.native");
  return "";
};

const UserLanguagesSection = ({ languages = [] }) => {
  const { t } = useTranslation("profile");
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
      <h2>{t("sections.languages")}</h2>
      <div className="user-extern-languages">
        {normalized.map((l, index) => (
          <div key={`${l.language}-${index}`} className="user-languae-text">
            <p className="user-languae-text">{l.language}</p>
            <p className="user-languae-text">{l.level ? `[ ${levelLabel(t, l.level)} ]` : ""}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserLanguagesSection;
