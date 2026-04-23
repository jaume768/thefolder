import React from "react";
import { useTranslation } from "react-i18next";
import "./css/landing-footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation("common");

  return (
    <footer className="tf-footer" role="contentinfo">
      <div className="tf-footer__inner">
        <div className="tf-footer__brand" aria-label={t("footer.brandAriaLabel", { year })}>
          <span className="tf-footer__mark" aria-hidden="true">©</span>
          <span className="tf-footer__year">{year}</span>
          <span className="tf-footer__name">thefolder</span>
        </div>

        <nav className="tf-footer__nav" aria-label={t("footer.linksAriaLabel")}>
          <span className="tf-footer__link tf-footer__contact">
            {t("footer.contact")}
            <span className="tf-footer__contact-tip">
              <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com</a>
            </span>
          </span>
          <a className="tf-footer__link" href="/legal">{t("footer.legal")}</a>
          <a className="tf-footer__link" href="/terminos">{t("footer.terms")}</a>
          <a className="tf-footer__link" href="/privacy">{t("footer.privacy")}</a>
          <a className="tf-footer__link" href="/cookies">{t("footer.cookies")}</a>
        </nav>
      </div>
    </footer>
  );
}
