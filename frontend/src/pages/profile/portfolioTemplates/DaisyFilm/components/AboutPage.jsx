// portfolioTemplates/DaisyFilm/components/AboutPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Footer from "./Footer";
import HeroSlideshow from "../../shared/HeroSlideshow";
import { formatUserLocation } from "../../../../../utils/locations";

export default function AboutPage({
  displayName,
  profile,
  profileImage,
  heroImages = [],
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
  const bioText = profile?.biography || profile?.bio || "";
  const present = t("daisyFilm.cv.present");

  // Mes numérico (1-12) → abreviatura traducida ("months.jan" → "Ene."/"Jan.").
  const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const monthLabel = (m) => (m ? t(`months.${MONTH_KEYS[Number(m) - 1]}`) : "");
  const datePoint = (month, year) => [monthLabel(month), year].filter(Boolean).join(" ");

  // Especialización (edit profile → sección "Especialización", campo
  // profileHeadlines, hasta 3 etiquetas libres, ej. "Estilismo editorial").
  const specializations = (profile?.profileHeadlines || [])
    .map((h) => String(h || "").trim())
    .filter(Boolean);

  const location = formatUserLocation(profile?.city, profile?.country, t, {
    city2: profile?.city2,
    country2: profile?.country2,
    city3: profile?.city3,
    country3: profile?.country3,
  });

  return (
    <div className="df-page">
      <div className="df-about__hero">
        <div className="df-about__title-row">
          <p className="df-project__title">{displayName.toUpperCase()}</p>
          {specializations.length > 0 && (
            <p className="df-about__meta">
              {specializations.map((s, i) => <span key={i}>{s}</span>)}
            </p>
          )}
        </div>

        <div className="df-about__avatar-wrapper">
          <img src={profileImage} alt={displayName} className="df-about__avatar" />
        </div>

        <div className="df-about__subtitle-row">
          {bioText && <p className="df-project__subtitle">{bioText}</p>}
          {location && <p className="df-about__meta">{location}</p>}
        </div>
      </div>

      {hasCv && (
      <div className="df-page--about">
        <div className="df-about__cv-row">
        <div className="df-about__cv">
          <p className="df-project__title left-text">CV</p>

          {experience.length > 0 && (
            <section className="df-cv__section">
              <h4 className="df-cv__heading">{t("daisyFilm.cv.experience")}</h4>
              {experience.map((e, i) => (
                <div key={i} className="df-cv__item">
                  {e.startYear && (
                    <span className="df-cv__item-date">
                      {datePoint(e.startMonth, e.startYear)}
                      {e.currentlyWorking ? ` - ${present}` : e.endYear ? ` - ${datePoint(e.endMonth, e.endYear)}` : ""}
                    </span>
                  )}
                  <span className="df-cv__item-title">{e.title}</span>
                  {e.institution && <span className="df-cv__item-sub">{e.institution}</span>}
                  {e.location && <span className="df-cv__item-sub">{e.location}</span>}
                  {e.description && <p className="df-cv__item-desc">{e.description}</p>}
                  {e.companyWebsite && (
                    <a
                      href={e.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="df-cv__item-link"
                    >
                      {e.companyWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section className="df-cv__section">
              <h4 className="df-cv__heading">{t("daisyFilm.cv.education")}</h4>
              {education.map((e, i) => (
                <div key={i} className="df-cv__item">
                  {e.formationStartYear && (
                    <span className="df-cv__item-date">
                      {datePoint(e.formationStartMonth, e.formationStartYear)}
                      {e.currentlyEnrolled
                        ? ` - ${present}`
                        : e.formationEndYear ? ` - ${datePoint(e.formationEndMonth, e.formationEndYear)}` : ""}
                    </span>
                  )}
                  <span className="df-cv__item-title">{e.formationName}</span>
                  {e.institution && <span className="df-cv__item-sub">{e.institution}</span>}
                  {e.educationType && (
                    <span className="df-cv__item-sub">
                      {e.educationType === "OTRO" && e.educationOtherType ? e.educationOtherType : e.educationType}
                    </span>
                  )}
                  {e.educationHours && <span className="df-cv__item-sub">{e.educationHours}</span>}
                </div>
              ))}
            </section>
          )}

          {press.length > 0 && (
            <section className="df-cv__section">
              <h4 className="df-cv__heading">{t("daisyFilm.cv.press")}</h4>
              {press.map((p, i) => (
                <div key={i} className="df-cv__item">
                  {p.pubYear && (
                    <span className="df-cv__item-date">{datePoint(p.pubMonth, p.pubYear)}</span>
                  )}
                  <span className="df-cv__item-title">{p.title}</span>
                  {p.publication && <span className="df-cv__item-sub">{p.publication}</span>}
                  {p.role && <span className="df-cv__item-sub">{p.role}</span>}
                  {p.description && <p className="df-cv__item-desc">{p.description}</p>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="df-cv__item-link">
                      {p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {awards.length > 0 && (
            <section className="df-cv__section">
              <h4 className="df-cv__heading">{t("daisyFilm.cv.awards")}</h4>
              {awards.map((a, i) => (
                <div key={i} className="df-cv__item">
                  {a.awardYear && (
                    <span className="df-cv__item-date">{datePoint(a.awardMonth, a.awardYear)}</span>
                  )}
                  <span className="df-cv__item-title">{a.name}</span>
                  {a.issuer && <span className="df-cv__item-sub">{a.issuer}</span>}
                  {a.type && (
                    <span className="df-cv__item-sub">
                      {a.type === "Otro" && a.otherType ? a.otherType : a.type}
                    </span>
                  )}
                  {a.description && <p className="df-cv__item-desc">{a.description}</p>}
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="df-cv__item-link">
                      {a.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {(skills.length > 0 || software.length > 0 || languages.length > 0) && (
            <div className="df-cv__row">
              {software.length > 0 && (
                <section className="df-cv__section">
                  <h4 className="df-cv__heading">{t("daisyFilm.cv.software")}</h4>
                  <div className="df-cv__tags">
                    {software.map((s, i) => <span key={i} className="df-cv__tag">{s}</span>)}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section className="df-cv__section">
                  <h4 className="df-cv__heading">{t("daisyFilm.cv.skills")}</h4>
                  <div className="df-cv__tags">
                    {skills.map((s, i) => <span key={i} className="df-cv__tag">{s}</span>)}
                  </div>
                </section>
              )}

              {languages.length > 0 && (
                <section className="df-cv__section">
                  <h4 className="df-cv__heading">{t("daisyFilm.cv.languages")}</h4>
                  {languages.map((l, i) => (
                    <div key={i} className="df-cv__item df-cv__item--column">
                      <span className="df-cv__item-title">{l.language}</span>
                      {l.level && <span className="df-cv__item-sub">{t(`languageLevels.${l.level}`)}</span>}
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

        </div>

        <div className="df-about__cv-slideshow-col">
          <HeroSlideshow images={heroImages} baseClass="df-about__cv-slideshow" />
        </div>
        </div>
      </div>
      )}

      <Footer name={displayName} />
    </div>
  );
}
