import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import "./css/landing-header-actions.css";

// Header propio de la landing — no usa .dashboard-header.landing-header
// (la pill fija con marca+nav que comparten el resto de páginas). Fijo
// arriba, marca a la izquierda y acciones (login/register) a la derecha,
// separadas en todo el ancho. La marca arranca grande (mismo tamaño que
// tenía dentro del hero) y se reduce al 20% en cuanto empieza el scroll.
// brandHidden: en Home, mientras se ve la primera pantalla (que ya lleva
// THEFOLDER/ gigante) la marca de la barra no se ve; los botones sí.
// compact: fuera de la landing (p.ej. /creatives sin sesión) la barra sale ya
// en su tamaño de scroll (marca pequeña, fondo difuminado) desde arriba, y la
// marca THEFOLDER/ es un enlace a la home.
export default function LandingHeaderActions({ onLoginClick, onRegisterClick, brandHidden = false, compact = false }) {
  const { t } = useTranslation("common");

  // Se queda siempre (con fondo difuminado al bajar, ver el CSS) salvo en el
  // footer: se va justo cuando el borde de arriba de .tf-footer llega a la
  // barra, ni antes ni después, y vuelve al subir. Se mide en cada scroll
  // (no con IntersectionObserver + margen como antes, que la quitaba antes
  // de tiempo).
  const barRef = useRef(null);
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    const check = () => {
      const footer = document.querySelector(".tf-footer");
      const bar = barRef.current;
      if (!footer || !bar) { setAtFooter(false); return; }
      // Si el footer es más bajo que la pantalla (móvil, 80vh) su borde nunca
      // llega a la barra: ahí cuenta como "llegado" cuando ya está entero en
      // pantalla (final de la página).
      const limit = Math.max(bar.offsetHeight, window.innerHeight - footer.offsetHeight);
      setAtFooter(footer.getBoundingClientRect().top <= limit + 1);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Entrada por transición (no @keyframes/animation): una animación con
  // fill-mode "forwards" deja su valor final de opacity fijado por encima
  // de cualquier clase posterior en la cascada, así que is-footer-hidden
  // nunca podía ganarle — por eso la barra nunca llegaba a desaparecer.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Burger en móvil y tablet vertical (ver media query en el CSS): en
  // desktop el botón está oculto y las acciones se ven siempre en línea.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Al irse en el footer, el menú (móvil) se cierra con ella.
  useEffect(() => {
    if (atFooter) setMenuOpen(false);
  }, [atFooter]);

  const runAction = (fn) => () => {
    setMenuOpen(false);
    fn?.();
  };

  return (
    <div
      ref={barRef}
      className={`tf-actionsbar ${ready ? "is-ready" : ""} ${atFooter ? "is-footer-hidden" : ""} ${scrolled || compact ? "is-scrolled" : ""} ${brandHidden ? "is-brand-hidden" : ""}`}
    >
      {compact ? (
        <a className="tf-mainhero__brand tf-actionsbar__home" href="/">THEFOLDER/</a>
      ) : (
        <div className="tf-mainhero__brand">THEFOLDER/</div>
      )}

      <div className={`tf-actionsbar__menu ${menuOpen ? "is-open" : ""}`} ref={menuRef}>
        <button
          type="button"
          className="tf-actionsbar__burger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="tf-actionsbar-actions"
        >
          {menuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
        </button>

        <div className="tf-actionsbar__actions" id="tf-actionsbar-actions">
          <button type="button" className="tf-actionsbar__login" onClick={runAction(onLoginClick)}>
            {t("actions.login")}
          </button>
          <button type="button" className="tf-actionsbar__cta" onClick={runAction(onRegisterClick)}>
            {t("actions.register")}
          </button>
        </div>
      </div>
    </div>
  );
}
