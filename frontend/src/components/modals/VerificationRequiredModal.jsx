import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/verification-required-modal.css';

const VerificationRequiredModal = ({ onClose }) => {
    const navigate = useNavigate();

    const handleContactClick = () => {
        // Cerrar el modal y navegar al explorador
        onClose();
        navigate('/explorer');
    };

    return (
        <div className="verification-modal-overlay">
            <div className="verification-modal-container">
                
                <div className="verification-modal-content">
                    <h2>Verificación Requerida</h2>
                    
                    <div className="verification-modal-info">
                        <p className="verification-modal-title">Para poder verificar tu perfil, envíanos un correo a:</p>
                        <p className="verification-modal-email">thefolderworld@gmail.com</p>
                        
                        <div className="verification-modal-requirements">
                            <p>con los siguientes datos:</p>
                            <ul>
                                <li>Nombre legal de la empresa o institución</li>
                                <li>Número de identificación fiscal</li>
                                <li>Documento oficial que acredite la existencia de la empresa</li>
                                <li>Nombre completo de la persona que envía el correo</li>
                                <li>Cargo o rol dentro de la organización</li>
                                <li>Enlace al sitio web oficial y/o redes sociales activas</li>
                            </ul>
                        </div>
                        
                        <p className="verification-modal-note">
                            Una vez recibida la información, revisaremos los datos y te contactaremos para confirmar la verificación.
                        </p>
                    </div>
                    
                    <div className="verification-modal-actions">
                        <button 
                            className="verification-modal-button verification-modal-primary"
                            onClick={handleContactClick}
                        >
                            Entendido
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationRequiredModal;
