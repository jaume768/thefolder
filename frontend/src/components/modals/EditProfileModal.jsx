import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../modals/css/editprofilemodal.css";
import closeIcon from "../../../public/iconos/close.svg";


export default function Modal({ open, title, children, onClose, footer }) {
  const { t } = useTranslation('common');
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ux-modal-overlay" onClick={onClose}>
      <div className="ux-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ux-modal-header">
          <h3 className="ux-modal-title">{title}</h3>
          <button className="ux-modal-close" onClick={onClose} aria-label={t('actions.close')}>
            <img src={closeIcon} className="ux-icon" alt={t('actions.close')} />
          </button>
        </div>

        <div className="ux-modal-body">{children}</div>

        {footer ? <div className="ux-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
