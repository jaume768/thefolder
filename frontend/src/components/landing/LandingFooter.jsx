import React from "react";
import "./css/landing-footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="tf-footer" role="contentinfo">
      <div className="tf-footer__inner">
        <div className="tf-footer__brand" aria-label={`© ${year} thefolder`}>
          <span className="tf-footer__mark" aria-hidden="true">©</span>
          <span className="tf-footer__year">{year}</span>
          <span className="tf-footer__name">thefolder</span>
        </div>

        <nav className="tf-footer__nav" aria-label="Enlaces del pie">
          <a className="tf-footer__link" href="/contacto">Contacto</a>
          <a className="tf-footer__link" href="/terminos">Términos</a>
          <a className="tf-footer__link" href="/privacidad">Privacidad</a>
        </nav>
      </div>
    </footer>
  );
}
