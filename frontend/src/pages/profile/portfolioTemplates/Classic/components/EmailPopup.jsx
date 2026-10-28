// portfolioTemplates/Classic/components/EmailPopup.jsx
// Copia y cierra al instante (sin el delay de 1200ms + label "copiado" que sí
// tiene el popup de RebecasGallery) — así se comportaban ambos orígenes
// (UserProfilePage.jsx y MiPerfilPage.jsx), preservado tal cual.
import React from "react";
import { useTranslation } from "react-i18next";
import { X, Copy } from "lucide-react";

export default function EmailPopup({ email, onClose, onCopied, mode }) {
  const { t } = useTranslation("profile");

  return (
    <div className="success-popup-overlay" onClick={onClose}>
      <div className="success-popup" onClick={(e) => e.stopPropagation()}>
        <div className="success-popup-header">
          <h3>{t("contact.popupTitle")}</h3>
          <button className="email-popup-close" onClick={onClose} title={t("contact.closeTitle")}>
            <X size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div className="email-popup-content">
          <div className="email-display">
            <span className="email-text">{email}</span>
            <button
              className="copy-email-btn"
              onClick={() => {
                navigator.clipboard.writeText(email || "");
                onCopied?.();
                onClose();
              }}
              title={mode === "self" ? t("contact.copy") : t("contact.copy") + " email"}
            >
              <Copy size={14} strokeWidth={1.8} aria-hidden="true" /> {t("contact.copy")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
