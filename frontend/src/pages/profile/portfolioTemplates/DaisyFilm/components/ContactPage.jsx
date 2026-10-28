// portfolioTemplates/DaisyFilm/components/ContactPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { buildSocialMediaUrl } from "../../../../../utils/socialMediaUtils";
import Footer from "./Footer";

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

export default function ContactPage({ displayName, profile }) {
  const { t } = useTranslation("profile");
  const email = profile?.social?.emailContacto || profile?.email || "";
  const sitioWeb = profile?.social?.sitioWeb || "";
  const representationName = profile?.social?.representationName || "";
  const representationWeb = profile?.social?.representationWeb || "";
  const filledSocials = SOCIALS.filter((s) => profile?.social?.[s.key]);

  return (
    <div className="df-page">
      <div className="df-page--contact">
        <div className="df-contact__email-wrap">
          <div className="df-contact__primary">
            {email && (
              <a className="df-contact__email" href={`mailto:${email}`}>
                {email}
              </a>
            )}

            {sitioWeb && (
              <a
                className="df-contact__website"
                href={buildSocialMediaUrl("sitioWeb", sitioWeb)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}

            {representationName && (
              <p className="df-contact__representation">
                {t("representation.label")}
                {representationWeb ? (
                  <a
                    href={buildSocialMediaUrl("website", representationWeb)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="df-contact__representation-link"
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
          <div className="df-contact__socials">
            {filledSocials.map((s) => (
              <a
                key={s.key}
                className="df-contact__social-link"
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

      <Footer name={displayName} />
    </div>
  );
}
