import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../components/controlPanel/css/Contacto.css';

const Contacto = () => {
    const { t } = useTranslation('legal');
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="contacto-container">
            <div className="contacto-header">
                <button className="contacto-back-button" onClick={goBack}>
                    <FaArrowLeft /> {t('contact.back')}
                </button>
            </div>

            <div className="contacto-content">
                <h1 className="contacto-title">{t('contact.title')}</h1>

                <div className="contacto-info-section">
                    <div className="contacto-info-card">
                        <div className="contacto-info-icon">
                            <FaEnvelope />
                        </div>
                        <div className="contacto-info-text">
                            <h3>{t('contact.emailTitle')}</h3>
                            <p><a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com</a></p>
                            <p className="contacto-info-description">{t('contact.emailDescription')}</p>
                        </div>
                    </div>

                    <div className="contacto-info-card">
                        <div className="contacto-info-icon">
                            <FaMapMarkerAlt />
                        </div>
                        <div className="contacto-info-text">
                            <h3>{t('contact.addressTitle')}</h3>
                            <p>Pasaje Robledano, nº3</p>
                            <p>San Pedro de Alcántara (Marbella)</p>
                            <p>Málaga, España</p>
                        </div>
                    </div>
                </div>

                <div className="contacto-social-section">
                    <h2>{t('contact.socialTitle')}</h2>
                    <div className="contacto-social-links">
                        <a href="https://instagram.com/thefolderworld" target="_blank" rel="noopener noreferrer" className="contacto-social-link">
                            <FaInstagram />
                            <span>Instagram</span>
                        </a>
                        <a href="https://linkedin.com/company/thefolderworld" target="_blank" rel="noopener noreferrer" className="contacto-social-link">
                            <FaLinkedin />
                            <span>LinkedIn</span>
                        </a>
                        <a href="https://twitter.com/thefolderworld" target="_blank" rel="noopener noreferrer" className="contacto-social-link">
                            <FaTwitter />
                            <span>Twitter</span>
                        </a>
                    </div>
                </div>

                <div className="contacto-about-section">
                    <h2>{t('contact.aboutTitle')}</h2>
                    <p>
                        {t('contact.aboutText1')}
                    </p>
                    <p>
                        {t('contact.aboutText2')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
