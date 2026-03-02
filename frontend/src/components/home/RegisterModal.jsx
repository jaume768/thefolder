import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/register-modal.css';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState("register");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // username: '', // (opcional) lo dejamos en el state por si lo reactivas
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({
    passwordMismatch: '',
    incomplete: '',
    // username: '', // (opcional) error de username
    email: '',
  });

  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));

  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ==============================
    // VALIDACIONES DE USERNAME (comentadas)
    // ==============================
    /*
    if (name === 'username') {
      setErrors(prev => ({ ...prev, username: '' }));

      if (value.includes(' ')) {
        setErrors(prev => ({
          ...prev,
          username: 'El nombre de usuario no puede contener espacios',
        }));
      }

      if (value.length > 20) {
        setErrors(prev => ({
          ...prev,
          username: 'El nombre de usuario debe tener máximo 20 caracteres',
        }));
      }
    }
    */

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Limpiar errores generales al escribir
    setErrors(prev => ({
      ...prev,
      passwordMismatch: '',
      incomplete: '',
      email: '',
      // username: prev.username, // (comentado) mantener error username si existiera
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
      // username: '', // (opcional)
    });

    setBackendError('');
    setSuccessMessage('');

    // ==============================
    // VALIDACIÓN "CAMPOS OBLIGATORIOS"
    // quitamos username de aquí
    // ==============================
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.acceptedTerms
    ) {
      setErrors(prev => ({
        ...prev,
        incomplete: 'Completa todos los campos para continuar',
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        passwordMismatch: 'Las contraseñas no coinciden',
      }));
      return;
    }

    // ==============================
    // VALIDACIONES DE USERNAME (comentadas)
    // ==============================
    /*
    if (!formData.username) {
      setErrors(prev => ({
        ...prev,
        incomplete: 'Completa todos los campos para continuar',
      }));
      return;
    }

    if (formData.username.includes(' ')) {
      setErrors(prev => ({
        ...prev,
        username: 'El nombre de usuario no puede contener espacios',
      }));
      return;
    }

    if (formData.username.length > 20) {
      setErrors(prev => ({
        ...prev,
        username: 'El nombre de usuario debe tener máximo 20 caracteres',
      }));
      return;
    }
    */

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      // Enviamos payload SIN username (para que frontend no lo exija)
      const payload = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptedTerms: formData.acceptedTerms,
        // username: formData.username, // (comentado) reactivar si lo vuelves a pedir aquí
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
        setBackendError(data.error || 'Error al enviar el código de verificación.');
        return;
      }

      setStep("verify");
    } catch (error) {
      console.log(error);
      setBackendError('Error al conectar con el servidor.');
    }
  };

  const handleDigitChange = (e, index) => {
    const { value } = e.target;

    if (/^\d?$/.test(value)) {
      const newCodeDigits = [...codeDigits];
      newCodeDigits[index] = value;
      setCodeDigits(newCodeDigits);

      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(`reg-code-digit-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      if (value === "" && index > 0) {
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

    const code = codeDigits.join("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backendUrl}/api/auth/verify-code-pre-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVerificationError(data.error || 'Código incorrecto.');
        return;
      }

      setVerificationSuccess(data.message || '¡Código verificado exitosamente!');

      const { token } = data;
      localStorage.setItem("authToken", token);

      onClose();

      // Ya NO mandamos username por state (se elegirá en onboarding)
      navigate("/complete-registration");
      // navigate("/complete-registration", { state: { username: formData.username } }); // (comentado)

    } catch (err) {
      console.log(err);
      setVerificationError('Error de red.');
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
        setVerificationError(data.error || 'Error al reenviar el código.');
        return;
      }

      setResendMessage(data.message || 'Código reenviado exitosamente.');
    } catch (error) {
      console.log(error);
      setVerificationError('Error de red.');
    }
  };

  return (
    <div className="login-modal" onClick={onClose}>
      <div className="register-shell" onClick={(e) => e.stopPropagation()}>
        <div className="register-left">
          <img className="register-image" src="/multimedia/templates- (3)-login.jpg" alt="" />
        </div>

        <div className={`login-card login-card-register ${backendError || errors.incomplete || errors.passwordMismatch || verificationError ? 'with-error' : ''}`}>
          {step === "register" ? (
            <>
              <h1>Registra tu perfil</h1>

              {(errors.incomplete || backendError) && (
                <p className="error">
                  {errors.incomplete || backendError}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                {/* ==============================
                    INPUT USERNAME (comentado)
                   ============================== */}
                {/*
                <div className="input-group">
                  <label htmlFor="username">Nombre de usuario</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Máx. 20 caracteres, sin espacios"
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={20}
                    required
                  />
                  {errors.username && <p className="error">{errors.username}</p>}
                </div>
                */}

                <div className="input-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Introduce tu email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <p className="error">{errors.email}</p>}
                </div>

                <div className="input-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">Repetir contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
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
                  <span className='terms'>
                    Acepto los{' '}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      términos y condiciones
                    </a>
                  </span>
                </label>

                <button type="submit" className="btn login-btn">
                  Registrarme
                </button>
              </form>

            <div className='fullside'>
              <button
                type="button"
                className="btn google-btn"
                onClick={() => {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL;
                  window.location.href = `${backendUrl}/api/auth/google`;
                }}
              >
                <img src="/iconos/google-logo.png" alt="Google" className="google-icon" />
                Continuar con Google
              </button>

              <div className="extra-links">
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSwitchToLogin();
                    }}
                  >
                    Accede
                  </a>
                </p>
              </div>
            </div>
            </>
          ) : (
            <>
              <h1>Código de verificación</h1>

              <p className="verify-sub">
                Se ha enviado un código al correo <strong>{formData.email}</strong>
              </p>

              {verificationError && <p className="resend-row error">{verificationError}</p>}
              {verificationSuccess && <p className="resend-row success">{verificationSuccess}</p>}

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

                <p className="resend-row">
                  ¿No has recibido el código?{' '}
                  <button className="resend-btn" onClick={handleResend} type="button">
                    Reenviar
                  </button>
                </p>

                {resendMessage && <p className="success">{resendMessage}</p>}

                <button type="submit" className="btn login-btn">
                  Verificar
                </button>
              </form>

              <div className="extra-links">
                <p>
                  ¿Quieres volver?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep("register");
                    }}
                  >
                    Editar email
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
