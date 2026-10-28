// pages/LoginPage.jsx
// /login — antes un modal (LoginModal.jsx, ver components/landing/) que se
// abría por encima de la página actual. Ahora es su propia ruta con el
// mismo split-screen que /complete-registration (ob-wizard): imagen a la
// derecha, formulario a la izquierda. También es el destino cuando expira
// la sesión (ver SessionExpiredGate en App.jsx): en vez de un modal, se
// redirige aquí con location.state.sessionExpired para mostrar el aviso.
// LoginModal.jsx/SessionExpiredModal.jsx ya no se usan en ningún sitio.
//
// El flujo de "olvidé mi contraseña" (antes PasswordResetModal.jsx, un
// overlay con su propio look) vive ahora aquí también, como pasos internos
// (authStep) dentro del mismo .auth-shell/.auth-content-panel — mismo
// patrón que el paso "verify" de RegisterPage.jsx, incluida la caja de
// código de 6 dígitos (.code-row/.code-cell). Los endpoints y el orden de
// las llamadas no cambian, solo la capa visual.
import React, { useContext, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import '../components/landing/css/login-modal.css';
import '../components/landing/css/register-modal.css';
import './css/auth-page.css';
import { getRandomAuthShowcaseImage } from '../utils/authShowcaseImages';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStep, setAuthStep] = useState('login'); // 'login' | 'reset-email' | 'reset-verify' | 'reset-password'
  const { t } = useTranslation('auth');
  const { t: tModals } = useTranslation('modals');
  const [showcaseImage] = useState(() => getRandomAuthShowcaseImage());

  const [resetEmail, setResetEmail] = useState('');
  const [resetCodeDigits, setResetCodeDigits] = useState(Array(6).fill(''));
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmNewPassword, setResetConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        const user = data.user || {};
        login(data.token, user, data.refreshToken);

        // Mismo criterio que LoginModal.jsx: sin accountType NI
        // profileCompleted → wizard (usuario nuevo); si no, entrar directo.
        // Si se llegó aquí desde una ruta protegida o por sesión caducada
        // (location.state.from, ver App.jsx), se vuelve a esa página.
        const needsWizard = !user.accountType && !user.profileCompleted;
        const from = location.state?.from;
        const backTo = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && from !== '/login'
          ? from
          : '/explorer';
        navigate(needsWizard ? '/complete-registration' : backTo, { replace: true });
      } else {
        setError(data.message || t('login.genericError'));
      }
    } catch (err) {
      setError(t('login.networkError'));
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const resetToLogin = () => {
    setAuthStep('login');
    setResetEmail('');
    setResetCodeDigits(Array(6).fill(''));
    setResetNewPassword('');
    setResetConfirmNewPassword('');
    setResetError('');
    setResetSuccess('');
  };

  // Paso 1: Enviar email para solicitar código de verificación
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResetError(data.error || t('reset.errors.sendFailed'));
        return;
      }
      setResetSuccess(data.message || t('reset.success.emailSent'));
      setAuthStep('reset-verify');
    } catch (err) {
      setResetError(t('reset.errors.network'));
    }
  };

  const handleResetDigitChange = (e, index) => {
    const { value } = e.target;

    if (/^\d?$/.test(value)) {
      const newDigits = [...resetCodeDigits];
      newDigits[index] = value;
      setResetCodeDigits(newDigits);

      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`reset-code-digit-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      if (value === '' && index > 0) {
        const prevInput = document.getElementById(`reset-code-digit-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleResetPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text');
    const digits = pasteData.split('').filter(char => /\d/.test(char)).slice(0, 6);

    if (digits.length > 0) {
      setResetCodeDigits(digits);
      const nextInput = document.getElementById(`reset-code-digit-${Math.min(digits.length, 5)}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Paso 2: Verificar el código recibido
  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const code = resetCodeDigits.join('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/auth/verify-forgot-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResetError(data.error || t('reset.errors.invalidCode'));
        return;
      }
      setResetSuccess(data.message || t('reset.success.codeVerified'));
      setAuthStep('reset-password');
    } catch (err) {
      setResetError(t('reset.errors.network'));
    }
  };

  // Paso 3: Resetear la contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (resetNewPassword !== resetConfirmNewPassword) {
      setResetError(t('reset.errors.passwordMismatch'));
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const code = resetCodeDigits.join('');
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code, newPassword: resetNewPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResetError(data.error || t('reset.errors.resetFailed'));
        return;
      }
      setResetSuccess(data.message || t('reset.success.passwordUpdated'));
      setTimeout(() => {
        resetToLogin();
      }, 2000);
    } catch (err) {
      setResetError(t('reset.errors.network'));
    }
  };

  return (
    <div className="auth-shell">
      <button
        type="button"
        className="auth-mark"
        onClick={() => navigate('/')}
        aria-label="THEFOLDER"
      >
        <span className="auth-mark-t">T</span>
        <span className="auth-mark-slash">/</span>
      </button>

      <div className="auth-content-panel">

        <div className="auth-center">
          {authStep === 'login' && (
            <>
              <h1 className="auth-title">{t('login.title')}</h1>
              {sessionExpired && !error && (
                <p className="auth-notice">{tModals('sessionExpired.body')}</p>
              )}
              {error && <p className="error">{error}</p>}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label htmlFor="email">{t('login.email')}</label>
                  <input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">{t('login.password')}</label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <a
                  href="#"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthStep('reset-email');
                  }}
                >
                  {t('login.forgot')}
                </a>

                <button className="btn login-btn" type="submit">
                  {t('login.submit')}
                </button>
              </form>

              <button className="btn google-btn" onClick={handleGoogleLogin}>
                <img src="/iconos/google-logo.png" alt="Google" className="google-icon" />
                {t('login.google')}
              </button>

              <div className="extra-links">
                <p>
                  {t('login.noAccount')}{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/register');
                    }}
                  >
                    {t('login.registerLink')}
                  </a>
                </p>
              </div>
            </>
          )}

          {authStep === 'reset-email' && (
            <>
              <h1 className="auth-title">{t('reset.emailTitle')}</h1>

              {resetError && <p className="error">{resetError}</p>}
              {resetSuccess && <p className="success">{resetSuccess}</p>}

              <form onSubmit={handleSendResetEmail}>
                <div className="input-group">
                  <label htmlFor="reset-email">{t('reset.emailLabel')}</label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder={t('reset.emailPlaceholder')}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn login-btn">
                  {t('reset.send')}
                </button>
              </form>

              <div className="extra-links">
                <p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      resetToLogin();
                    }}
                  >
                    {t('reset.backToLogin')}
                  </a>
                </p>
              </div>
            </>
          )}

          {authStep === 'reset-verify' && (
            <>
              <h1 className="auth-title">{t('reset.verifyTitle')}</h1>

              <p className="verify-sub">
                <Trans
                  i18nKey="reset.verifySubtitle"
                  ns="auth"
                  values={{ email: resetEmail }}
                  components={{ 1: <strong style={{ fontWeight: 500, color: '#111', textDecoration: 'underline' }} /> }}
                />
              </p>

              <form onSubmit={handleVerifyResetCode}>
                <div className="code-row">
                  {resetCodeDigits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      placeholder="-"
                      onChange={(e) => handleResetDigitChange(e, index)}
                      onPaste={index === 0 ? handleResetPaste : undefined}
                      id={`reset-code-digit-${index}`}
                      className="code-cell"
                      inputMode="numeric"
                    />
                  ))}
                </div>

                {resetError && <p className="resend-row error">{resetError}</p>}
                {resetSuccess && <p className="resend-row success">{resetSuccess}</p>}

                <button type="submit" className="btn login-btn">
                  {t('reset.verifySubmit')}
                </button>
              </form>

              <div className="extra-links">
                <p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      resetToLogin();
                    }}
                  >
                    {t('reset.backToLogin')}
                  </a>
                </p>
              </div>
            </>
          )}

          {authStep === 'reset-password' && (
            <>
              <h1 className="auth-title">{t('reset.resetTitle')}</h1>

              {resetError && <p className="error">{resetError}</p>}
              {resetSuccess && <p className="success">{resetSuccess}</p>}

              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <label htmlFor="new-password">{t('reset.newPassword')}</label>
                  <input
                    id="new-password"
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder={t('reset.newPasswordPlaceholder')}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowResetPassword(v => !v)}
                    aria-label={showResetPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showResetPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <div className="input-group">
                  <label htmlFor="confirm-new-password">{t('reset.confirmPassword')}</label>
                  <input
                    id="confirm-new-password"
                    type={showResetConfirmPassword ? 'text' : 'password'}
                    placeholder={t('reset.confirmPasswordPlaceholder')}
                    value={resetConfirmNewPassword}
                    onChange={(e) => setResetConfirmNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowResetConfirmPassword(v => !v)}
                    aria-label={showResetConfirmPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showResetConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <button type="submit" className="btn login-btn">
                  {t('reset.resetSubmit')}
                </button>
              </form>

              <div className="extra-links">
                <p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      resetToLogin();
                    }}
                  >
                    {t('reset.backToLogin')}
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="auth-image-panel">
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

export default LoginPage;
