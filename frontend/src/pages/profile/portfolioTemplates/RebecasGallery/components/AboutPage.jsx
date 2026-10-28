// portfolioTemplates/RebecasGallery/components/AboutPage.jsx
// Identidad (bio/ubicación/web) + CV completo — reemplaza a CvSection.jsx
// (que mezclaba esto con acciones de seguir/editar/contactar, ahora movidas
// a shared/QuickActions.jsx y shared/EditAboutOverlay.jsx, igual que en
// DaisyFilm/JuneStamp). A diferencia de esas dos plantillas, aquí el CV se
// pinta con los mismos componentes compartidos que usa Classic
// (components/controlPanel/userProfile/User*Section) en vez de maquetarlo a
// mano — el CSS de esta plantilla ya los venía skinando bajo `.rg-cv`, así
// que se reutilizan tal cual para ganar Prensa/Reconocimientos (secciones
// que Rebeca's Gallery no tenía) sin reescribir su lógica.
import React from "react";
import { useTranslation } from "react-i18next";
import UserProfessionalExperienceSection from "../../../../../components/controlPanel/userProfile/UserProfessionalExperienceSection";
import UserEducationSection from "../../../../../components/controlPanel/userProfile/UserEducationSection";
import UserPressPublicationsSection from "../../../../../components/controlPanel/userProfile/UserPressPublicationsSection";
import UserAwardsSection from "../../../../../components/controlPanel/userProfile/UserAwardsSection";
import UserSkillsSection from "../../../../../components/controlPanel/userProfile/UserSkillsSection";
import UserSoftwareSection from "../../../../../components/controlPanel/userProfile/UserSoftwareSection";
import UserLanguagesSection from "../../../../../components/controlPanel/userProfile/UserLanguagesSection";

export default function AboutPage({
  profile,
  location,
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

  return (
    <div className="rg-page rg-page--about">
      <div className="rg-cv">
        <div className="rg-cv-identity">
          {location && <p className="rg-location">{location}</p>}

          {(profile?.biography || profile?.bio) && (
            <p className="rg-bio">{profile.biography || profile.bio}</p>
          )}

          {profile?.social?.sitioWeb && (
            <a
              className="rg-website"
              href={
                profile.social.sitioWeb.startsWith("http")
                  ? profile.social.sitioWeb
                  : `https://${profile.social.sitioWeb}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.social.sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}{" "}↗
            </a>
          )}
        </div>

        {hasCv ? (
          <div className="rg-cv-cv">
            <UserProfessionalExperienceSection professionalFormation={experience} />
            <UserEducationSection education={education} />
            <UserPressPublicationsSection pressPublications={press} />
            <UserAwardsSection awards={awards} />
            <UserSkillsSection skills={skills} />
            <UserSoftwareSection software={software} />
            <UserLanguagesSection languages={languages} />
          </div>
        ) : (
          <p className="rg-cv__empty">{t("rebecasGallery.cv.empty")}</p>
        )}
      </div>
    </div>
  );
}
