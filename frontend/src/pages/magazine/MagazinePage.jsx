import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../../components/controlPanel/css/magazine.css';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const Magazine = () => {
    const { t } = useTranslation('magazine');
    const [magazines, setMagazines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener las revistas activas del backend
    useEffect(() => {
        const fetchMagazines = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.REACT_APP_API_URL || 'https://backend-studen-station-production.up.railway.app';
                const response = await axios.get(`${apiUrl}/api/magazines`);
                
                if (response.data.success) {
                    setMagazines(response.data.data);
                    setError(null);
                } else {
                    setError(t('errorLoad'));
                }
            } catch (err) {
                setError(t('errorConnect'));
            } finally {
                setLoading(false);
            }
        };

        fetchMagazines();
    }, []);

    // Formatear precio
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    return (
        <div className="magazine-container">
            <div className="magazine-header">
                <h1>{t('title')}</h1>
                <p className="magazine-description">
                    {t('description')}
                </p>
            </div>

            {loading ? (
                <div className="magazine-loading">
                    <FaSpinner className="spinner" />
                    <p className="loading-indicator">{t('loading')}</p>
                </div>
            ) : error ? (
                <div className="magazine-error">
                    <FaExclamationTriangle />
                    <p>{error}</p>
                </div>
            ) : magazines.length === 0 ? (
                <div className="magazine-empty">
                    <p>{t('noMagazines')}</p>
                </div>
            ) : (
                <div className="magazine-grid">
                    {magazines.map((magazine) => (
                        <div key={magazine._id} className="magazine-card">
                            <a href={magazine.link || '#'} target="_blank" rel="noopener noreferrer" 
                               onClick={(e) => !magazine.link && e.preventDefault()}
                               className={!magazine.link ? 'no-link' : ''}>
                                <div className="magazine-image">
                                    <img src={magazine.image} alt={magazine.name} />
                                </div>
                                <div className="magazine-info">
                                    <h2>{magazine.name}</h2>
                                    <p className="magazine-price">{formatPrice(magazine.price)}</p>
                                    {!magazine.link && <p className="magazine-no-link">{t('unavailable')}</p>}
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            )}
            
            <p className="about-photo-autor"><b>{t('ownPublication')}</b> <span dangerouslySetInnerHTML={{ __html: t('contactUs') }} /></p>
        </div>
    );
};

export default Magazine;
