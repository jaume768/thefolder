// portfolioTemplates/RebecasGallery/components/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Footer({ name }) {
  const { t } = useTranslation("profile");
  const year = new Date().getFullYear();

  return (
    <footer className="tf-footer rg-footer" role="contentinfo">
      <div className="tf-footer__inner rg-footer__inner">
        <span className="rg-footer__credit">
          {t("rebecasGallery.footerCredit", { name: name || "", year })}
          {" "}
          <Link to="/templates" className="rg-footer__credit-link">
            {t("rebecasGallery.footerTemplateName")}
          </Link>
        </span>
      </div>
    </footer>
  );
}
