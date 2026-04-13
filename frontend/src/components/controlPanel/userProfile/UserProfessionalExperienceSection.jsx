// UserProfessionalExperienceSection.jsx
import React from "react";
import "../css/professionalExperience.css";
import { clImg } from "../../../utils/optimizeImage";

const normalizeUrl = (raw = "") => {
  const v = String(raw).trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

const prettyUrl = (raw = "") =>
  String(raw).trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");

const UserProfessionalExperienceSection = ({ professionalFormation }) => {
  if (!professionalFormation || professionalFormation.length === 0) return null;

  const validExperience = professionalFormation.filter(
    (exp) => !exp.isDraft && (exp.title?.trim() || exp.institution?.trim())
  );
  if (validExperience.length === 0) return null;

  const calculateDuration = (exp) => {
    if (!exp.startMonth || !exp.startYear) return "";

    const startDate = new Date(exp.startYear, exp.startMonth - 1);
    let endDate;

    if (exp.currentlyWorking) {
      endDate = new Date();
    } else if (exp.endMonth && exp.endYear) {
      endDate = new Date(exp.endYear, exp.endMonth - 1);
    } else {
      return "";
    }

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) + 1;

    if (months < 1) return "";

    if (months < 12) {
      return `${months} ${months === 1 ? "mes" : "meses"}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "año" : "años"}`;
      }
      return `${years} ${years === 1 ? "año" : "años"} ${remainingMonths} ${
        remainingMonths === 1 ? "mes" : "meses"
      }`;
    }
  };

  const formatDate = (month, year) => {
    if (!month || !year) return "";

    const months = [
      "Ene.",
      "Feb.",
      "Mar.",
      "Abr.",
      "May.",
      "Jun.",
      "Jul.",
      "Ago.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dic.",
    ];

    return `${months[month - 1]} ${year}`;
  };

  return (
    <section className="user-extern-section">
      <h2>Experiencia profesional</h2>

      <div className="experience-list">
        {validExperience.map((exp, index) => {
          const url = normalizeUrl(exp?.companyWebsite || "");
          const urlLabel = prettyUrl(exp?.companyWebsite || "");

          return (
            <div key={index} className="experience-item">
              <div className="experience-logo">
                {exp.companyLogo ? (
                  <img src={clImg.logo(exp.companyLogo)} alt={exp.institution || "Empresa"} />
                ) : (
                  <div className="experience-logo-placeholder">
                    {exp.institution ? exp.institution.charAt(0).toUpperCase() : "E"}
                  </div>
                )}
              </div>

              <div className="experience-content">
                <h3 className="experience-title">{exp.title}</h3>
                <p className="experience-company">{exp.institution}</p>

                {/* ✅ WEB */}
                {url && (
                  <a
                    className="experience-website"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {urlLabel} <span className="experience-website-icon">↗</span>
                  </a>
                )}

                {!!exp.location && <p className="experience-location">{exp.location}</p>}

                {(exp.startMonth && exp.startYear) && (
                  <p className="experience-period">
                    {formatDate(exp.startMonth, exp.startYear)}
                    {" · "}
                    {exp.currentlyWorking ? "Actual" : formatDate(exp.endMonth, exp.endYear)}
                    {" · "}
                    <span className="experience-duration">{calculateDuration(exp)}</span>
                  </p>
                )}

                {exp.description && (
                  <div className="experience-description">{exp.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UserProfessionalExperienceSection;
