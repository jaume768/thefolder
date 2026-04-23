import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";

const STORAGE_KEY = "thefolder_cookie_basic_ok";

export default function CookieBanner() {
  const { t } = useTranslation("landing");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!open) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <>
      <div className="tf-cookie__overlay" aria-hidden="true" onClick={accept} />
      <div className="tf-cookie" role="dialog" aria-label={t("cookies.ariaLabel")}>
        <button type="button" className="cp-close" onClick={accept} aria-label={t("cookies.close")}>
          <FaTimes />
        </button>
        <p className="tf-cookie__text">
          {t("cookies.textDesktop")}
        </p>
        <button type="button" className="tf-btn tf-btn--cookie" onClick={accept}>
          {t("cookies.accept")}
        </button>
        <a className="tf-cookie__link" href="/cookies">
          {t("cookies.policy")}
        </a>
      </div>

      <div className="tf-cookieSheet" role="dialog" aria-label={t("cookies.ariaLabel")}>
        <div className="tf-cookieSheet__overlay" aria-hidden="true" />
        <div className="tf-cookieSheet__panel">
          <button type="button" className="cp-close" onClick={accept} aria-label={t("cookies.close")}>
            <FaTimes />
          </button>
          <p className="tf-cookie__text">
            {t("cookies.textMobile")}
          </p>
          <button
            type="button"
            className="tf-btn tf-btn--cookie tf-cookieSheet__btn"
            onClick={accept}
          >
            {t("cookies.acceptUpper")}
          </button>
          <a className="tf-cookie__link" href="/cookies">
            {t("cookies.policy")}
          </a>
        </div>
      </div>
    </>
  );
}
