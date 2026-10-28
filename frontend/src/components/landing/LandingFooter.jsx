import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import "./css/landing-footer.css";

// tf-footer__brand tiene el mismo diseño que tf-finalCta__brand
// (landing-final-cta.css) pero es su propia clase — antes se reutilizaba
// literalmente esa clase aquí, así que tocar el tamaño/look de una tocaba
// la otra (misma clase global, sin scope). Ahora son independientes:
// mismo aspecto de partida, cada una se puede rediseñar por separado.
export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation("common");
  // En /creatives no tiene sentido el enlace a /creatives.
  const onCreatives = useLocation().pathname.startsWith("/creatives");

  // tf-footer--site: este footer (landing y páginas públicas). Las plantillas
  // de portfolio reutilizan .tf-footer con su propio footer (js-footer,
  // df-footer...): las reglas de alto/aire de landing-footer.css van con
  // --site para no tocarlas.
  return (
    <footer className="tf-footer tf-footer--site" role="contentinfo">
      <div className="tf-footer__inner">
        {/* "Find Creatives" arriba del todo del footer, cerca de "We are where
          your portfolio lives." (oct 2026, decisión del usuario). */}
        {!onCreatives && (
          <nav className="tf-footer__pages" aria-label={t("footer.linksAriaLabel")}>
            {/* "About us" oculta (oct 2026): <a className="tf-footer__link" href="/about">{t("nav.about")}</a> */}
            {/* Mismo tamaño y raya que el texto pautado de la landing, de lado
                a lado (oct 2026, decisión del usuario; antes {t("nav.creatives")}). */}
            <a className="tf-footer__link" href="/creatives">
              Find Creatives
              {/* Misma flecha de enlace (ArrowUpRight) que en el panel. */}
              <ArrowUpRight className="tf-footer__arrow" aria-hidden="true" />
            </a>
            {/* Plantillas oculta (oct 2026): <a className="tf-footer__link" href="/templates">{t("footer.templates")}</a> */}
          </nav>
        )}

        <div className="tf-footer__main">
          <div className="tf-footer__brand">THEFOLDER/</div>

          <div className="tf-footer__row">
            <nav className="tf-footer__legal" aria-label={t("footer.legalLinksAriaLabel")}>
              <a className="tf-footer__link" href="/legal">{t("footer.legal")}</a>
              <a className="tf-footer__link" href="/terminos">{t("footer.terms")}</a>
              <a className="tf-footer__link" href="/privacy">{t("footer.privacy")}</a>
              <a className="tf-footer__link" href="/cookies">{t("footer.cookies")}</a>
            </nav>

            <div className="tf-footer__connect">
              <div className="tf-footer__social" aria-label={t("footer.socialAriaLabel")}>
                <a
                  className="tf-footer__link"
                  href="https://instagram.com/thefolderworld"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="tf-footer__link"
                  href="https://linkedin.com/company/thefolderworld"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
              <a className="tf-footer__link" href="mailto:thefolderworld@gmail.com">
                thefolderworld@gmail.com
              </a>
            </div>

            <div className="tf-footer__language">
              <LanguageSwitcher />
            </div>

            <div className="tf-footer__copy" aria-label={t("footer.brandAriaLabel", { year })}>
              © {year}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
