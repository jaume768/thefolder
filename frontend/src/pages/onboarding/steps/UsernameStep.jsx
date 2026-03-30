import React, { useEffect, useMemo, useRef, useState } from 'react';

const normalizeUsername = (value) =>
  String(value || '').replace(/\s+/g, '').toLowerCase();

const UsernameStep = ({ accountType, username, suggestedUsername, onChange, onNext, onBack }) => {
  const inputRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [checking, setChecking] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [error, setError] = useState('');

  const localError = useMemo(() => {
    const v = username.trim();
    if (!v) return '';
    if (v.length > 20) return 'Máximo 20 caracteres.';
    if (!/^[a-z0-9-]+$/.test(v)) return 'Solo letras minúsculas, números y guiones.';
    if (v.startsWith('-') || v.endsWith('-')) return 'No puede empezar ni acabar con guión.';
    if (v.includes('--')) return 'No puede contener guión doble.';
    return '';
  }, [username]);

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
    if (!isOk) { setError(localError || (isTaken ? 'Ese nombre ya está en uso.' : '')); return; }
    setError('');
    onNext();
  };

  const typeLabel = accountType === 'creative' ? 'creativo' : 'empresa';

  return (
    <div className="ob-center">
      <h1 className="ob-title">Elige tu nombre de usuario</h1>
      <p className="ob-subtitle">
        Este será tu enlace público como perfil {typeLabel}.<br />
        Solo letras minúsculas, números y guiones. Máximo 20 caracteres.
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
          placeholder={suggestedUsername || 'tunombreusuario'}
          onChange={e => onChange(normalizeUsername(e.target.value))}
          onKeyDown={e => { if (e.key === ' ') e.preventDefault(); }}
          onPaste={e => { e.preventDefault(); onChange(normalizeUsername(e.clipboardData.getData('text'))); }}
          maxLength={20}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Nombre de usuario"
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
        <p className="ob-error">Ese nombre ya está en uso. Prueba con otro.</p>
      )}
      {error && !localError && !isTaken && <p className="ob-error">{error}</p>}

      <div className="ob-buttons">
        <button type="button" className="ob-back" onClick={onBack}>Volver atrás</button>
        <button className="ob-cta" disabled={!isOk} onClick={handleNext}>
          CONTINUAR
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
