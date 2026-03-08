import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './css/login-modal.css';

const PasswordResetModal = ({ onClose, onSwitchToLogin }) => {
    const [step, setStep] = useState("email"); // "email", "verify", "reset"
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const backendUrl = import.meta.env.VITE_BACKEND_URL; // Asegúrate de tenerla definida

    // Paso 1: Enviar email para solicitar código de verificación
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Error al enviar el email.');
                return;
            }
            setSuccessMsg(data.message || 'Email enviado. Revisa tu bandeja para el código.');
            setStep("verify");
        } catch (err) {
            setError('Error de red, inténtalo nuevamente.');
        }
    };

    // Paso 2: Verificar el código recibido
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const response = await fetch(`${backendUrl}/api/auth/verify-forgot-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Código incorrecto.');
                return;
            }
            setSuccessMsg(data.message || 'Código verificado.');
            setStep("reset");
        } catch (err) {
            setError('Error de red, inténtalo nuevamente.');
        }
    };

    // Paso 3: Resetear la contraseña
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (newPassword !== confirmNewPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Error al restablecer la contraseña.');
                return;
            }
            setSuccessMsg(data.message || 'Contraseña actualizada exitosamente.');
            setTimeout(() => {
                onClose();
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            setError('Error de red, inténtalo nuevamente.');
        }
    };

    return (
        <div className="login-modal">
            <div className="login-card">

                {step === "email" && (
                    <>
                        <h1>Recuperar contraseña</h1>
                        {error && <p className="error">{error}</p>}
                        {successMsg && <p className="success">{successMsg}</p>}
                        <form onSubmit={handleSendEmail}>
                            <div className="input-group">
                                <label htmlFor="reset-email">Email</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    placeholder="Introduce tu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn">Enviar</button>
                        </form>
                    </>
                )}
                {step === "verify" && (
                    <>
                        <h1>Verificar código</h1>
                        <p>Se ha enviado un código a: <strong>{email}</strong></p>
                        {error && <p className="error">{error}</p>}
                        {successMsg && <p className="success">{successMsg}</p>}
                        <form onSubmit={handleVerifyCode}>
                            <div className="input-group">
                                <label htmlFor="verification-code">Código de verificación</label>
                                <input
                                    id="verification-code"
                                    type="text"
                                    placeholder="Introduce el código"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn">Verificar</button>
                        </form>
                    </>
                )}
                {step === "reset" && (
                    <>
                        <h1>Nueva contraseña</h1>
                        {error && <p className="error">{error}</p>}
                        {successMsg && <p className="success">{successMsg}</p>}
                        <form onSubmit={handleResetPassword}>
                            <div className="input-group">
                                <label htmlFor="new-password">Nueva contraseña</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    placeholder="Introduce la nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirm-new-password">Repetir contraseña</label>
                                <input
                                    id="confirm-new-password"
                                    type="password"
                                    placeholder="Repite la nueva contraseña"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn">Restablecer contraseña</button>
                        </form>
                    </>
                )}
                <div className="extra-links">
                    <a
                        href="#"
                        className="back-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                            onSwitchToLogin();
                        }}
                    >
                       ← Volver al inicio de sesión
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetModal;
