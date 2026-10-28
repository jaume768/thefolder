// portfolioTemplates/Classic/components/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Footer({ name }) {
  const { t } = useTranslation("profile");
  const year = new Date().getFullYear();

  return (
    <footer className="tf-footer cl-footer" role="contentinfo">
      <div className="tf-footer__inner cl-footer__inner">
        <span className="cl-footer__credit">
          {t("classic.footerCredit", { name: name || "", year })}
          {" "}
          <Link to="/templates" className="cl-footer__credit-link">
            {t("classic.footerTemplateName")}
          </Link>
        </span>
      </div>
    </footer>
  );
}
