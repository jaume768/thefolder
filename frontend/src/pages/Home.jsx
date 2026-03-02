import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/landing/css/landing-styles.css';
import '../components/landing/css/modal-overlay.css';

import LandingHero from '../components/landing/LandingHero';
import LandingLinkSection from "../components/landing/LandingLinkSection";
import LandingTemplatesParallax from "../components/landing/LandingTemplatesParallax";
import LandingCreatorsShowcase from "../components/landing/LandingCreatorsShowcase";
import LandingFinalCTA from "../components/landing/LandingFinalCTA";
import LandingFooter from '../components/landing/LandingFooter';

import LoginModal from '../components/landing/LoginModal';
import RegisterModal from '../components/landing/RegisterModal';
import PasswordResetModal from '../components/landing/PasswordResetModal';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    if (location.state?.showRegister) {
      setShowRegister(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleSwitchToRegister = () => {
    navigate('/');
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToReset = () => {
    setShowLogin(false);
    setShowPasswordReset(true);
  };

  return (
  <div className="page-wrapper">
    {/* Always render the landing page content */}
    <LandingHero
      onRegisterClick={() => setShowRegister(true)}
      onLoginClick={() => setShowLogin(true)}
    />
    
    <LandingLinkSection 
    onCtaClick={() => setShowRegister(true)} />

    <LandingTemplatesParallax 
    onCtaClick={() => setShowRegister(true)} />

    <LandingCreatorsShowcase
      explorePath="/creatives"
      onRegisterClick={() => setShowRegister(true)}
    />

    <LandingFinalCTA
      onCtaClick={() => setShowRegister(true)}
    />


    <LandingFooter />

    {/* Add these modals back */}
    {showLogin && (
      <LoginModal
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToReset={handleSwitchToReset}
      />
    )}

    {showRegister && (
      <RegisterModal
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    )}

    {showPasswordReset && (
      <PasswordResetModal
        onClose={() => setShowPasswordReset(false)}
        onSwitchToLogin={() => {
          setShowPasswordReset(false);
          setShowLogin(true);
        }}
      />
    )}
  </div>
  );
};

export default Home;