import React, { useState } from 'react';
import { FaGraduationCap, FaCalendarAlt, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EducationalOffersSection = ({ offers = [] }) => {
    const [statusFilter, setStatusFilter] = useState('all');

    if (!Array.isArray(offers) || offers.length === 0) {
        return (
            <div className="company-offers-empty-company">
                <div className="offers-empty-icon-company">
                    <FaGraduationCap />
                </div>
                <h3>No hay ofertas educativas publicadas</h3>
                <p>Aún no has publicado ninguna oferta educativa.</p>
                <Link to="/createEducationalOffer" className="create-offer-button-company">
                    Publicar oferta educativa
                </Link>
            </div>
        );
    }

    // Helper function to translate status
    const translateStatus = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'accepted': return 'Aceptada';
            case 'cancelled': return 'Cancelada';
            default: return 'Desconocido';
        }
    };

    // Filter offers based on selected status
    const filteredOffers = statusFilter === 'all'
        ? offers
        : offers.filter(offer => offer.status === statusFilter);

    // Helper function to format duration
    const formatDuration = (duration) => {
        if (!duration) return 'No especificada';
        return `${duration.value} ${duration.unit}`;
    };

    return (
        <div className="company-offers-container-company">
            {filteredOffers.length === 0 ? (
                <div className="no-filtered-offers">
                    <p>No hay ofertas educativas con el filtro seleccionado.</p>
                </div>
            ) : (
                filteredOffers.map((offer, index) => (
                    <div key={index} className="company-offer-item-company">
                        <div className="offer-header-company">
                            <h3 className="offer-title-company">{offer.programName}</h3>
                            <span className={`offer-status-company status-${offer.status}`}>
                                {translateStatus(offer.status)}
                            </span>
                        </div>

                        <div className="offer-details-company">
                            <div className="offer-detail-company">
                                <FaGraduationCap className="offer-icon-company" />
                                <span>{offer.studyType || 'Tipo no especificado'}</span>
                            </div>
                            
                            <div className="offer-detail-company">
                                <FaCalendarAlt className="offer-icon-company" />
                                <span>{formatDuration(offer.duration)}</span>
                            </div>

                            {offer.location && offer.location.city && (
                                <div className="offer-detail-company">
                                    <FaMapMarkerAlt className="offer-icon-company" />
                                    <span>{`${offer.location.city}, ${offer.location.country || ''}`}</span>
                                </div>
                            )}
                        </div>

                        <div className="offer-description-company">
                            {offer.description 
                                ? (typeof offer.description === 'string' && offer.description.length > 120
                                    ? `${offer.description.replace(/<[^>]*>/g, '').substring(0, 120)}...`
                                    : offer.description.replace(/<[^>]*>/g, ''))
                                : 'Sin descripción'}
                        </div>

                        <div className="offer-actions-company">
                            <Link to={`/EducationalOfferDetail/${offer._id}`} className="view-offer-button-company">
                                Ver detalles
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default EducationalOffersSection;
