import React, { useContext, useState } from 'react';
import './css/login-modal.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';

const LoginModal = ({ onClose, onSwitchToRegister, onSwitchToReset }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation('auth');

    const navigate = useNavigate();
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
                login(data.token, user);

                // Detectar si el usuario necesita pasar por el wizard:
                // - Sin accountType NI profileCompleted → wizard (usuario nuevo)
                // - Sin accountType PERO profileCompleted → entrar (usuario legacy)
                // - Con accountType → entrar (usuario nuevo que ya completó)
                const needsWizard = !user.accountType && !user.profileCompleted;
                navigate(needsWizard ? '/complete-registration' : '/explorer');
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

    return (
    <div
        className="login-modal"
        onClick={onClose}   // click fuera → cerrar
    >
        <div
        className={`login-card ${error ? 'with-error' : ''}`}
        onClick={(e) => e.stopPropagation()} // click dentro → NO cerrar
        >
        <h1>{t('login.title')}</h1>
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
                onSwitchToReset();
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
                onSwitchToRegister();
                }}
            >
                {t('login.registerLink')}
            </a>
            </p>
        </div>
        </div>
    </div>
    );

};

export default LoginModal;
