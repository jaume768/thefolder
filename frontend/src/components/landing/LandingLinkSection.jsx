import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("landing");
  const sectionRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [nameIndex, setNameIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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
      {/* GRID 12 columnas */}
      <div className="tf-link__grid">

        {/* TOP LEFT — cols 1-5 */}
        <div className="tf-link__top-left">
          <p className="tf-link__kicker">{t("linkSection.kicker")}</p>
          <p className="tf-link__title">
            {t("linkSection.title")}
          </p>
        </div>

        {/* URL TYPEWRITER — cols 1-12, centrada */}
        <div className="tf-link__url-row">
          <span className="tf-link__domain">thefolder.es/</span>
          <span className="tf-link__user">{currentName}</span>
          <span className="tf-link__cursor" aria-hidden="true">|</span>
        </div>

        {/* BOTTOM RIGHT — cols 8-12 */}
        <div className="tf-link__bottom-right">
          <p className="tf-link__desc">
            {t("linkSection.desc")}
          </p>
        </div>

      </div>
    </section>
  );
}