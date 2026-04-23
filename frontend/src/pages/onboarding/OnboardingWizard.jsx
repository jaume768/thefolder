import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TypeStep from './steps/TypeStep';
import UsernameStep from './steps/UsernameStep';
import PersonalDataStep from './steps/PersonalDataStep';
import CreativeLevelStep from './steps/CreativeLevelStep';
import SpecializationStep from './steps/SpecializationStep';
import PhotoStep from './steps/PhotoStep';
import '../css/complete-registration.css';
import './css/onboarding.css';

const INITIAL_DATA = {
  accountType: 'creative', // TypeStep oculto temporalmente — valor fijo
  username: '',
  firstName: '',
  lastName: '',
  country: '',
  city: '',
  creativeLevel: null,
  professionalTags: [],
  photo: null,
};

const suggestUsername = (email) => {
  if (!email) return '';
  const prefix = email.split('@')[0] || '';
  return prefix
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
};

const getEmailFromToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || '';
  } catch {
    return '';
  }
};

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation('onboarding');

  const [step, setStep] = useState(2); // TypeStep oculto temporalmente — empieza en UsernameStep
  const [data, setData] = useState(INITIAL_DATA);
  const suggestedUsername = suggestUsername(getEmailFromToken());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Captura token desde ?token= (Google OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const setField = (field, value) =>
    setData(prev => ({ ...prev, [field]: value }));

  // ── Paso 1: elegir tipo ──────────────────────────────────────────────
  const handleTypeNext = () => {
    if (data.accountType === 'creative') setStep(2);
  };

  // ── Paso 2: username ─────────────────────────────────────────────────
  const handleUsernameNext = () => setStep(3);

  // ── Paso 3: datos personales ─────────────────────────────────────────
  const handlePersonalDataNext = () => setStep(4);

  // ── Paso 4: nivel creativo ───────────────────────────────────────────
  const handleCreativeLevelNext = () => setStep(5);

  // ── Paso 5: especialización ──────────────────────────────────────────
  const handleSpecializationNext = () => setStep(6);

  // ── Paso 6: foto → submit ─────────────────────────────────────────────
  const handlePhotoNext = async () => {
    if (!data.photo) return;
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');

      // 1. Subir foto primero — si falla, no avanzar
      const formData = new FormData();
      formData.append('file', data.photo);
      const photoRes = await fetch(`${backendUrl}/api/users/profile-picture`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!photoRes.ok) {
        const photoData = await photoRes.json().catch(() => ({}));
        setError(photoData.error || t('common.uploadError'));
        setSubmitting(false);
        return;
      }

      // 2. Completar registro
      const fullName = [data.firstName.trim(), data.lastName.trim()].filter(Boolean).join(' ');
      const res = await fetch(`${backendUrl}/api/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountType: data.accountType,
          username: data.username,
          fullName: fullName || undefined,
          creativeLevel: data.creativeLevel,
          city: data.city,
          country: data.country,
          professionalTags: data.professionalTags,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || t('common.genericError'));
        setSubmitting(false);
        return;
      }

      navigate('/explorer', { replace: true });
    } catch {
      setError(t('common.networkError'));
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="ob-page">
      <div className="ob-top-brand">
        <button type="button" className="button header-left-link ob-top-logo">THEFOLDER /</button>
      </div>

      {step === 1 && (
        <TypeStep
          selected={data.accountType}
          onSelect={v => { setField('accountType', v); setError(''); }}
          onNext={handleTypeNext}
        />
      )}

      {step === 2 && (
        <UsernameStep
          accountType={data.accountType}
          username={data.username}
          suggestedUsername={suggestedUsername}
          onChange={v => setField('username', v)}
          onNext={handleUsernameNext}
          onBack={null}
        />
      )}

      {step === 3 && (
        <PersonalDataStep
          firstName={data.firstName}
          lastName={data.lastName}
          country={data.country}
          city={data.city}
          onChange={setField}
          onNext={handlePersonalDataNext}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <CreativeLevelStep
          creativeLevel={data.creativeLevel}
          onChange={v => setField('creativeLevel', v)}
          onNext={handleCreativeLevelNext}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <SpecializationStep
          professionalTags={data.professionalTags}
          onChange={v => setField('professionalTags', v)}
          onNext={handleSpecializationNext}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && (
        <PhotoStep
          photo={data.photo}
          onChange={v => { setField('photo', v); setError(''); }}
          onClearError={() => setError('')}
          onNext={handlePhotoNext}
          onBack={() => setStep(5)}
          submitting={submitting}
          error={error}
        />
      )}
    </div>
  );
};

export default OnboardingWizard;
