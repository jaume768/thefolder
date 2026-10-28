import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

const STORAGE_KEY = "thefolder_cookie_basic_ok";

function grantAnalytics() {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
    });
  }
}

function denyAnalytics() {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
    });
  }
}

export default function CookieBanner() {
  const { t } = useTranslation("landing");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const decision = localStorage.getItem(STORAGE_KEY);
    if (decision === "1") {
      grantAnalytics(); // restaura consentimiento en cada carga
    } else if (decision === "0") {
      denyAnalytics();
    } else {
      setOpen(true); // sin decisión previa → mostrar banner
    }
  }, []);

  if (!open) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    grantAnalytics();
    setOpen(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, "0");
    denyAnalytics();
    setOpen(false);
  };

  // Barra a todo el ancho pegada abajo (oct 2026, decisión del usuario; antes
  // una caja flotante con oscurecido en escritorio y una hoja redondeada en
  // móvil): mismo aspecto que la landing, sin oscurecer la página. Cerrar (X)
  // = rechazar, como antes al pulsar fuera.
  return (
    <div className="tf-cookiebar" role="dialog" aria-label={t("cookies.ariaLabel")}>
      <p className="tf-cookiebar__text">{t("cookies.textDesktop")}</p>

      <div className="tf-cookiebar__actions">
        <a className="tf-cookiebar__link" href="/cookies">
          {t("cookies.policy")}
        </a>
        <button type="button" className="tf-cookiebar__accept" onClick={accept}>
          {t("cookies.accept")}
        </button>
        <button
          type="button"
          className="tf-cookiebar__close"
          onClick={reject}
          aria-label={t("cookies.close")}
        >
          <X size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
