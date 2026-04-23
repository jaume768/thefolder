import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
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
    const { t } = useTranslation('auth');

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
                setError(data.error || t('reset.errors.sendFailed'));
                return;
            }
            setSuccessMsg(data.message || t('reset.success.emailSent'));
            setStep("verify");
        } catch (err) {
            setError(t('reset.errors.network'));
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
                setError(data.error || t('reset.errors.invalidCode'));
                return;
            }
            setSuccessMsg(data.message || t('reset.success.codeVerified'));
            setStep("reset");
        } catch (err) {
            setError(t('reset.errors.network'));
        }
    };

    // Paso 3: Resetear la contraseña
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (newPassword !== confirmNewPassword) {
            setError(t('reset.errors.passwordMismatch'));
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
                setError(data.error || t('reset.errors.resetFailed'));
                return;
            }
            setSuccessMsg(data.message || t('reset.success.passwordUpdated'));
            setTimeout(() => {
                onClose();
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            setError(t('reset.errors.network'));
        }
    };

    return (
        <div className="login-modal" onClick={onClose}>
            <div className="login-card" onClick={(e) => e.stopPropagation()}>

                {step === "email" && (
                    <>
                        <h1>{t('reset.emailTitle')}</h1>
                        {error && <p className="error">{error}</p>}
                        {successMsg && <p className="success">{successMsg}</p>}
                        <form onSubmit={handleSendEmail}>
                            <div className="input-group">
                                <label htmlFor="reset-email">{t('reset.emailLabel')}</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    placeholder={t('reset.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn">{t('reset.send')}</button>
                        </form>
                    </>
                )}
                {step === "verify" && (
                    <>
                        <h1>{t('reset.verifyTitle')}</h1>
                        <p>
                            <Trans
                                i18nKey="reset.verifySubtitle"
                                ns="auth"
                                values={{ email }}
                                components={{ 1: <strong /> }}
                            />
                        </p>
                        {error && <p className="error">{error}</p>}
                        {successMsg && <p className="success">{successMsg}</p>}
                        <form onSubmit={handleVerifyCode}>
                            <div className="input-group">
                                <label htmlFor="verification-code">{t('reset.verifyCodeLabel')}</label>
                                <input
                                    id="verification-code"
                                    type="text"
                                    placeholder={t('reset.verifyCodePlaceholder')}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn">{t('reset.verifySubmit')}</button>
                        </form>
                    </>
                )}
                {step === "reset" && (
                    <>
                        <h1>{t('reset.resetTitle')}</h1>
                        {error && <p className="error">{error}</p>}
                        {successMsg && <p className="success">{successMsg}</p>}
                        <form onSubmit={handleResetPassword}>
                            <div className="input-group">
                                <label htmlFor="new-password">{t('reset.newPassword')}</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    placeholder={t('reset.newPasswordPlaceholder')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirm-new-password">{t('reset.confirmPassword')}</label>
                                <input
                                    id="confirm-new-password"
                                    type="password"
                                    placeholder={t('reset.confirmPasswordPlaceholder')}
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn">{t('reset.resetSubmit')}</button>
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
                       {t('reset.backToLogin')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetModal;
