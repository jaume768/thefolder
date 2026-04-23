import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/complete-registration.css';

const CompleteRegistrationProfesionalInstitucion = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('onboarding');
    const [institutionName, setInstitutionName] = useState("");
    const [foundingYear, setFoundingYear] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState(""); // Estado para mensaje de error

    const countries = [
        "Estados Unidos", "Reino Unido", "Canadá", "Australia", "Alemania",
        "Francia", "Italia", "España", "Brasil", "México",
        "Japón", "China", "India", "Rusia", "Corea del Sur",
        "Países Bajos", "Suiza", "Suecia", "Noruega", "Argentina"
    ];

    const handleNext = async () => {
        if (!institutionName || !foundingYear || !country || !city) {
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
                body: JSON.stringify({ companyName: institutionName, foundingYear, country, city })
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/photo/registro/03');
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
                <p className="paso" style={{ color: 'gray', fontSize: '0.8rem' }}>{t('profesional.step', { n: 2 })}</p>
                <h2 className="titulo">{t('profesional.registrationDataTitle')}</h2>
                <div className="form-group-datos">
                    <label>{t('profesional.institutionName')}</label>
                    <input
                        type="text"
                        placeholder={t('profesional.namePlaceholder')}
                        value={institutionName}
                        onChange={(e) => {
                            setInstitutionName(e.target.value);
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
                    <label>{t('profesional.countryHQ')}</label>
                    <select
                        value={country}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    >
                        <option value="">{t('profesional.countryHQSelect')}</option>
                        {countries.map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group-datos">
                    <label>{t('profesional.cityHQ')}</label>
                    <input
                        type="text"
                        placeholder={t('profesional.cityHQPlaceholder')}
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
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
                                fontSize: index === 1 ? '1.2rem' : '1rem',
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

export default CompleteRegistrationProfesionalInstitucion;
