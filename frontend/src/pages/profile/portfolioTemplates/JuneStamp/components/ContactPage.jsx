// portfolioTemplates/JuneStamp/components/ContactPage.jsx
// Página de contacto — reemplaza el popup de email + barra social flotante
// de la versión anterior (EmailPopup.jsx/SocialBar.jsx) por una página
// propia, igual que DaisyFilm/components/ContactPage.jsx.
import React from "react";
import { useTranslation } from "react-i18next";
import { buildSocialMediaUrl } from "../../../../../utils/socialMediaUtils";
import HeroSlideshow from "../../shared/HeroSlideshow";

const SOCIALS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "behance", label: "Behance" },
  { key: "pinterest", label: "Pinterest" },
  { key: "youtube", label: "YouTube" },
  { key: "tumblr", label: "Tumblr" },
  { key: "substack", label: "Substack" },
  { key: "arena", label: "Are.na" },
];

export default function ContactPage({ profile, heroImages = [] }) {
  const { t } = useTranslation("profile");
  const email = profile?.social?.emailContacto || profile?.email || "";
  const sitioWeb = profile?.social?.sitioWeb || "";
  const representationName = profile?.social?.representationName || "";
  const representationWeb = profile?.social?.representationWeb || "";
  const filledSocials = SOCIALS.filter((s) => profile?.social?.[s.key]);

  return (
    <div className="js-page js-page--inset">
      <div className="js-page--contact">
        <div className="js-contact__info">
          <div className="js-contact__email-wrap">
            <div className="js-contact__primary">
              {email && (
                <a className="js-contact__email" href={`mailto:${email}`}>
                  {email}
                </a>
              )}

              {sitioWeb && (
                <a
                  className="js-contact__website"
                  href={buildSocialMediaUrl("sitioWeb", sitioWeb)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}

              {representationName && (
                <p className="js-contact__representation">
                  {t("representation.label")}
                  {representationWeb ? (
                    <a
                      href={buildSocialMediaUrl("website", representationWeb)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="js-contact__representation-link"
                    >
                      {representationName}
                    </a>
                  ) : (
                    representationName
                  )}
                </p>
              )}
            </div>
          </div>

          {filledSocials.length > 0 && (
            <div className="js-contact__socials">
              {filledSocials.map((s) => (
                <a
                  key={s.key}
                  className="js-contact__social-link"
                  href={buildSocialMediaUrl(s.key, profile.social[s.key])}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="js-contact__cv-slideshow-col">
          <HeroSlideshow images={heroImages} baseClass="js-contact__cv-slideshow" />
        </div>
      </div>
    </div>
  );
}
