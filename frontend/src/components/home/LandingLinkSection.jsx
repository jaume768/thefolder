import React, { useEffect, useRef, useState } from "react";
import "./css/landing-link.css";

const USERNAMES = [
  "andreagarcia",
  "laura.styling",
  "lucasmartin",
  "clararojas",
  "nicoperez",
  "sofiaalonso",
  "alex.ph",
];

export default function LandingLinkSection({ onCtaClick }) {
  const sectionRef = useRef(null);

  // Reveal state
  const [isVisible, setIsVisible] = useState(false);

  // Typewriter state
  const [currentName, setCurrentName] = useState("");
  const [nameIndex, setNameIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Reveal when section enters view (NO scroll snapping)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Typewriter username (puedes pausarlo hasta que sea visible, opcional)
  useEffect(() => {
    if (!isVisible) return;

    const fullName = USERNAMES[nameIndex];
    let timeout;

    if (!isDeleting && charIndex < fullName.length) {
      timeout = setTimeout(() => {
        setCurrentName(fullName.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 80);
    }

    if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setCurrentName(fullName.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, 40);
    }

    if (!isDeleting && charIndex === fullName.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1300);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setNameIndex((i) => (i + 1) % USERNAMES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, nameIndex, isVisible]);

  return (
    <section
      className={`tf-link ${isVisible ? "tf-link--visible" : ""}`}
      ref={sectionRef}
      aria-label="Personal link preview"
    >
      <div className="tf-link__inner">
        <div className="tf-link__headline" aria-label={`thefolder.es/${currentName}`}>
          <div className="tf-link__half-left">
            <span className="tf-link__domain">thefolder.es/</span>
          </div>
          <div className="tf-link__half-right">
            <span className="tf-link__user">{currentName}</span>
            <span className="tf-link__cursor" aria-hidden="true">|</span>
          </div>
        </div>

        <div className="tf-link__content">
          <p className="tf-link__kicker">UN SOLO LINK.</p>
          <p className="tf-link__title">CV + PORTFOLIO, SIEMPRE ACTUALIZADOS.</p>

          <p className="tf-sub tf-only-desktop">
            Copia y pega tu enlace. Compártelo con empresas, estudios o en redes sociales.
            <br />
            Sin PDFs. Sin adjuntos. Sin webs complicadas.
          </p>

          <p className="tf-sub tf-only-mobile">
            Copia y pega tu enlace. Compártelo con empresas, estudios o en redes sociales.
          </p>

          <button type="button" className="tf-link__cta" onClick={onCtaClick}>
            Crea tu link personal <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
