import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/home/css/landing-styles.css';
import '../components/home/css/modal-overlay.css';

import LandingHero from '../components/home/LandingHero';
import LandingLinkSection from "../components/home/LandingLinkSection";
import LandingTemplatesParallax from "../components/home/LandingTemplatesParallax";
import LandingCreatorsShowcase from "../components/home/LandingCreatorsShowcase";
import LandingFinalCTA from "../components/home/LandingFinalCTA";
import LandingFooter from '../components/home/LandingFooter';

import LoginModal from '../components/home/LoginModal';
import RegisterModal from '../components/home/RegisterModal';
import PasswordResetModal from '../components/home/PasswordResetModal';

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