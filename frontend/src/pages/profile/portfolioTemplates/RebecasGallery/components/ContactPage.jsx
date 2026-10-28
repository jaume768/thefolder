// portfolioTemplates/RebecasGallery/components/ContactPage.jsx
// Página de contacto — reemplaza el popup de email (EmailPopup.jsx) y la
// barra social flotente (SocialBar.jsx) por una página propia, igual que
// DaisyFilm/JuneStamp (mismos datos, misma lista de redes).
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
    <div className="rg-page">
      <div className="rg-page--contact">
        <div className="rg-contact__info">
          <div className="rg-contact__primary">
            {email && (
              <a className="rg-contact__email" href={`mailto:${email}`}>
                {email}
              </a>
            )}

            {sitioWeb && (
              <a
                className="rg-contact__website"
                href={buildSocialMediaUrl("sitioWeb", sitioWeb)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}

            {representationName && (
              <p className="rg-contact__representation">
                {t("representation.label")}
                {representationWeb ? (
                  <a
                    href={buildSocialMediaUrl("website", representationWeb)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rg-contact__representation-link"
                  >
                    {representationName}
                  </a>
                ) : (
                  representationName
                )}
              </p>
            )}
          </div>

          {filledSocials.length > 0 && (
            <div className="rg-contact__socials">
              {filledSocials.map((s) => (
                <a
                  key={s.key}
                  className="rg-contact__social-link"
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

        <div className="rg-contact__slideshow-col">
          <HeroSlideshow images={heroImages} baseClass="rg-contact__cv-slideshow" />
        </div>
      </div>
    </div>
  );
}
