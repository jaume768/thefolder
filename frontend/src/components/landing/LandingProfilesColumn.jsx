import React from "react";
import { AUTH_SHOWCASE_IMAGES } from "../../utils/authShowcaseImages";
import "./css/landing-ruled.css";

// Columna de la derecha de la landing, desde (WHY) hasta el final: fotos de
// perfiles de gente, una debajo de otra sin parar (oct 2026, decisión del
// usuario; antes cada sección tenía su propia foto). De momento salen de
// /multimedia/landing; se repiten las veces que haga falta para llenar el
// alto y lo que no cabe entera no se ve (.tf-profiles-column).
//
// Cada foto lleva al perfil de su autor/a, con los mismos créditos que el
// panel de /login y /register (utils/authShowcaseImages.js). Las que no
// tienen crédito ahí van sin enlace.
const ORDER = [
  "/multimedia/landing/register-thefolder-by-ayla.jpg",
  "/multimedia/landing/login-thefolderby-bernat.jpg",
  "/multimedia/landing/login-thefolder-by-MaríaGonzalez.jpg",
  "/multimedia/landing/register-thefolder-by-ccmm.jpg",
  "/multimedia/landing/login-thefolder-ainhoa.gif",
  "/multimedia/landing/register-thefolder-by-giulia.jpg",
  "/multimedia/landing/login-thefolderby-MaríaGonzalez-2.jpg",
  "/multimedia/landing/register-thefolder-by-ccmm-2.jpg",
  "/multimedia/landing/login-thefolderby-MaríaGonzalez-3.jpg",
];

const CREDITS = Object.fromEntries(AUTH_SHOWCASE_IMAGES.map((img) => [img.src, img]));
const PROFILE_IMAGES = ORDER.map((src) => CREDITS[src] || { src });

// creditUrl es absoluta (https://thefolder.es/usuario): se usa solo la ruta
// para que funcione igual en local y en producción.
const profilePath = (url) => {
  try { return new URL(url).pathname; } catch { return url; }
};

const REPEAT = 3;

export default function LandingProfilesColumn() {
  return (
    <div className="tf-profiles-column">
      {Array.from({ length: REPEAT }).flatMap((_, r) =>
        PROFILE_IMAGES.map((img) => {
          const key = `${r}-${img.src}`;
          // Las repeticiones no se anuncian a lectores de pantalla ni se
          // enfocan con el teclado: solo la primera vuelta.
          const hidden = r > 0;
          if (!img.creditUrl) {
            return <img key={key} src={img.src} alt="" loading="lazy" />;
          }
          return (
            <a
              key={key}
              className="tf-profiles-column__link"
              href={profilePath(img.creditUrl)}
              title={img.creditName}
              aria-hidden={hidden || undefined}
              tabIndex={hidden ? -1 : undefined}
            >
              <img src={img.src} alt={img.creditName} loading="lazy" />
            </a>
          );
        })
      )}
    </div>
  );
}
