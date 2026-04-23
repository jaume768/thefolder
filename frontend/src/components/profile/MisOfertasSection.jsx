import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCheck, FaTimesCircle } from 'react-icons/fa';
import '../controlPanel/css/MisOfertasSection.css';
import { clImg } from '../../utils/optimizeImage';

const MisOfertasSection = ({ userRole, professionalType }) => {
    const { t } = useTranslation('offers');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('aplicadas');
    const [appliedOffers, setAppliedOffers] = useState([]);
    const [savedOffers, setSavedOffers] = useState([]);
    const [expiredOffers, setExpiredOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determinar si es creativo o empresa/institución
    // El userRole debe ser exactamente 'Creativo' (case sensitive)
    const isCreative = userRole === 'Creativo';
    const isCompanyOrInstitution = professionalType === 1 || professionalType === 2 || professionalType === 4;

    // Variables para empresas
    const [companyOffers, setCompanyOffers] = useState([]);
    const [offerStatus, setOfferStatus] = useState('accepted');
    const [statusFilter, setStatusFilter] = useState('activas');
    const [totalResults, setTotalResults] = useState(0);
    const [showPracticas, setShowPracticas] = useState(false);
    const [showAllOffers, setShowAllOffers] = useState(true);
    
    // Estado para los modales de confirmación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    
    // Estado para revisar candidatos
    const [reviewingCandidates, setReviewingCandidates] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [candidatesFilter, setCandidatesFilter] = useState('todos');
    const [showResponses, setShowResponses] = useState(true);

    useEffect(() => {
        if (isCompanyOrInstitution) {
            fetchCompanyOffers();
        } else {
            fetchUserOffers();
        }
    }, [isCreative, activeTab, isCompanyOrInstitution, statusFilter, showPracticas, showAllOffers]);

    // Función para obtener ofertas de usuario creativo
    const fetchUserOffers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError(t('myOffers.loginRequired'));
                return;
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Obtener ofertas guardadas
            const savedOffersResponse = await axios.get(
                `${backendUrl}/api/users/saved-offers`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Obtener ofertas aplicadas si es perfil creativo
            let appliedOffersData = [];
            if (isCreative) {
                try {
                    const appliedOffersResponse = await axios.get(
                        `${backendUrl}/api/users/applied-offers`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    appliedOffersData = appliedOffersResponse.data.offers || [];
                } catch (appliedError) {
                }
            } else {
            }
            
            // Filtrar ofertas caducadas (si hay fecha de expiración y ya pasó)
            const currentDate = new Date();
            
            // Procesar ofertas guardadas
            const savedOffersData = savedOffersResponse.data.savedOffers || [];
            const processedSavedOffers = [];
            const processedExpiredOffers = [];
            
            for (const offer of savedOffersData) {
                // Comprobar si la oferta ha caducado
                const expirationDate = offer.expirationDate ? new Date(offer.expirationDate) : null;
                if (expirationDate && expirationDate < currentDate) {
                    processedExpiredOffers.push(offer);
                } else {
                    processedSavedOffers.push(offer);
                }
            }
            
            setSavedOffers(processedSavedOffers);
            setAppliedOffers(appliedOffersData);
            setExpiredOffers(processedExpiredOffers);
        } catch (error) {
            setError(t('myOffers.loadError'));
        } finally {
            setLoading(false);
        }
        
        // Forzar la pestaña de guardadas si no es un perfil creativo
        if (!isCreative && activeTab === 'aplicadas') {
            setActiveTab('guardadas');
        }
    };

    // Función para obtener candidatos de una oferta específica
    const fetchOfferCandidates = async (offerId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError(t('myOffers.loginRequiredCandidates'));
                return;
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.get(`${backendUrl}/api/offers/${offerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Obtener la oferta con sus aplicaciones
            const offer = response.data.offer;
            setCurrentOffer(offer);
            
            // Extraer los candidatos de las aplicaciones
            if (offer && offer.applications && offer.applications.length > 0) {
                const applicationsWithUserDetails = offer.applications.map(app => {
                    const appCopy = { ...app };
                    
                    // Verificar si app.user es un objeto o un string (ID)
                    if (typeof appCopy.user === 'string' || appCopy.user instanceof String) {
                        // Si es un ID, crear un objeto de usuario básico
                        appCopy.user = {
                            _id: appCopy.user,
                            fullName: 'Usuario',
                            city: 'Sin ubicación',
                            profile: {
                                profilePicture: '/default-avatar.png'
                            }
                        };
                    } else if (appCopy.user && typeof appCopy.user === 'object') {
                        // Si es un objeto, asegurarse de que tenga todos los campos necesarios
                        if (!appCopy.user.profile || !appCopy.user.profile.profilePicture) {
                            appCopy.user.profile = {
                                ...((appCopy.user.profile) || {}),
                                profilePicture: '/default-avatar.png'
                            };
                        }
                        
                        // Si no hay nombre completo, usar el nombre de usuario
                        if (!appCopy.user.fullName) {
                            appCopy.user.fullName = appCopy.user.username || 'Usuario';
                        }
                        
                        // Si no hay ciudad, usar 'Sin ubicación'
                        if (!appCopy.user.city) {
                            appCopy.user.city = 'Sin ubicación';
                        }
                    } else {
                        // Si no hay usuario, crear uno por defecto
                        appCopy.user = {
                            _id: 'unknown',
                            fullName: 'Usuario desconocido',
                            city: 'Sin ubicación',
                            profile: {
                                profilePicture: '/default-avatar.png'
                            }
                        };
                    }
                    
                    return appCopy;
                });
                
                setCandidates(applicationsWithUserDetails);
            } else {
                setCandidates([]);
            }
        } catch (error) {
            setError(t('myOffers.loadCandidatesError'));
        } finally {
            setLoading(false);
        }
    };
    
    // Función para manejar la selección o descarte de un candidato
    const handleCandidateAction = async (candidateId, action) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.put(
                `${backendUrl}/api/offers/${currentOffer._id}/applications/${candidateId}/status`,
                { status: action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Actualizar el estado local de los candidatos
            setCandidates(prevCandidates => 
                prevCandidates.map(candidate => 
                    candidate._id === candidateId 
                        ? { ...candidate, status: action }
                        : candidate
                )
            );
            
        } catch (error) {
        }
    };
    
    // Función para manejar la revisión de candidatos
    const handleReviewCandidates = (offerId, e) => {
        e.preventDefault();
        setReviewingCandidates(true);
        setSelectedOfferId(offerId);
        fetchOfferCandidates(offerId);
    };
    
    // Función para volver a la lista de ofertas
    const handleBackToOffers = () => {
        setReviewingCandidates(false);
        setCurrentOffer(null);
        setCandidates([]);
        setCandidatesFilter('todos');
    };
    
    // Función para obtener ofertas publicadas por la empresa (trabajo + educativas)
    const fetchCompanyOffers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError(t('myOffers.loginRequired'));
                return;
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Construir parámetros de filtrado para ofertas de trabajo
            let jobOffersUrl = `${backendUrl}/api/offers/company`;
            const params = new URLSearchParams();
            
            // Mapear los filtros de UI a los valores del backend
            if (statusFilter === 'activas') {
                params.append('status', 'accepted');
            } else if (statusFilter === 'pendientes') {
                params.append('status', 'pending');
            } else if (statusFilter === 'inactivas') {
                params.append('status', 'cancelled');
            }
            
            if (showPracticas) {
                params.append('practicas', 'true');
            }
            
            if (params.toString()) {
                jobOffersUrl += `?${params.toString()}`;
            }

            // URL para ofertas educativas
            const educationalOffersUrl = `${backendUrl}/api/offers/educational-offers/user`;
            
            // Hacer ambas llamadas en paralelo
            const [jobOffersResponse, educationalOffersResponse] = await Promise.allSettled([
                axios.get(jobOffersUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(educationalOffersUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            
            // Procesar ofertas de trabajo
            let jobOffers = [];
            if (jobOffersResponse.status === 'fulfilled') {
                jobOffers = (jobOffersResponse.value.data.offers || []).map(offer => ({
                    ...offer,
                    offerType: 'job' // Marcar como oferta de trabajo
                }));
            } else {
            }
            
            // Procesar ofertas educativas
            let educationalOffers = [];
            if (educationalOffersResponse.status === 'fulfilled') {
                // Obtener todas las ofertas educativas y mapear campos
                const allEducationalOffers = (educationalOffersResponse.value.data.offers || []).map(offer => ({
                    ...offer,
                    offerType: 'educational', // Marcar como oferta educativa
                    // Mapear campos para compatibilidad con el renderizado existente
                    companyName: offer.institutionName,
                    position: offer.programName,
                    city: offer.city,
                    publicationDate: offer.createdAt || offer.startDate
                }));
                
                // Aplicar filtros de estado a las ofertas educativas
                educationalOffers = allEducationalOffers.filter(offer => {
                    // Mapear los filtros de UI a los valores del backend para ofertas educativas
                    if (statusFilter === 'activas') {
                        return offer.status === 'accepted' || offer.status === 'active';
                    } else if (statusFilter === 'pendientes') {
                        return offer.status === 'pending';
                    } else if (statusFilter === 'inactivas') {
                        return offer.status === 'cancelled' || offer.status === 'inactive';
                    }
                    return true; // Si no hay filtro específico, mostrar todas
                });
                
                // Si se solicitan solo prácticas, filtrar ofertas educativas que puedan ser prácticas
                if (showPracticas) {
                    educationalOffers = educationalOffers.filter(offer => {
                        // Buscar en el nombre del programa o descripción palabras relacionadas con prácticas
                        const searchText = `${offer.programName || ''} ${offer.description || ''}`.toLowerCase();
                        return searchText.includes('práctica') || 
                               searchText.includes('practica') || 
                               searchText.includes('internship') ||
                               searchText.includes('prácticas') ||
                               searchText.includes('practicas');
                    });
                }
            } else {
            }
            
            // Combinar ambos tipos de ofertas
            const allOffers = [...jobOffers, ...educationalOffers];
            
            // Ordenar por fecha de publicación (más recientes primero)
            allOffers.sort((a, b) => new Date(b.publicationDate || b.createdAt) - new Date(a.publicationDate || a.createdAt));
            
            setCompanyOffers(allOffers);
            setTotalResults(allOffers.length);
        } catch (error) {
            setError(t('myOffers.loadPublishedError'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const handleJobOfferClick = (offerId) => {
        navigate(`/JobOfferDetail/${offerId}`);
    };

    const handleSearchMoreOffers = () => {
        navigate('/offers');
    };

    const handleCreateOffer = () => {
        navigate('/CreateOffer');
    };
    
    // Esta función ha sido reemplazada por la nueva implementación arriba
    
    const handleChangeOfferStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            await axios.put(
                `${backendUrl}/api/offers/${selectedOfferId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Cerrar el modal y actualizar la lista
            closeModals();
            fetchCompanyOffers();
        } catch (error) {
            closeModals();
        }
    };
    
    // Funciones para manejar los modales
    const openDeleteModal = (offerId, e) => {
        if (e) e.stopPropagation();
        setSelectedOfferId(offerId);
        setShowDeleteModal(true);
    };
    
    const openDeactivateModal = (offerId, e) => {
        if (e) e.stopPropagation();
        setSelectedOfferId(offerId);
        setShowDeactivateModal(true);
    };
    
    const closeModals = () => {
        setShowDeleteModal(false);
        setShowDeactivateModal(false);
        setSelectedOfferId(null);
    };
    
    const handleDeleteOffer = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            await axios.delete(
                `${backendUrl}/api/offers/${selectedOfferId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Cerrar el modal y actualizar la lista
            closeModals();
            fetchCompanyOffers();
        } catch (error) {
            closeModals();
        }
    };

    // Obtener las ofertas según la pestaña seleccionada para perfil creativo
    const getDisplayOffers = () => {
        switch (activeTab) {
            case 'aplicadas':
                return appliedOffers;
            case 'guardadas':
                return savedOffers;
            case 'caducadas':
                return expiredOffers;
            default:
                return [];
        }
    };

    const displayOffers = getDisplayOffers();

    // Función para renderizar los modales de confirmación
    const renderModals = () => {
        return (
            <>
                {/* Modal de confirmación para eliminar oferta */}
                {showDeleteModal && (
                    <div className="confirmation-modal-overlay">
                        <div className="confirmation-modal">
                            <div className="confirmation-modal-header">
                                <h3>{t('myOffers.deleteConfirmTitle')}</h3>
                                <button onClick={closeModals} className="close-button">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="confirmation-modal-content">
                                <p>{t('myOffers.deleteConfirmText')}</p>
                            </div>
                            <div className="confirmation-modal-actions">
                                <button onClick={closeModals} className="cancel-button">{t('apply.cancel')}</button>
                                <button onClick={handleDeleteOffer} className="confirm-button">{t('myOffers.deleteOffer')}</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Modal de confirmación para desactivar oferta */}
                {showDeactivateModal && (
                    <div className="confirmation-modal-overlay">
                        <div className="confirmation-modal">
                            <div className="confirmation-modal-header">
                                <h3>{t('myOffers.deactivateConfirmTitle')}</h3>
                                <button onClick={closeModals} className="close-button">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="confirmation-modal-content">
                                <p>{t('myOffers.deactivateConfirmText')}</p>
                            </div>
                            <div className="confirmation-modal-actions">
                                <button onClick={closeModals} className="cancel-button">{t('apply.cancel')}</button>
                                <button onClick={() => handleChangeOfferStatus('cancelled')} className="confirm-button deactivate">{t('myOffers.deactivate')}</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };
    
    if (loading) {
        return (
            <div className="mis-ofertas-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p className="loading-indicator">{t('myOffers.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mis-ofertas-error">
                <p>{error}</p>
                <button onClick={handleSearchMoreOffers} className="buscar-ofertas-btn">
                    {t('myOffers.searchOffers')}
                </button>
                {renderModals()}
            </div>
        );
    }

    // Renderizar interfaz para empresas
    if (isCompanyOrInstitution) {
        // Si está revisando candidatos, mostrar la interfaz de candidatos
        if (reviewingCandidates && currentOffer) {
            // Filtrar candidatos según la selección
            const filteredCandidates = candidates.filter(candidate => {
                if (candidatesFilter === 'todos') return true;
                if (candidatesFilter === 'seleccionados') return candidate.status === 'accepted';
                if (candidatesFilter === 'descartados') return candidate.status === 'rejected';
                return true;
            });
            
            return (
                <div className="candidatos-section">
                    <div className="candidatos-header">
                        <button 
                            className="candidatos-back-button"
                            onClick={handleBackToOffers}
                        >
                            {t('myOffers.backToOffers')}
                        </button>
                        <h2 className="candidatos-title">{currentOffer.position}</h2>
                    </div>
                    
                    <div className="candidatos-filters">
                        <div className="candidatos-filter-group">
                            <button 
                                className={`candidatos-filter ${candidatesFilter === 'todos' ? 'active' : ''}`}
                                onClick={() => setCandidatesFilter('todos')}
                            >
                                {t('myOffers.filterAll')}
                            </button>
                            <button 
                                className={`candidatos-filter ${candidatesFilter === 'seleccionados' ? 'active' : ''}`}
                                onClick={() => setCandidatesFilter('seleccionados')}
                            >
                                {t('myOffers.filterSelected')}
                            </button>
                            <button 
                                className={`candidatos-filter ${candidatesFilter === 'descartados' ? 'active' : ''}`}
                                onClick={() => setCandidatesFilter('descartados')}
                            >
                                {t('myOffers.filterRejected')}
                            </button>
                        </div>
                    </div>
                    
                    <div className="candidatos-response-toggle">
                        <button 
                            className={`candidatos-response-button ${showResponses ? 'active' : ''}`}
                            onClick={() => setShowResponses(true)}
                        >
                            {t('myOffers.showResponses')}
                        </button>
                        <button 
                            className={`candidatos-response-button ${!showResponses ? 'active' : ''}`}
                            onClick={() => setShowResponses(false)}
                        >
                            {t('myOffers.hideResponses')}
                        </button>
                    </div>
                    
                    <div className="candidatos-count">
                        {t('myOffers.results', { count: filteredCandidates.length })}
                    </div>
                    
                    <div className={`candidatos-list ${!showResponses ? 'compact' : ''}`}>
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((candidate) => (
                                <div className={`candidatos-card ${!showResponses ? 'no-resp' : ''}`} key={candidate._id}>
                                    <div className="candidatos-left-column">
                                        <div className="candidatos-profile">
                                            <div className="candidatos-avatar">
                                                <img
                                                    src={clImg.avatar(candidate.user.profile?.profilePicture) || '/default-avatar.png'}
                                                    alt={candidate.user.fullName}
                                                    className="candidatos-avatar-img"
                                                />
                                            </div>
                                            <div className="candidatos-info">
                                                <h3  
                                                    className="candidatos-name"  
                                                    onClick={() => navigate(`/profile/${candidate.user.username}`)}  
                                                    style={{ cursor: 'pointer' }}  
                                                >  
                                                    {candidate.user.fullName}  
                                                </h3>  
                                                <p className="candidatos-location">{candidate.user.city || 'Sin ubicación'}</p>
                                                {candidate.matchPercentage && (
                                                    <div className="candidatos-match">{candidate.matchPercentage}% Match</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="candidatos-actions">
                                            <button 
                                                className={`candidatos-action-btn select-btn ${candidate.status === 'accepted' ? 'selected' : ''}`}
                                                onClick={() => handleCandidateAction(candidate._id, 'accepted')}
                                                disabled={candidate.status === 'accepted'}
                                            >
                                                <FaCheck />
                                            </button>
                                            <button 
                                                className={`candidatos-action-btn reject-btn ${candidate.status === 'rejected' ? 'rejected' : ''}`}
                                                onClick={() => handleCandidateAction(candidate._id, 'rejected')}
                                                disabled={candidate.status === 'rejected'}
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="candidatos-right-column">
                                        {showResponses && currentOffer.extraQuestions && currentOffer.extraQuestions.length > 0 && (
                                            <div className="candidatos-responses">
                                                <div className="candidatos-responses-list">
                                                    {candidate.answers && candidate.answers.map((answer, index) => (
                                                        <div className="candidatos-response-item" key={index}>
                                                            <p className="candidatos-response-question">{answer.question}</p>
                                                            <p className="candidatos-response-answer">
                                                                {typeof answer.answer === 'boolean' 
                                                                    ? (answer.answer ? t('apply.yes') : t('apply.no'))
                                                                    : answer.answer
                                                                }
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {(!candidate.answers || candidate.answers.length === 0) && (
                                                        <p className="candidatos-no-responses">{t('myOffers.noResponses')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {showResponses && (
                                            <button 
                                                className="candidatos-view-profile"  
                                                onClick={() => navigate(`/profile/${candidate.user.username}`)}  
                                            >  
                                                {t('myOffers.viewProfile')}  
                                            </button>  
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="candidatos-no-results">
                                <p>{t('myOffers.noCandidatesFilter')}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        // Interfaz normal de gestión de ofertas
        return (
            <>
                <div className="company-offers-section">
                    <h2 className="company-offers-title">{t('myOffers.manageOffers')}</h2>
                    <p className="company-offers-description">
                        {t('myOffers.manageOffersDesc')}
                    </p>
                    
                    <div className="company-offers-filters">
                    <div className="status-filters">
                        <button 
                            className={`status-filter ${statusFilter === 'activas' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('activas')}
                        >
                            {t('myOffers.statusActiveFilter')}
                        </button>
                        <button 
                            className={`status-filter ${statusFilter === 'pendientes' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('pendientes')}
                        >
                            {t('myOffers.statusPendingFilter')}
                        </button>
                        <button 
                            className={`status-filter ${statusFilter === 'inactivas' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('inactivas')}
                        >
                            {t('myOffers.statusInactiveFilter')}
                        </button>
                    </div>
                    
                    <div className="secondary-filters">
                        <button 
                            className={`secondary-filter ${showAllOffers ? 'active' : ''}`}
                            onClick={() => {
                                setShowAllOffers(true);
                                setShowPracticas(false);
                            }}
                        >
                            {t('myOffers.filterAllOffers')}
                        </button>
                        <button 
                            className={`secondary-filter ${showPracticas ? 'active' : ''}`}
                            onClick={() => {
                                setShowPracticas(true);
                                setShowAllOffers(false);
                            }}
                        >
                            {t('myOffers.filterInternships')}
                        </button>
                    </div>
                    
                    <div className="results-count">
                        {t('myOffers.results', { count: totalResults })}
                    </div>
                </div>
                
                <div className="company-offers-list">
                    {companyOffers.length > 0 ? (
                        companyOffers.map((offer) => (
                            <div 
                                className={`company-offer-card ${offer.offerType === 'educational' ? 'educational-offer' : 'job-offer'}`}
                                key={offer._id}
                            >
                                {/* Indicador de tipo de oferta */}
                                <div className={`offer-type-badge ${offer.offerType}`}>
                                    {offer.offerType === 'educational' ? t('myOffers.educationalOfferBadge') : t('myOffers.jobOfferBadge')}
                                </div>
                                
                                <h3 className="offer-title">{offer.position || offer.programName}</h3>
                                <div className="offer-details">
                                    <div className="offer-detail">
                                        <span className="detail-label">{t('myOffers.publication')}</span>
                                        <span className="detail-value">{formatDate(offer.publicationDate || offer.createdAt)}</span>
                                    </div>
                                    
                                    {offer.offerType === 'job' ? (
                                        <div className="offer-detail">
                                            <span className="detail-label">{t('myOffers.offerType')}</span>
                                            <span className={`detail-value ${offer.isUrgent ? 'urgent' : ''}`}>
                                                {offer.isUrgent ? t('myOffers.urgent') : t('myOffers.normal')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="offer-detail">
                                            <span className="detail-label">{t('myOffers.modality')}</span>
                                            <span className="detail-value">{offer.modality || t('myOffers.notSpecified')}</span>
                                        </div>
                                    )}
                                    
                                    <div className="offer-detail">
                                        <span className="detail-label">{t('myOffers.offerStatusLabel')}</span>
                                        <span className={`detail-value status-${offer.status === 'accepted' ? 'activa' : offer.status === 'pending' ? 'pendiente' : 'inactiva'}`}>
                                            {offer.status === 'accepted' ? t('myOffers.statusActive') : 
                                            offer.status === 'cancelled' ? t('myOffers.statusInactive') : 
                                            offer.status === 'pending' ? t('myOffers.statusPending') : t('myOffers.statusActive')}
                                        </span>
                                    </div>
                                    
                                    {offer.offerType === 'educational' && offer.duration && (
                                        <div className="offer-detail">
                                            <span className="detail-label">{t('myOffers.durationLabel')}</span>
                                            <span className="detail-value">{offer.duration} {offer.durationUnit || t('myOffers.months')}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Solo mostrar candidatos para ofertas de trabajo */}
                                {offer.offerType === 'job' && (
                                    <div className="offer-candidates">
                                        <span className="candidates-count">{t('myOffers.candidatesCount', { count: offer.applicationsCount || 0 })}</span>
                                        <span className="candidates-separator">|</span>
                                        <span className="candidates-reviewed">{t('myOffers.reviewedCount', { count: offer.reviewedApplicationsCount || 0 })}</span>
                                    </div>
                                )}
                                
                                {/* Mostrar información de fecha de inicio para ofertas educativas */}
                                {offer.offerType === 'educational' && offer.startDate && (
                                    <div className="offer-candidates">
                                        <span className="candidates-count">{t('myOffers.start')} {formatDate(offer.startDate)}</span>
                                        {offer.endDate && (
                                            <>
                                                <span className="candidates-separator">|</span>
                                                <span className="candidates-reviewed">{t('myOffers.end')} {formatDate(offer.endDate)}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                <div className="offer-actions">
                                    {offer.offerType === 'job' ? (
                                        <>
                                            <button 
                                                className="action-btn review-btn"
                                                onClick={(e) => handleReviewCandidates(offer._id, e)}
                                            >
                                                {t('myOffers.reviewCandidates')}
                                            </button>
                                            
                                            <button 
                                                className="action-btn deactivate-btn"
                                                onClick={(e) => openDeactivateModal(offer._id, e)}
                                            >
                                                {t('myOffers.deactivateOffer')}
                                            </button>
                                            
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={(e) => openDeleteModal(offer._id, e)}
                                            >
                                                {t('myOffers.deleteOffer')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                className="action-btn view-btn"
                                                onClick={() => navigate(`/EducationalOfferDetail/${offer._id}`)}
                                            >
                                                {t('myOffers.viewDetails')}
                                            </button>
                                            
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={(e) => openDeleteModal(offer._id, e)}
                                            >
                                                {t('myOffers.deleteOffer')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-offers-message">
                            <p>{t('myOffers.noPublishedOffers')}</p>
                            <button 
                                onClick={handleCreateOffer} 
                                className="create-offer-btn"
                            >
                                {t('myOffers.createNewOffer')}
                            </button>
                        </div>
                    )}
                    </div>
                    
                    {companyOffers.length > 0 && (
                        <div className="company-offers-footer">
                            <button 
                                onClick={handleCreateOffer} 
                                className="create-offer-btn"
                            >
                                {t('myOffers.createNewOffer')}
                            </button>
                        </div>
                    )}
                </div>
                {renderModals()}
            </>
        );
    }



    // Renderizar interfaz para creativos (nuevo diseño)
    return (
        <>
            <div className="mis-ofertas-section">
                <div className="mis-ofertas-header">
                    {isCreative && (
                        <button
                            className={`ofertas-tab ${activeTab === 'aplicadas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('aplicadas')}
                        >
                            {t('myOffers.tabApplied')}
                        </button>
                    )}
                    <button
                        className={`ofertas-tab ${activeTab === 'guardadas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('guardadas')}
                    >
                        {t('myOffers.tabSaved')}
                    </button>
                    <button
                        className={`ofertas-tab ${activeTab === 'caducadas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('caducadas')}
                    >
                        {t('myOffers.tabExpired')}
                    </button>
                </div>
                
                {displayOffers.length > 0 ? (
                    <div className="ofertas-list">
                        {displayOffers.map((offer) => (
                            <div 
                                key={offer._id} 
                                className={`oferta-card ${activeTab === 'caducadas' ? 'oferta-caducada' : ''}`}
                                onClick={() => handleJobOfferClick(offer._id)}
                            >
                                <div className="oferta-content">
                                    <div className="oferta-logo">
                                        <img
                                            src={clImg.logo(offer.companyLogo) || '/multimedia/company-default.png'}
                                            alt={offer.companyName}
                                        />
                                    </div>
                                    <div className="oferta-details">
                                        <h4 className="oferta-job-title">{t('myOffers.jobDescription')}</h4>
                                        <p className="oferta-company-name">{offer.companyName || t('myOffers.companyDefault')}</p>
                                        
                                        <div className="oferta-info-row">
                                            <span className="info-item">{formatDate(offer.publicationDate)}</span>
                                            <span className="info-separator">|</span>
                                            <span className="info-item">{offer.jobType || t('myOffers.jobTypeDefault')}</span>
                                            <span className="info-separator">|</span>
                                            <span className="info-item"><i className="location-icon"></i> {offer.city}, {offer.country || t('myOffers.countryDefault')}</span>
                                        </div>
                                        
                                        {offer.isUrgent && <div className="urgent-tag">{t('myOffers.urgentTag')}</div>}
                                        
                                        <div className="oferta-status">
                                            {activeTab === 'aplicadas' && (
                                                <div className="status-pill aplicadas">
                                                    {t('myOffers.applicationSent')}
                                                </div>
                                            )}
                                            {activeTab === 'guardadas' && (
                                                <div className="status-pill guardadas">
                                                    {t('myOffers.viewDetails')}
                                                </div>
                                            )}
                                            {activeTab === 'caducadas' && (
                                                <div className="status-pill caducadas">
                                                    {t('myOffers.offerExpired')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-ofertas-message">
                        {activeTab === 'aplicadas' && isCreative && (
                            <p>{t('myOffers.noApplied')}</p>
                        )}
                        {activeTab === 'guardadas' && (
                            <p>{t('myOffers.noSaved')}</p>
                        )}
                        {activeTab === 'caducadas' && (
                            <p>{t('myOffers.noExpired')}</p>
                        )}
                    </div>
                )}
                
                <div className="ofertas-footer">
                    <button className="buscar-ofertas-btn" onClick={handleSearchMoreOffers}>
                        {t('myOffers.searchOffers')}
                    </button>
                </div>
            </div>
            {renderModals()}
        </>
    );
};
export default MisOfertasSection;
