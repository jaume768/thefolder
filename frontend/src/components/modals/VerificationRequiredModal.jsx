import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './css/verification-required-modal.css';

const VerificationRequiredModal = ({ onClose }) => {
    const { t } = useTranslation('modals');
    const navigate = useNavigate();

    const handleContactClick = () => {
        // Cerrar el modal y navegar al explorador
        onClose();
        navigate('/explorer');
    };

    return (
        <div className="verification-modal-overlay" onClick={onClose}>
            <div className="verification-modal-container" onClick={(e) => e.stopPropagation()}>
                
                <div className="verification-modal-content">
                    <h2>{t('verification.title')}</h2>
                    
                    <div className="verification-modal-info">
                        <p className="verification-modal-title">{t('verification.description')}</p>
                        <p className="verification-modal-email">thefolderworld@gmail.com</p>
                        
                        <div className="verification-modal-requirements">
                            <p>{t('verification.requirements')}</p>
                            <ul>
                                <li>{t('verification.requirements.1')}</li>
                                <li>{t('verification.requirements.2')}</li>
                                <li>{t('verification.requirements.3')}</li>
                                <li>{t('verification.requirements.4')}</li>
                                <li>{t('verification.requirements.5')}</li>
                                <li>{t('verification.requirements.6')}</li>
                            </ul>
                        </div>
                        
                        <p className="verification-modal-note">
                            {t('verification.note')}
                        </p>
                    </div>
                    
                    <div className="verification-modal-actions">
                        <button 
                            className="verification-modal-button verification-modal-primary"
                            onClick={handleContactClick}
                        >
                            {t('verification.understood')}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationRequiredModal;
