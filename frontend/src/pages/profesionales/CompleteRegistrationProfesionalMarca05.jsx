import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/complete-registration.css';

const CompleteRegistrationProfesionalMarca05 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('onboarding');
    const [companyName, setCompanyName] = useState("");
    const [foundingYear, setFoundingYear] = useState("");
    const [productServiceType, setProductServiceType] = useState("");
    const [error, setError] = useState(""); // Estado para mensaje de error

    const productOptions = [
        t('profesional.products.custom'),
        t('profesional.products.vintage'),
        t('profesional.products.accessories'),
        t('profesional.products.jewelry'),
        t('profesional.products.shoes'),
        t('profesional.products.leather'),
        t('profesional.products.textile'),
        t('profesional.products.sustainable'),
        t('profesional.products.other')
    ];

    const handleNext = async () => {
        if (!companyName || !foundingYear || !productServiceType) {
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
                body: JSON.stringify({ companyName, foundingYear, productServiceType, profileCompleted: true })
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
                    <label>{t('profesional.brandName')}</label>
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
                </div>
                <div className="form-group-datos">
                    <label>{t('profesional.foundingYear')}</label>
                    <input
                        type="text"
                        placeholder="yyyy"
                        value={foundingYear}
                        onChange={(e) => {
                            setFoundingYear(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
                </div>
                <div className="form-group-datos">
                    <label>{t('profesional.mainProduct')}</label>
                    <select
                        value={productServiceType}
                        onChange={(e) => {
                            setProductServiceType(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    >
                        <option value="">{t('profesional.selectOption')}</option>
                        {productOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                {/* Mensaje de error */}
                {error && <p className="error-message">{error}</p>}
                <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
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

export default CompleteRegistrationProfesionalMarca05;
