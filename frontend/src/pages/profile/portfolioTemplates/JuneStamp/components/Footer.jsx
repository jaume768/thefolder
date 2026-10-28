// portfolioTemplates/JuneStamp/components/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Footer({ name }) {
  const { t } = useTranslation("profile");
  const year = new Date().getFullYear();

  return (
    <footer className="tf-footer js-footer" role="contentinfo">
      <div className="tf-footer__inner js-footer__inner">
        <span className="js-footer__credit">
          {t("juneStamp.footerCredit", { name: name || "", year })}
          {" "}
          <Link to="/templates" className="js-footer__credit-link">
            {t("juneStamp.footerTemplateName")}
          </Link>
        </span>
      </div>
    </footer>
  );
}
