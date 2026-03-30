import React, { useContext, useState } from 'react';
import './css/login-modal.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const LoginModal = ({ onClose, onSwitchToRegister, onSwitchToReset }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                setError(data.message || 'Error en el inicio de sesión');
            }
        } catch (err) {
            setError('Error de red, inténtalo nuevamente.');
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
        <h1>Inicio de sesión</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>
            <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>

            <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
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
            ¿Has olvidado tu contraseña?
            </a>

            <button className="btn login-btn" type="submit">
            Iniciar sesión
            </button>
        </form>

        <button className="btn google-btn" onClick={handleGoogleLogin}>
            <img src="/iconos/google-logo.png" alt="Google" className="google-icon" />
            Continuar con Google
        </button>

        <div className="extra-links">
            <p>
            ¿No tienes cuenta?{' '}
            <a
                href="#"
                onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
                }}
            >
                Regístrate
            </a>
            </p>
        </div>
        </div>
    </div>
    );

};

export default LoginModal;
