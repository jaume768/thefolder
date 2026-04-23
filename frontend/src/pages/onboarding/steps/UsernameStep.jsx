import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

const normalizeUsername = (value) =>
  String(value || '').replace(/\s+/g, '').toLowerCase();

const UsernameStep = ({ accountType, username, suggestedUsername, onChange, onNext, onBack }) => {
  const inputRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation('onboarding');

  const [checking, setChecking] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [error, setError] = useState('');

  const localError = useMemo(() => {
    const v = username.trim();
    if (!v) return '';
    if (v.length > 20) return t('username.errors.tooLong');
    if (!/^[a-z0-9-]+$/.test(v)) return t('username.errors.invalidChars');
    if (v.startsWith('-') || v.endsWith('-')) return t('username.errors.dashBoundary');
    if (v.includes('--')) return t('username.errors.doubleDash');
    return '';
  }, [username, t]);

  // Disponibilidad con debounce
  useEffect(() => {
    const v = username.trim();
    setError('');
    if (!v || localError) { setIsTaken(false); setChecking(false); return; }

    const token = localStorage.getItem('authToken');
    if (!token) { setIsTaken(false); setChecking(false); return; }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(
          `${backendUrl}/api/users/check-username?username=${encodeURIComponent(v)}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setIsTaken(data?.available === false);
        }
      } catch (e) {
        if (e.name !== 'AbortError') setIsTaken(false);
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => { clearTimeout(timeout); controller.abort(); };
  }, [username, localError, backendUrl]);

  const isOk = !!username && !localError && !checking && !isTaken;

  const handleNext = () => {
    if (!isOk) { setError(localError || (isTaken ? t('username.errors.taken') : '')); return; }
    setError('');
    onNext();
  };

  const typeLabel = accountType === 'creative' ? t('username.typeCreative') : t('username.typeCompany');

  return (
    <div className="ob-center">
      <h1 className="ob-title">{t('username.title')}</h1>
      <p className="ob-subtitle">
        <Trans
          i18nKey="username.subtitle"
          ns="onboarding"
          values={{ type: typeLabel }}
          components={{ br: <br /> }}
        />
      </p>

      <div
        className={`ob-username ${username ? 'has-value' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <span className="ob-prefix">thefolder.es/</span>

        <input
          ref={inputRef}
          className="ob-input"
          value={username}
          placeholder={suggestedUsername || t('username.placeholder')}
          onChange={e => onChange(normalizeUsername(e.target.value))}
          onKeyDown={e => { if (e.key === ' ') e.preventDefault(); }}
          onPaste={e => { e.preventDefault(); onChange(normalizeUsername(e.clipboardData.getData('text'))); }}
          maxLength={20}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label={t('username.inputAria')}
        />

        <span
          className={[
            'ob-status',
            checking ? 'is-checking' : '',
            isTaken ? 'is-bad' : '',
            isOk ? 'is-ok' : '',
          ].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          {checking ? '…' : isTaken ? '×' : isOk ? '✓' : ''}
        </span>

        <span className="ob-underline" />
      </div>

      {localError && username && <p className="ob-error">{localError}</p>}
      {isTaken && !checking && !localError && (
        <p className="ob-error">{t('username.errors.takenLong')}</p>
      )}
      {error && !localError && !isTaken && <p className="ob-error">{error}</p>}

      <div className="ob-buttons">
        {onBack && <button type="button" className="ob-back" onClick={onBack}>{t('common.back')}</button>}
        <button className="ob-cta" disabled={!isOk} onClick={handleNext}>
          {t('common.continue')}
        </button>
      </div>

      <div className="ob-dots" aria-hidden="true">
        <span className="dot" />
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
};

export default UsernameStep;
