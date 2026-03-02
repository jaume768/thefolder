import React, { useState } from 'react';
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CompanyOffersSection = ({ offers = [] }) => {
    const [statusFilter, setStatusFilter] = useState('all');

    if (!Array.isArray(offers) || offers.length === 0) {
        return (
            <div className="company-offers-empty-company">
                <div className="offers-empty-icon-company">
                    <FaBriefcase />
                </div>
                <h3>No hay ofertas publicadas</h3>
                <p>Aún no has publicado ninguna oferta de trabajo.</p>
                <Link to="/createOffer" className="create-offer-button-company">
                    Publicar oferta
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

    return (
        <div className="company-offers-container-company">

            {filteredOffers.length === 0 ? (
                <div className="no-filtered-offers">
                    <p>No hay ofertas con el filtro seleccionado.</p>
                </div>
            ) : (
                filteredOffers.map((offer, index) => (
                    <div key={index} className="company-offer-item-company">
                        <div className="offer-header-company">
                            <h3 className="offer-title-company">{offer.position}</h3>
                            <span className={`offer-status-company status-${offer.status}`}>
                                {translateStatus(offer.status)}
                            </span>
                        </div>

                        <div className="offer-details-company">
                            <div className="offer-detail-company">
                                <FaCalendarAlt className="offer-icon-company" />
                                <span>{new Date(offer.publicationDate).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}</span>
                            </div>

                            <div className="offer-detail-company">
                                <FaMapMarkerAlt className="offer-icon-company" />
                                <span>{offer.city || 'Ubicación no especificada'}</span>
                            </div>
                        </div>

                        <div className="offer-description-company">
                            {offer.description && offer.description.length > 120
                                ? `${offer.description.substring(0, 120)}...`
                                : offer.description || 'Sin descripción'}
                        </div>

                        <div className="offer-actions-company">
                            <Link to={`/JobOfferDetail/${offer._id}`} className="view-offer-button-company">
                                Ver detalles
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default CompanyOffersSection;
