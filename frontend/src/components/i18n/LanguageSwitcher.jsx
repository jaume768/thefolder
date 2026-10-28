import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LANGUAGES = [
  { code: "en", label: "EN", flag: "/iconos/flag/united-kingdom.png", available: true  },
  { code: "es", label: "ES", flag: "/iconos/flag/spain-flag.png",     available: true  },
  { code: "fr", label: "FR", flag: "/iconos/flag/france-flag.png",    available: false },
  { code: "it", label: "IT", flag: "/iconos/flag/italy.png",          available: false },
  { code: "pt", label: "PT", flag: "/iconos/flag/portugal.png",       available: false },
  { code: "de", label: "DE", flag: "/iconos/flag/germany.png",        available: false },
];

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation("common");
  const current = normalizeLang(i18n.language);

  function normalizeLang(lng) {
    if (!lng) return "en";
    const base = lng.toLowerCase().split("-")[0];
    return base === "es" ? "es" : "en";
  }
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? { label: current.toUpperCase(), flag: null };

  const change = (lang) => {
    if (!lang.available) return;
    i18n.changeLanguage(lang.code);
    setOpen(false);
  };

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // No solo mobile: cualquier trigger cerca del borde inferior del
      // viewport (p.ej. .tf-footer__language, pegado abajo del todo en
      // desktop) haría que el dropdown se abriera hacia abajo y quedara
      // fuera de pantalla — sin espacio para hacer clic en ninguna opción.
      // Estimación de alto en vez de medir el nodo ya montado: evita un
      // segundo render/flicker solo para reposicionar.
      const estimatedDropdownHeight = 12 + LANGUAGES.length * 30 + (LANGUAGES.length - 1) * 6;
      const opensUpward = window.innerHeight - rect.bottom < estimatedDropdownHeight + 8;
      setDropPos(
        opensUpward
          ? { bottom: window.innerHeight - rect.top + 8, left: rect.left + rect.width / 2 }
          : { top: rect.bottom + 8, left: rect.left + rect.width / 2 }
      );
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const inTrigger  = triggerRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const dropdownStyle = dropPos.bottom != null
    ? { bottom: dropPos.bottom, left: dropPos.left }
    : { top: dropPos.top,    left: dropPos.left };

  return (
    <div ref={triggerRef} className={`ls-wrapper ${className}`}>
      <button
        type="button"
        className="ls-trigger"
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentLang.label}
      </button>

      {open && createPortal(
        <div ref={dropdownRef} className="ls-dropdown ls-dropdown--portal" style={dropdownStyle} role="listbox">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === current}
              className={`ls-option ${lang.code === current ? "is-active" : ""} ${!lang.available ? "is-disabled" : ""}`}
              onClick={() => change(lang)}
            >
              <span className="ls-option-left">
                {lang.flag && <img src={lang.flag} alt="" className="ls-flag" aria-hidden="true" />}
                {lang.label}
              </span>
              {!lang.available && <span className="ls-soon">soon</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
