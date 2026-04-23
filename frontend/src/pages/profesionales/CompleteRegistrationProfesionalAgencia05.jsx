// CompleteRegistrationProfesionalAgencia05.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/complete-registration.css';

const CompleteRegistrationProfesionalAgencia05 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('onboarding');
    const [companyName, setCompanyName] = useState("");
    const [agencyServices, setAgencyServices] = useState("");
    const [shareName, setShareName] = useState(true);
    const [error, setError] = useState(""); // Estado para mensaje de error

    const serviceOptions = [
        t('profesional.services.talent'),
        t('profesional.services.creative'),
        t('profesional.services.photo'),
        t('profesional.services.consulting'),
        t('profesional.services.shows'),
        t('profesional.services.digital')
    ];

    const handleNext = async () => {
        if (!companyName || !agencyServices) {
            setError(t('profesional.errors.requiredFields'));
            return;
        }
        setError("");
        try {
            const token = localStorage.getItem("authToken");
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    companyName,
                    agencyServices,
                    showNameCompany: shareName, 
                    profileCompleted: true
                })
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/creativo/registro/final');
            } else {
                setError(data.error || t('profesional.errors.genericError'));
            }
        } catch (error) {
            setError(t('profesional.errors.connection'));
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="complete-registration-container">
            <div className="contenedor-registro-objetivo">
                <p className="paso" style={{ color: 'gray', fontSize: '0.8rem' }}>{t('profesional.step', { n: 5 })}</p>
                <h2 className="titulo">{t('profesional.lastDataTitle')}</h2>
                <div className="form-group-datos">
                    <label>{t('profesional.companyName')}</label>
                    <input
                        type="text"
                        placeholder={t('profesional.namePlaceholder')}
                        value={companyName}
                        onChange={(e) => {
                            setCompanyName(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
                    <div className="checkbox-wrapper">
                        <input
                            type="checkbox"
                            checked={!shareName}
                            onChange={(e) => setShareName(!e.target.checked)}
                        />
                        <span>{t('profesional.dontShare')}</span>
                    </div>
                </div>
                <div className="form-group-datos">
                    <label>{t('profesional.agencyServices')}</label>
                    <select
                        value={agencyServices}
                        onChange={(e) => {
                            setAgencyServices(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    >
                        <option value="">{t('profesional.selectOption')}</option>
                        {serviceOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                {/* Mensaje de error */}
                {error && <p className="error-message">{error}</p>}
                <div
                    className="navigation-buttons"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}
                >
                    <button
                        className="back-button"
                        onClick={handleBack}
                        style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}
                    >
                        &#8592; {t('common.back')}
                    </button>
                    <button className="next-button" onClick={handleNext}>
                        {t('common.next')}
                    </button>
                </div>
                <div className="pagination-dots" style={{ marginTop: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((dot, index) => (
                        <span
                            key={index}
                            style={{
                                margin: '0 4px',
                                fontSize: index === 4 ? '1rem' : '0.9rem',
                                color: 'gray'
                            }}
                        >
                            &#9679;
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CompleteRegistrationProfesionalAgencia05;
