import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/landing/css/landing-styles.css';
import '../components/landing/css/modal-overlay.css';

import LandingHero from '../components/landing/LandingHero';
import LandingLinkSection from "../components/landing/LandingLinkSection";
import LandingTemplatesParallax from "../components/landing/LandingTemplatesParallax";
import LandingCreatorsShowcase from "../components/landing/LandingCreatorsShowcase";
import LandingFiltersShowcase from "../components/landing/LandingFiltersShowcase";
import LandingHeaderActions from '../components/landing/LandingHeaderActions';
import LandingFinalCTA from "../components/landing/LandingFinalCTA";
import LandingMainHero from '../components/landing/LandingMainHero';
import LandingWhySection from '../components/landing/LandingWhySection';
import LandingHowSection from '../components/landing/LandingHowSection';
import LandingForWhoSection from '../components/landing/LandingForWhoSection';
import LandingClosingCTA from '../components/landing/LandingClosingCTA';
import LandingFooter from '../components/landing/LandingFooter';
import LandingProfilesColumn from '../components/landing/LandingProfilesColumn';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('authToken');

  // Muchos sitios de la app siguen pidiendo el registro indirectamente vía
  // navigate('/', { state: { showRegister: true } }) (patrón antiguo, de
  // cuando esto abría un modal aquí mismo) — en vez de tocar cada uno de
  // esos sitios, se reenvían todos a /register desde aquí.
  useEffect(() => {
    if (location.state?.showRegister) {
      if (isLoggedIn) {
        navigate('/explorer', { replace: true });
        return;
      }
      navigate('/register', { replace: true });
    }
  }, [location, navigate, isLoggedIn]);

  // Los botones de la barra se ven siempre; la marca THEFOLDER/ de la barra
  // entra justo cuando el texto de la primera pantalla ("Hi, we are
  // THEFOLDER/,...") termina de pasar por debajo de la barra, ni antes (se
  // repetiría) ni después (quedaría un hueco sin marca).
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const heroText = document.querySelector('.tf-finalCta__brand');
      const bar = document.querySelector('.tf-actionsbar');
      if (!heroText) { setPastHero(window.scrollY > window.innerHeight); return; }
      const barBottom = bar ? bar.getBoundingClientRect().bottom : 64;
      setPastHero(heroText.getBoundingClientRect().bottom <= barBottom);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleAuthClick = (path) => {
    if (isLoggedIn) { navigate('/explorer'); return; }
    navigate(path);
  };

  return (
  <div className="page-wrapper">
    <LandingHeaderActions
      onLoginClick={() => handleAuthClick('/login')}
      onRegisterClick={() => handleAuthClick('/register')}
      brandHidden={!pastHero}
    />

    {/* Comentado hasta nuevo aviso — solo navbar + footer + la columna de
        fotos de abajo mientras tanto. */}
    {/* <LandingHero
      onRegisterClick={() => navigate('/register')}
      onLoginClick={() => navigate('/login')}
    /> */}

    {/* <LandingLinkSection
    onCtaClick={() => navigate('/register')} /> */}

    {/* <LandingTemplatesParallax
    onCtaClick={() => navigate('/register')} /> */}

    {/* <LandingCreatorsShowcase
      explorePath="/creatives"
      onRegisterClick={() => navigate('/register')}
    /> */}

    {/* <LandingFiltersShowcase /> */}

    {/* Primera pantalla (100vh): la landing anterior, la que sigue en
        thefolder.es: THEFOLDER/ gigante en el centro, dos columnas de texto y
        "Crea tu perfil gratis" (LandingFinalCTA), sin su navbar antiguo.
        Desde ahí hacia abajo, la landing nueva (oct 2026, decisión del
        usuario). LandingMainHero ("what" + fotos) queda fuera mientras tanto. */}
    <LandingFinalCTA
      onCtaClick={() => handleAuthClick('/register')}
    />

    {/* <LandingMainHero /> */}
    {/* Secciones de texto pautado con una sola columna de fotos de perfiles
        a la derecha, de (WHY) hasta (FOR WHO). */}
    <div className="tf-ruled-flow">
      <LandingWhySection />
      <LandingHowSection />
      <LandingForWhoSection />
      <LandingProfilesColumn />
    </div>

    {/* Cierre aparte (sin la columna de fotos) y footer juntos en una última
        pantalla: en escritorio los dos van abajo del todo, seguidos (ver
        .tf-landing-end en landing-ruled.css); en móvil, como antes. */}
    <div className="tf-landing-end">
      <LandingClosingCTA onCtaClick={() => handleAuthClick('/register')} />
      <LandingFooter />
    </div>
  </div>
  );
};

export default Home;