import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaLaptopHouse, FaClock, FaUserGraduate } from 'react-icons/fa';
import '../../components/controlPanel/css/view-offer.css';
import { clImg } from '../../utils/optimizeImage';

const ViewOffer = () => {
    const { t, i18n } = useTranslation('offers');
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchOfferDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                
                if (!offerId) {
                    setError(t('view.noId'));
                    setLoading(false);
                    return;
                }
                
                // Obtener detalles de la oferta
                const response = await axios.get(`${backendUrl}/api/offers/${offerId}`);
                
                if (!response.data) {
                    setError(t('view.noData'));
                    setLoading(false);
                    return;
                }
                
                // Comprobar si los datos vienen dentro de una propiedad 'offer'
                const offerData = response.data.offer || response.data;
                setOffer(offerData);
                
                // Comprobar si el usuario es el dueño de la oferta
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        const userResponse = await axios.get(`${backendUrl}/api/users/profile`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        // Comprobar si el publisher es un objeto o un string
                        if (typeof offerData.publisher === 'object' && offerData.publisher !== null) {
                            setIsOwner(userResponse.data._id === offerData.publisher._id);
                        } else {
                            setIsOwner(userResponse.data._id === offerData.publisher);
                        }
                    } catch (err) {
                    }
                }
            } catch (err) {
                setError(t('view.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchOfferDetails();
    }, [offerId]);

    const formatDate = (dateString) => {
        if (!dateString) return t('view.noDate');
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', options);
        } catch (error) {
            return dateString;
        }
    };

    const handleApply = () => {
        if (offer.isExternal && offer.externalLink) {
            window.open(offer.externalLink, '_blank');
        } else {
            // Si no es externo, se puede implementar lógica para aplicar internamente
            // TODO: Implementar aplicación interna
        }
    };

    const handleEdit = () => {
        navigate(`/edit-offer/${offerId}`);
    };

    if (loading) {
        return (
            <div className="view-offer-loading-view">
                <div className="loader-view"></div>
                <p className="loading-indicator">{t('view.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-offer-error-view">
                <h2>{t('view.notFoundTitle')}</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>{t('view.back')}</button>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="view-offer-not-found-view">
                <h2>{t('view.notFoundTitle')}</h2>
                <p>{t('view.notFoundDesc')}</p>
                <button onClick={() => navigate(-1)}>{t('view.back')}</button>
            </div>
        );
    }

    return (
        <div className="view-offer-container-view">
            <div className="offer-header-view">
                <div className="offer-header-left-view">
                    {offer.companyLogo ? (
                        <img
                            src={clImg.logo(offer.companyLogo)}
                            alt={t('create.sidebar.headerImage')}
                            className="company-logo-view"
                        />
                    ) : (
                        <div className="company-logo-placeholder-view">
                            <FaBuilding />
                        </div>
                    )}
                    
                    <div className="offer-header-info-view">
                        <h1 className="offer-title-view">{offer.position || t('view.untitled')}</h1>
                        <div className="company-info-view">
                            <span className="company-name-view">{offer.companyName || t('view.noCompany')}</span>
                            <div className="offer-location-view">
                                <FaMapMarkerAlt className="info-icon-view" />
                                <span>{offer.city || t('view.noLocation')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="offer-header-right-view">
                    <div className="offer-date-view">
                        <FaCalendarAlt className="info-icon-view" />
                        <span>{t('view.publishedOn', { date: formatDate(offer.publicationDate) })}</span>
                    </div>
                    
                    <div className={`offer-status-view ${offer.status !== 'active' && offer.status !== 'accepted' ? 'closed-view' : ''}`}>
                        {offer.status === 'active' || offer.status === 'accepted' ? t('view.statusActive') : t('view.statusClosed')}
                    </div>
                </div>
            </div>
            
            <div className="offer-content-view">
                <div className="offer-main-content-view">
                    <section className="offer-section-view">
                        <h2 className="section-title-view">{t('view.detailsTitle')}</h2>
                        <div className="offer-details-grid-view">
                            {offer.jobType && (
                                <div className="detail-item-view">
                                    <FaBriefcase className="detail-icon-view" />
                                    <div className="detail-info-view">
                                        <h3>{t('view.contractType')}</h3>
                                        <p>{offer.jobType}</p>
                                    </div>
                                </div>
                            )}
                            
                            {offer.locationType && (
                                <div className="detail-item-view">
                                    <FaLaptopHouse className="detail-icon-view" />
                                    <div className="detail-info-view">
                                        <h3>{t('view.mode')}</h3>
                                        <p>{offer.locationType}</p>
                                    </div>
                                </div>
                            )}
                            
                            {offer.duration && (
                                <div className="detail-item-view">
                                    <FaClock className="detail-icon-view" />
                                    <div className="detail-info-view">
                                        <h3>{t('view.duration')}</h3>
                                        <p>{offer.duration}</p>
                                    </div>
                                </div>
                            )}
                            
                            {offer.experienceYears && (
                                <div className="detail-item-view">
                                    <FaUserGraduate className="detail-icon-view" />
                                    <div className="detail-info-view">
                                        <h3>{t('view.experience')}</h3>
                                        <p>{offer.experienceYears}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    
                    {offer.description && (
                        <section className="offer-section-view">
                            <h2 className="section-title-view">{t('view.description')}</h2>
                            <div className="offer-description-view">
                                {typeof offer.description === 'string' ? 
                                    offer.description.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    )) : <p>{String(offer.description)}</p>
                                }
                            </div>
                        </section>
                    )}
                    
                    {offer.functions && (
                        <section className="offer-section-view">
                            <h2 className="section-title-view">{t('view.functions')}</h2>
                            <div className="offer-functions-view">
                                {typeof offer.functions === 'string' ? 
                                    offer.functions.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    )) : <p>{String(offer.functions)}</p>
                                }
                            </div>
                        </section>
                    )}
                    
                    {offer.requiredProfile && (
                        <section className="offer-section-view">
                            <h2 className="section-title-view">{t('view.requiredProfile')}</h2>
                            <div className="offer-profile-view">
                                {typeof offer.requiredProfile === 'string' ? 
                                    offer.requiredProfile.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    )) : <p>{String(offer.requiredProfile)}</p>
                                }
                            </div>
                        </section>
                    )}
                    
                    {(offer.tags && Array.isArray(offer.tags) && offer.tags.length > 0) && (
                        <section className="offer-section-view">
                            <h2 className="section-title-view">{t('view.skills')}</h2>
                            <div className="offer-tags-view">
                                {offer.tags.map((tag, index) => (
                                    <span key={index} className="tag-view">{tag}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
                
                <div className="offer-sidebar-view">
                    <div className="action-panel-view">
                        <h3 className="action-title-view">{t('view.interested')}</h3>
                        
                        <button 
                            className="apply-button-view"
                            onClick={handleApply}
                        >
                            {offer.isExternal ? t('view.applyExternal') : t('view.apply')}
                        </button>
                        
                        {isOwner && (
                            <div className="owner-actions-view">
                                <button 
                                    className="edit-button-view"
                                    onClick={handleEdit}
                                >
                                    {t('view.editOffer')}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="company-panel-view">
                        <h3 className="panel-title-view">{t('view.aboutCompany')}</h3>
                        <div className="company-panel-info-view">
                            <h4>{offer.companyName || t('view.noCompany')}</h4>
                            {offer.publisher && (
                                typeof offer.publisher === 'object' && offer.publisher.username ? (
                                    <a href={`/profile/${offer.publisher.username}`} className="view-profile-link-view">
                                        {t('view.viewProfile')}
                                    </a>
                                ) : (
                                    <p className="company-info-text-view">{t('view.registeredCompany')}</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOffer;
