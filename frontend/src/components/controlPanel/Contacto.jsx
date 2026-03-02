import React from 'react';
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './css/Contacto.css';

const Contacto = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="contacto-container">
            <div className="contacto-header">
                <button className="contacto-back-button" onClick={goBack}>
                    <FaArrowLeft /> Volver
                </button>
            </div>
            
            <div className="contacto-content">
                <h1 className="contacto-title">Contacto</h1>
                
                <div className="contacto-info-section">
                    <div className="contacto-info-card">
                        <div className="contacto-info-icon">
                            <FaEnvelope />
                        </div>
                        <div className="contacto-info-text">
                            <h3>Correo Electrónico</h3>
                            <p><a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com</a></p>
                            <p className="contacto-info-description">Para consultas generales, soporte técnico y colaboraciones.</p>
                        </div>
                    </div>
                    
                    <div className="contacto-info-card">
                        <div className="contacto-info-icon">
                            <FaMapMarkerAlt />
                        </div>
                        <div className="contacto-info-text">
                            <h3>Dirección</h3>
                            <p>Pasaje Robledano, nº3</p>
                            <p>San Pedro de Alcántara (Marbella)</p>
                            <p>Málaga, España</p>
                        </div>
                    </div>
                </div>
                
                <div className="contacto-social-section">
                    <h2>Síguenos en redes sociales</h2>
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
                    <h2>Sobre TheFolderWorld</h2>
                    <p>
                        TheFolderWorld es una plataforma digital diseñada para conectar creativos con otros creativos, profesionales de la industria e instituciones educativas dentro del campo de la moda. Nuestro objetivo es crear un espacio donde los talentos emergentes puedan mostrar su trabajo, conectar con oportunidades profesionales y educativas, y formar parte de una comunidad vibrante de creativos.
                    </p>
                    <p>
                        Fundada en 2025 por Miriam Reina Bolaños, TheFolderWorld nace de la necesidad de crear un punto de encuentro especializado para el sector de la moda y el diseño, con un enfoque en la visibilidad de nuevos talentos y la conexión entre diferentes actores del sector.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
