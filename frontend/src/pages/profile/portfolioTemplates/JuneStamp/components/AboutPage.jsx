// portfolioTemplates/JuneStamp/components/AboutPage.jsx
// Hero + CV completo — misma lógica de datos que DaisyFilm/components/
// AboutPage.jsx (experiencia/educación/prensa/premios/skills/software/
// idiomas), maquetado con la identidad de June Stamp.
import React from "react";
import { useTranslation } from "react-i18next";

export default function AboutPage({
  displayName,
  profileImage,
  experience,
  education,
  skills,
  software,
  languages,
  awards,
  press,
  hasCv,
}) {
  const { t } = useTranslation("profile");
  const present = t("juneStamp.cv.present");

  // Mes numérico (1-12) → abreviatura traducida ("months.jan" → "Ene."/"Jan.").
  const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const monthLabel = (m) => (m ? t(`months.${MONTH_KEYS[Number(m) - 1]}`) : "");
  const datePoint = (month, year) => [monthLabel(month), year].filter(Boolean).join(" ");

  return (
    <div className="js-page js-page--inset">
      <div className="js-about__hero">
        <div className="js-about__avatar-wrapper">
          <img src={profileImage} alt={displayName} className="js-about__avatar" />
        </div>
      </div>

      <div className="js-page--about">
        <div className="js-about__cv-row">
        <div className="js-about__cv">
          {experience.length > 0 && (
            <section className="js-cv__section">
              <h4 className="js-cv__heading">{t("juneStamp.cv.experience")}</h4>
              {experience.map((e, i) => (
                <div key={i} className="js-cv__item">
                  {e.startYear && (
                    <span className="js-cv__item-date">
                      {datePoint(e.startMonth, e.startYear)}
                      {e.currentlyWorking ? ` - ${present}` : e.endYear ? ` - ${datePoint(e.endMonth, e.endYear)}` : ""}
                    </span>
                  )}
                  <span className="js-cv__item-title">{e.title}</span>
                  {e.institution && <span className="js-cv__item-sub">{e.institution}</span>}
                  {e.location && <span className="js-cv__item-sub">{e.location}</span>}
                  {e.description && <p className="js-cv__item-desc">{e.description}</p>}
                  {e.companyWebsite && (
                    <a
                      href={e.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="js-cv__item-link"
                    >
                      {e.companyWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <span className="js-cv__item-link-arrow" aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section className="js-cv__section">
              <h4 className="js-cv__heading">{t("juneStamp.cv.education")}</h4>
              {education.map((e, i) => (
                <div key={i} className="js-cv__item">
                  {e.formationStartYear && (
                    <span className="js-cv__item-date">
                      {datePoint(e.formationStartMonth, e.formationStartYear)}
                      {e.currentlyEnrolled
                        ? ` - ${present}`
                        : e.formationEndYear ? ` - ${datePoint(e.formationEndMonth, e.formationEndYear)}` : ""}
                    </span>
                  )}
                  <span className="js-cv__item-title">{e.formationName}</span>
                  {e.institution && <span className="js-cv__item-sub">{e.institution}</span>}
                  {e.educationType && (
                    <span className="js-cv__item-sub">
                      {e.educationType === "OTRO" && e.educationOtherType ? e.educationOtherType : e.educationType}
                    </span>
                  )}
                  {e.educationHours && <span className="js-cv__item-sub">{e.educationHours}</span>}
                </div>
              ))}
            </section>
          )}

          {press.length > 0 && (
            <section className="js-cv__section">
              <h4 className="js-cv__heading">{t("juneStamp.cv.press")}</h4>
              {press.map((p, i) => (
                <div key={i} className="js-cv__item">
                  {p.pubYear && (
                    <span className="js-cv__item-date">{datePoint(p.pubMonth, p.pubYear)}</span>
                  )}
                  <span className="js-cv__item-title">{p.title}</span>
                  {p.publication && <span className="js-cv__item-sub">{p.publication}</span>}
                  {p.role && <span className="js-cv__item-sub">{p.role}</span>}
                  {p.description && <p className="js-cv__item-desc">{p.description}</p>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="js-cv__item-link">
                      {p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <span className="js-cv__item-link-arrow" aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {awards.length > 0 && (
            <section className="js-cv__section">
              <h4 className="js-cv__heading">{t("juneStamp.cv.awards")}</h4>
              {awards.map((a, i) => (
                <div key={i} className="js-cv__item">
                  {a.awardYear && (
                    <span className="js-cv__item-date">{datePoint(a.awardMonth, a.awardYear)}</span>
                  )}
                  <span className="js-cv__item-title">{a.name}</span>
                  {a.issuer && <span className="js-cv__item-sub">{a.issuer}</span>}
                  {a.type && (
                    <span className="js-cv__item-sub">
                      {a.type === "Otro" && a.otherType ? a.otherType : a.type}
                    </span>
                  )}
                  {a.description && <p className="js-cv__item-desc">{a.description}</p>}
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="js-cv__item-link">
                      {a.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <span className="js-cv__item-link-arrow" aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {(skills.length > 0 || software.length > 0 || languages.length > 0) && (
            <div className="js-cv__row">
              {software.length > 0 && (
                <section className="js-cv__section">
                  <h4 className="js-cv__heading">{t("juneStamp.cv.software")}</h4>
                  <div className="js-cv__tags">
                    {software.map((s, i) => <span key={i} className="js-cv__tag">{s}</span>)}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section className="js-cv__section">
                  <h4 className="js-cv__heading">{t("juneStamp.cv.skills")}</h4>
                  <div className="js-cv__tags">
                    {skills.map((s, i) => <span key={i} className="js-cv__tag">{s}</span>)}
                  </div>
                </section>
              )}

              {languages.length > 0 && (
                <section className="js-cv__section">
                  <h4 className="js-cv__heading">{t("juneStamp.cv.languages")}</h4>
                  {languages.map((l, i) => (
                    <div key={i} className="js-cv__item js-cv__item--column">
                      <span className="js-cv__item-title">{l.language}</span>
                      {l.level && <span className="js-cv__item-sub">{t(`languageLevels.${l.level}`)}</span>}
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

          {!hasCv && <p className="js-cv__empty">{t("juneStamp.cv.empty")}</p>}
        </div>
        </div>
      </div>
    </div>
  );
}
