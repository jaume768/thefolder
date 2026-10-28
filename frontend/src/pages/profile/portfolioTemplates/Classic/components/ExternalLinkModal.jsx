// portfolioTemplates/Classic/components/ExternalLinkModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function ExternalLinkModal({ url, onCancel, onContinue }) {
  const { t } = useTranslation("profile");

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p className="modal-content-title">{t("externalLink.title")}</p>
        <p className="modal-content-subtitle">{t("externalLink.subtitle")}</p>
        <div className="modal-content-link">{url}</div>
        <div className="modal-actions">
          <button onClick={onCancel}>{t("externalLink.cancel")}</button>
          <button onClick={onContinue}>{t("externalLink.continue")}</button>
        </div>
      </div>
    </div>
  );
}
