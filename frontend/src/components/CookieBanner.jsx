import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const STORAGE_KEY = "thefolder_cookie_basic_ok";

export default function CookieBanner() {
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
      <div className="tf-cookie" role="dialog" aria-label="Cookies">
        <button type="button" className="cp-close" onClick={accept} aria-label="Cerrar">
          <FaTimes />
        </button>
        <p className="tf-cookie__text">
          Usamos cookies básicas para que
          <br />
          la web funcione correctamente y
          <br />
          mejorar tu experiencia.
        </p>
        <button type="button" className="tf-btn tf-btn--cookie" onClick={accept}>
          Continuar
        </button>
        <a className="tf-cookie__link" href="/cookies">
          Política de cookies
        </a>
      </div>

      <div className="tf-cookieSheet" role="dialog" aria-label="Cookies">
        <div className="tf-cookieSheet__overlay" aria-hidden="true" />
        <div className="tf-cookieSheet__panel">
          <button type="button" className="cp-close" onClick={accept} aria-label="Cerrar">
            <FaTimes />
          </button>
          <p className="tf-cookie__text">
            Usamos cookies básicas para que la web funcione correctamente
            <br />
            y mejorar tu experiencia.
          </p>
          <button
            type="button"
            className="tf-btn tf-btn--cookie tf-cookieSheet__btn"
            onClick={accept}
          >
            CONTINUAR
          </button>
          <a className="tf-cookie__link" href="/cookies">
            Política de cookies
          </a>
        </div>
      </div>
    </>
  );
}
