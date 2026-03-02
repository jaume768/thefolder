import React, { useState } from 'react';
import { FaGraduationCap, FaCalendarAlt, FaMapMarkerAlt, FaFilter, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserEducationalOffersSection = ({ offers = [] }) => {
    const [statusFilter, setStatusFilter] = useState('all');

    if (!Array.isArray(offers) || offers.length === 0) {
        return (
            <div className="user-extern-offers-empty">
                <div className="user-extern-offers-empty-icon">
                    <FaGraduationCap />
                </div>
                <h3>No hay ofertas educativas publicadas</h3>
                <p>Esta institución aún no ha publicado ninguna oferta educativa.</p>
            </div>
        );
    }

    // Helper function to translate status
    const translateStatus = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'accepted': return 'Aceptada';
            case 'cancelled': return 'Cancelada';
            case 'active': return 'Activa';
            default: return 'Activa';
        }
    };

    // Filter offers based on selected status
    const filteredOffers = statusFilter === 'all'
        ? offers
        : offers.filter(offer => offer.status === statusFilter);

    // Helper function to format duration
    const formatDuration = (duration) => {
        if (!duration) return '';
        return `${duration.value} ${duration.unit}`;
    };

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="user-extern-offers-section">
            {statusFilter !== 'all' && (
                <div className="user-extern-offers-filter">
                    <div className="user-extern-filter-header">
                        <FaFilter className="user-extern-filter-icon" />
                        <span>Filtro activo: {translateStatus(statusFilter)}</span>
                    </div>
                    <button 
                        className="user-extern-clear-filter" 
                        onClick={() => setStatusFilter('all')}
                    >
                        Mostrar todas
                    </button>
                </div>
            )}

            <div className="user-extern-offers-container">
                {filteredOffers.length === 0 ? (
                    <div className="user-extern-no-filtered-offers">
                        No hay ofertas educativas con el filtro seleccionado
                    </div>
                ) : (
                    filteredOffers.map((offer, index) => (
                        <div key={offer._id || index} className="user-extern-offer-card">
                            <div className="user-extern-offer-header">
                                <span className="user-extern-offer-type">{offer.programName || offer.title || 'Oferta educativa'}</span>
                                <div className="user-extern-offer-metadata">
                                    {offer.duration && (
                                        <>
                                            <span className="user-extern-offer-years">{formatDuration(offer.duration)}</span>
                                            <span className="user-extern-offer-separator">|</span>
                                        </>
                                    )}
                                    {offer.schedule && (
                                        <>
                                            <span className="user-extern-offer-schedule">{offer.schedule}</span>
                                            <span className="user-extern-offer-separator">|</span>
                                        </>
                                    )}
                                    {offer.modality && (
                                        <span className="user-extern-offer-modality">{offer.modality}</span>
                                    )}
                                    {offer.practices && (
                                        <>
                                            <span className="user-extern-offer-separator">|</span>
                                            <span className="user-extern-offer-practices">Prácticas</span>
                                        </>
                                    )}
                                    {offer.publicationDate && (
                                        <>
                                            <span className="user-extern-offer-separator">|</span>
                                            <span className="user-extern-offer-date">
                                                <FaCalendarAlt style={{marginRight: '4px'}} />
                                                {formatDate(offer.publicationDate)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="user-extern-offer-description">
                                <p>{offer.description && offer.description.length > 150 
                                    ? `${offer.description.substring(0, 150)}...` 
                                    : offer.description || 'No hay descripción disponible.'}</p>
                            </div>
                            
                            {offer.location && (
                                <div className="user-extern-offer-location">
                                    <FaMapMarkerAlt style={{marginRight: '4px'}} />
                                    <span>
                                        {typeof offer.location === 'string' 
                                            ? offer.location 
                                            : offer.location.city 
                                                ? `${offer.location.city}${offer.location.country ? `, ${offer.location.country}` : ''}` 
                                                : 'Ubicación no especificada'}
                                    </span>
                                </div>
                            )}
                            
                            <div className="user-extern-offer-tags">
                                {offer.tags && offer.tags.length > 0 ? (
                                    offer.tags.map((tag, tagIndex) => (
                                        <span key={tagIndex} className="user-extern-offer-tag">{tag}</span>
                                    ))
                                ) : offer.categories && offer.categories.length > 0 ? (
                                    offer.categories.map((category, catIndex) => (
                                        <span key={catIndex} className="user-extern-offer-tag">{category}</span>
                                    ))
                                ) : offer.studyType ? (
                                    <span className="user-extern-offer-tag">{offer.studyType}</span>
                                ) : (
                                    <span className="user-extern-offer-tag">Sin categorías</span>
                                )}
                            </div>
                            
                            <div className="user-extern-offer-footer">
                                <Link to={`/EducationalOfferDetail/${offer._id}`} className="user-extern-offer-button">
                                    Más información
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserEducationalOffersSection;
