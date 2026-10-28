// pages/RegisterPage.jsx
// /register — antes un modal (RegisterModal.jsx, ver components/landing/)
// que se abría por encima de la página actual. Ahora es su propia ruta con
// el mismo split-screen que /complete-registration (ob-wizard): imagen a
// la derecha, formulario a la izquierda — literalmente la misma imagen,
// para que el paso /register → /complete-registration se sienta como una
// sola pantalla continua. RegisterModal.jsx se queda tal cual por si algún
// sitio lo sigue usando como popup (guest wall de CreativesPage.jsx, etc.
// — ver migración en curso).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../components/landing/css/login-modal.css';
import '../components/landing/css/register-modal.css';
import './css/auth-page.css';
import { getRandomAuthShowcaseImage } from '../utils/authShowcaseImages';

const RegisterPage = () => {
  const [step, setStep] = useState('register');
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [showcaseImage] = useState(() => getRandomAuthShowcaseImage());

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({
    passwordMismatch: '',
    incomplete: '',
    email: '',
  });

  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));

  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    setErrors(prev => ({
      ...prev,
      passwordMismatch: '',
      incomplete: '',
      email: '',
    }));

    setBackendError('');
  };

  // Paso 1: Enviar datos para que se envíe el código (sin crear el usuario)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({
      passwordMismatch: '',
      incomplete: '',
      email: '',
    });

    setBackendError('');
    setSuccessMessage('');

    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.acceptedTerms
    ) {
      setErrors(prev => ({
        ...prev,
        incomplete: t('register.errors.incomplete'),
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        passwordMismatch: t('register.errors.passwordMismatch'),
      }));
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const payload = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptedTerms: formData.acceptedTerms,
      };

      const response = await fetch(
        `${backendUrl}/api/auth/send-verification-code-pre-registration`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setBackendError(data.error || t('register.errors.sendCodeFailed'));
        return;
      }

      setStep('verify');
    } catch (error) {
      setBackendError(t('register.errors.serverError'));
    }
  };

  const handleDigitChange = (e, index) => {
    const { value } = e.target;

    if (/^\d?$/.test(value)) {
      const newCodeDigits = [...codeDigits];
      newCodeDigits[index] = value;
      setCodeDigits(newCodeDigits);

      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`reg-code-digit-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      if (value === '' && index > 0) {
        const prevInput = document.getElementById(`reg-code-digit-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text');
    const digits = pasteData.split('').filter(char => /\d/.test(char)).slice(0, 6);

    if (digits.length > 0) {
      setCodeDigits(digits);
      const nextInput = document.getElementById(`reg-code-digit-${Math.min(digits.length, 5)}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Paso 2: Verificar el código introducido por el usuario
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationSuccess('');

    const code = codeDigits.join('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backendUrl}/api/auth/verify-code-pre-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVerificationError(data.error || t('verify.errors.invalid'));
        return;
      }

      setVerificationSuccess(data.message || t('verify.success'));

      const { token, refreshToken } = data;
      localStorage.setItem('authToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      navigate('/complete-registration');
    } catch (err) {
      setVerificationError(t('register.errors.networkError'));
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setResendMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backendUrl}/api/auth/resend-code-pre-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVerificationError(data.error || t('verify.errors.resendFailed'));
        return;
      }

      setResendMessage(data.message || t('verify.resendSuccess'));
    } catch (error) {
      setVerificationError(t('register.errors.networkError'));
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
          <div className="login-card-register">
            {step === 'register' ? (
              <>
                <h1 className="auth-title">{t('register.title')}</h1>

                {(errors.incomplete || backendError) && (
                  <p className="error">
                    {errors.incomplete || backendError}
                  </p>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label htmlFor="email">{t('register.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t('register.emailPlaceholder')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <p className="error">{errors.email}</p>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="password">{t('register.password')}</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder={t('register.passwordPlaceholder')}
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <p className="password-hint">{t('register.passwordHint')}</p>
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder={t('register.passwordPlaceholder')}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      aria-label={showConfirmPassword ? t('login.hidePassword') : t('login.showPassword')}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    {errors.passwordMismatch && <p className="error">{errors.passwordMismatch}</p>}
                  </div>

                  <label className="terms-row">
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      checked={formData.acceptedTerms}
                      onChange={handleChange}
                      required
                    />
                    <span className="terms">
                      {t('register.termsPrefix')}{' '}
                      <a href="/terminos" target="_blank" rel="noopener noreferrer">
                        {t('register.termsLink')}
                      </a>
                    </span>
                  </label>

                  <button type="submit" className="btn login-btn">
                    {t('register.submit')}
                  </button>
                </form>

                <div className="fullside">
                  <button
                    type="button"
                    className="btn google-btn"
                    onClick={() => {
                      const backendUrl = import.meta.env.VITE_BACKEND_URL;
                      window.location.href = `${backendUrl}/api/auth/google`;
                    }}
                  >
                    <img src="/iconos/google-logo.png" alt="Google" className="google-icon" />
                    {t('register.google')}
                  </button>

                  <div className="extra-links">
                    <p>
                      {t('register.hasAccount')}{' '}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/login');
                        }}
                      >
                        {t('register.loginLink')}
                      </a>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="auth-title">{t('verify.title')}</h1>

                <p className="verify-sub">
                  <Trans
                    i18nKey="verify.subtitle"
                    ns="auth"
                    values={{ email: formData.email }}
                    components={{ 1: <strong style={{ fontWeight: 500, color: '#111', textDecoration: 'underline' }} /> }}
                  />
                </p>

                <form onSubmit={handleVerify}>
                  <div className="code-row">
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        placeholder="-"
                        onChange={(e) => handleDigitChange(e, index)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        id={`reg-code-digit-${index}`}
                        className="code-cell"
                        inputMode="numeric"
                      />
                    ))}
                  </div>

                  {verificationError && <p className="resend-row error">{verificationError}</p>}
                  {verificationSuccess && <p className="resend-row success">{verificationSuccess}</p>}

                  <button type="submit" className="btn login-btn">
                    {t('verify.submit')}
                  </button>

                  <p className="resend-row">
                    {t('verify.resendPrompt')}{' '}
                    <button className="resend-btn" onClick={handleResend} type="button">
                      {t('verify.resend')}
                    </button>
                  </p>

                  {resendMessage && <p className="success">{resendMessage}</p>}
                </form>

                <div className="extra-links">
                  <p>
                    {t('verify.wrongEmail')}{' '}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setStep('register');
                      }}
                    >
                      {t('verify.editEmail')}
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="auth-image-panel">
        <img className="register-image" src={showcaseImage.src} alt="" />
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

export default RegisterPage;
