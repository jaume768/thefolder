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
import '../../components/controlPanel/css/explorer.css';
import '../../components/controlPanel/css/Creatives.css';
import { getRandomAuthShowcaseImage } from '../../utils/authShowcaseImages';

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
  // Elegida una sola vez al montar: se mantiene la misma imagen durante
  // todo el wizard (no debe cambiar entre pasos).
  const [showcaseImage] = useState(() => getRandomAuthShowcaseImage());
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

  // ── Paso 6: foto (opcional) → submit ────────────────────────────────────
  // Sin foto, el usuario puede saltar este paso y terminar el registro
  // igualmente (ver PhotoStep.jsx: "Salta y finalizar" cuando data.photo
  // está vacío) — la subida de foto solo ocurre si hay una.
  const handlePhotoNext = async () => {
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');

      // 1. Subir foto primero (si el usuario eligió una) — si falla, no avanzar
      if (data.photo) {
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
  // TypeStep (paso 1) oculto temporalmente — el flujo real activo son los
  // 5 pasos siguientes (Username → Photo), de ahí TOTAL_STEPS=5. Si se
  // reactiva TypeStep, subir esto a 6 y ajustar stepIndex.
  const TOTAL_STEPS = 5;
  const stepIndex = Math.min(Math.max(step - 1, 0), TOTAL_STEPS);
  const progressPct = Math.round((stepIndex / TOTAL_STEPS) * 100);

  return (
    <div className="ob-page ob-wizard">
      <div className="ob-content-panel">
        <span className="ob-mark" aria-hidden="true">
          <span className="ob-mark-t">T</span>
          <span className="ob-mark-slash">/</span>
        </span>

        <div
          className="ob-progress-track"
          role="progressbar"
          aria-valuenow={stepIndex}
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS}
          aria-label={t('common.stepProgress', { current: stepIndex, total: TOTAL_STEPS })}
        >
          <div className="ob-progress-fill" style={{ width: `${progressPct}%` }} />
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

      <div className="ob-image-panel">
        <img src={showcaseImage.src} alt="" />
        <p className="auth-image-credit">
          Image by{' '}
          <a href={showcaseImage.creditUrl} target="_blank" rel="noopener noreferrer">
            {showcaseImage.creditName}
          </a>
        </p>
      </div>
    </div>
  );
};

export default OnboardingWizard;
