// portfolioTemplates/DaisyFilm/components/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Footer({ name }) {
  const { t } = useTranslation("profile");
  const year = new Date().getFullYear();

  return (
    <footer className="tf-footer df-footer" role="contentinfo">
      <div className="tf-footer__inner df-footer__inner">
        <span className="df-footer__credit">
          {t("daisyFilm.footerCredit", { name: name || "", year })}
          {" "}
          <Link to="/templates" className="df-footer__credit-link">
            {t("daisyFilm.footerTemplateName")}
          </Link>
        </span>
      </div>
    </footer>
  );
}
