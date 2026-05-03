// UserProfessionalExperienceSection.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "../css/professionalExperience.css";
import { clImg } from "../../../utils/optimizeImage";
import LogoWithFallback from "./LogoWithFallback";

const normalizeUrl = (raw = "") => {
  const v = String(raw).trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

const prettyUrl = (raw = "") =>
  String(raw).trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");

const UserProfessionalExperienceSection = ({ professionalFormation }) => {
  const { t } = useTranslation("profile");
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
      return `${months} ${months === 1 ? t("duration.month") : t("duration.months")}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? t("duration.year") : t("duration.years")}`;
      }
      return `${years} ${years === 1 ? t("duration.year") : t("duration.years")} ${remainingMonths} ${
        remainingMonths === 1 ? t("duration.month") : t("duration.months")
      }`;
    }
  };

  const formatDate = (month, year) => {
    if (!month || !year) return "";

    const months = [
      t("months.jan"), t("months.feb"), t("months.mar"), t("months.apr"),
      t("months.may"), t("months.jun"), t("months.jul"), t("months.aug"),
      t("months.sep"), t("months.oct"), t("months.nov"), t("months.dec"),
    ];

    return `${months[month - 1]} ${year}`;
  };

  return (
    <section className="user-extern-section">
      <h2>{t("sections.experience")}</h2>

      <div className="experience-list">
        {validExperience.map((exp, index) => {
          const url = normalizeUrl(exp?.companyWebsite || "");
          const urlLabel = prettyUrl(exp?.companyWebsite || "");

          return (
            <div key={index} className="experience-item">
              <LogoWithFallback
                src={clImg.logo(exp.companyLogo)}
                name={exp.institution || t("sections.company")}
                alt={exp.institution || t("sections.company")}
              />

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
                    {exp.currentlyWorking ? t("sections.current") : formatDate(exp.endMonth, exp.endYear)}
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
