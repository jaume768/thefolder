import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../../components/controlPanel/css/jobOfferDetail.css';
import ApplyOfferModal from '../../components/modals/ApplyOfferModal';
import { clImg } from '../../utils/optimizeImage';
import { FaBookmark, FaRegBookmark, FaTimes } from 'react-icons/fa';

const JobOfferDetail = () => {
    const { t, i18n } = useTranslation('offers');
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userApplied, setUserApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savingOffer, setSavingOffer] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState({ show: false, text: "" });

    useEffect(() => {
        const fetchOfferDetails = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${backendUrl}/api/offers/${offerId}`);
                setOffer(response.data.offer);
            } catch (error) {
                setError(t('view.loadError'));
            } finally {
                setLoading(false);
            }
        };

        const checkAuthStatus = () => {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
        };

        if (offerId) {
            fetchOfferDetails();
            checkAuthStatus();
        }
    }, [offerId]);

    // Verificar si el usuario ya aplicó a esta oferta
    useEffect(() => {
        const checkIfUserApplied = async () => {
            if (!isAuthenticated || !offer) return;
            
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const token = localStorage.getItem('authToken');
                
                const response = await axios.get(
                    `${backendUrl}/api/offers/${offerId}/check-application`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                setUserApplied(response.data.hasApplied);
            } catch (error) {
            }
        };
        
        checkIfUserApplied();
    }, [offerId, isAuthenticated, offer]);

    // Verificar si la oferta está guardada
    useEffect(() => {
        const checkIfOfferIsSaved = async () => {
            if (!isAuthenticated || !offer) return;
            
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const token = localStorage.getItem('authToken');
                
                const response = await axios.get(
                    `${backendUrl}/api/users/saved-offers`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                const isSavedOffer = response.data.savedOffers.some(
                    savedOfferId => savedOfferId === offerId || 
                    (typeof savedOfferId === 'object' && savedOfferId._id === offerId)
                );
                
                setIsSaved(isSavedOffer);
            } catch (error) {
            }
        };
        
        checkIfOfferIsSaved();
    }, [offerId, isAuthenticated, offer]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', options);
    };

    const handleBack = () => {
        navigate(-1); // Utilizar navigate(-1) para volver a la página anterior
    };

    const handleOpenApplyModal = () => {
        if (!isAuthenticated) {
            // Redirigir al login si no está autenticado
            navigate('/login', { state: { from: `/offers/${offerId}` } });
            return;
        }
        setIsApplyModalOpen(true);
    };

    const handleCloseApplyModal = () => {
        setIsApplyModalOpen(false);
    };

    const handleSubmitApplication = async (answers) => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem('authToken');

            await axios.post(
                `${backendUrl}/api/offers/${offerId}/apply`,
                { answers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Actualizar estado de aplicación
            setUserApplied(true);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const handleSaveOffer = async () => {
        if (!isAuthenticated) {
            navigate('/', { state: { showRegister: true } });
            return;
        }

        try {
            setSavingOffer(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            
            if (isSaved) {
                // Quitar de guardados
                await axios.delete(
                    `${backendUrl}/api/users/saved-offers/${offerId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsSaved(false);
                setSaveFeedback({ show: true, text: t('view.removedFromSaved') });
            } else {
                // Añadir a guardados
                await axios.post(
                    `${backendUrl}/api/users/saved-offers/${offerId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsSaved(true);
                setSaveFeedback({ show: true, text: t('view.savedFeedback') });
            }
            
            // Ocultar el feedback después de 2 segundos
            setTimeout(() => {
                setSaveFeedback({ show: false, text: "" });
            }, 2000);
        } catch (error) {
        } finally {
            setSavingOffer(false);
        }
    };

    if (loading) {
        return (
            <div className="job-offer-loading-jobdetail">
                <i className="fas fa-spinner fa-spin"></i>
                <span className="loading-indicator">{t('view.loading')}</span>
            </div>
        );
    }

    if (error || !offer) {
        return <div className="job-offer-error-jobdetail">{error || t('view.notFoundTitle')}</div>;
    }

    return (
        <div className="job-offer-detail-container-jobdetail">
            <a href="/offers" className="back-to-blog-btn offers">
                <FaTimes />
            </a>
            
            {/* Cabecera con imagen (simulando banner) y título */}
            <div className="job-offer-header-jobdetail">
                {/* Imagen grande (puedes cambiarla si tienes otra imagen de banner) */}
                <div className="job-offer-banner-jobdetail">
                    <img
                        src={clImg.logo(offer.companyLogo) || '/multimedia/company-default.png'}
                        alt={offer.companyName}
                        className="banner-image-jobdetail"
                    />
                </div>
            </div>
            
            <div className="article-content-container">
                <div className="job-offer-title-section-jobdetail">
                    <div className="job-offer-company-name-jobdetail">
                        <img
                            src={clImg.logo(offer.companyLogo) || '/multimedia/company-default.png'}
                            alt={offer.companyName}
                            className="perfil__avatar"
                        />
                        {offer.companyName}
                    </div>
                    <div className="job-offer-title-row-jobdetail">
                        <h1 className="job-offer-position-jobdetail">{offer.position}</h1>
                        {offer.isUrgent && (
                            <span className="urgent-label-jobdetail">{t('view.urgent')}</span>
                        )}
                    </div>
                </div>
                {/* Sección con la información básica de la oferta */}
                <div className="job-offer-main-info-jobdetail">
                    <div className="job-offer-info-left-jobdetail">
                        <div className="job-offer-metadata-jobdetail">
                            <div className="metadata-tag-jobdetail">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>{offer.city}</span>
                            </div>
                            <div className="metadata-tag-jobdetail">
                                <i className="fas fa-building"></i>
                                <span>{offer.jobType}</span>
                            </div>
                            <div className="metadata-tag-jobdetail">
                                <i className="fas fa-map-marked-alt"></i>
                                <span>{offer.locationType}</span>
                            </div>
                            {offer.experience && (
                                <div className="metadata-tag-jobdetail">
                                    <i className="fas fa-briefcase"></i>
                                    <span>{offer.experience}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="job-offer-info-right-jobdetail">
                    <div className="job-offer-publication-date-jobdetail">
                        {t('view.publishedOn', { date: formatDate(offer.publicationDate) })}
                    </div>
                    <div className="job-offer-actions-jobdetail">
                        {userApplied ? (
                            <button className="apply-button-jobdetail applied-button" disabled>
                                {t('view.applied')}
                            </button>
                        ) : (
                            <button className="apply-button-jobdetail" onClick={handleOpenApplyModal}>
                                {t('view.apply')}
                            </button>
                        )}
                        <button 
                            className={`save-offer-button ${isSaved ? 'saved' : ''}`} 
                            onClick={handleSaveOffer}
                            disabled={savingOffer}
                        >
                            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                            <span>{isSaved ? t('view.saved') : t('view.save')}</span>
                        </button>
                        {saveFeedback.show && (
                            <div className={`save-feedback ${saveFeedback.show ? 'show' : ''}`}>
                                {saveFeedback.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>

                {/* Contenido principal de la oferta */}
                <div className="job-offer-content-jobdetail">
                <section className="job-section-jobdetail">
                    <h3 className="section-title-jobdetail">{t('view.companyDescription')}</h3>
                    <div className="rich-text-jobdetail">
                        {offer.companyDescription || `${offer.companyName} ${t('view.companyDescriptionFallback')}`}
                    </div>
                </section>

                <section className="job-section-jobdetail">
                    <h3 className="section-title-jobdetail">{t('view.jobDescription')}</h3>
                    <div className="rich-text-jobdetail">{offer.description}</div>
                </section>

                {offer.requiredProfile && (
                    <section className="job-section-jobdetail">
                        <h3 className="section-title-jobdetail">{t('view.requiredProfile')}</h3>
                        <div className="rich-text-jobdetail">{offer.requiredProfile}</div>
                    </section>
                )}

                {offer.functions && (
                    <section className="job-section-jobdetail">
                        <h3 className="section-title-jobdetail">{t('view.functions')}</h3>
                        <div className="rich-text-jobdetail">{offer.functions}</div>
                    </section>
                )}

                {offer.tags && offer.tags.length > 0 && (
                    <section className="job-section-jobdetail">
                        <h3 className="section-title-jobdetail">{t('view.hardSkills')}</h3>
                        <div className="tags-container-jobdetail">
                            {offer.tags.slice(0, 5).map((tag, index) => (
                                <span key={index} className="skill-tag-jobdetail hard-skill-jobdetail">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        
                        <h3 className="section-title-jobdetail">{t('view.softSkills')}</h3>
                        <div className="tags-container-jobdetail">
                            {offer.tags.slice(5).map((tag, index) => (
                                <span key={index} className="skill-tag-jobdetail soft-skill-jobdetail">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {offer.isExternal && (
                    <section className="job-section-jobdetail">
                        <h3 className="section-title-jobdetail">{t('view.externalTitle')}</h3>
                        <p>{t('view.externalDesc')}</p>
                        <a
                            href={offer.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link-button-jobdetail"
                        >
                            {t('view.externalLink')} <i className="fas fa-external-link-alt"></i>
                        </a>
                    </section>
                )}
                </div>
            </div>

            <ApplyOfferModal
                isOpen={isApplyModalOpen}
                onClose={handleCloseApplyModal}
                onSubmitApplication={handleSubmitApplication}
                offer={offer}
                userApplied={userApplied}
            />
        </div>
    );
};

export default JobOfferDetail;
