// UserCompanyOffersSection.jsx
import React from 'react';
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserCompanyOffersSection = ({ offers = [] }) => {
  if (!Array.isArray(offers) || offers.length === 0) {
    return (
      <div className="user-extern-offers-empty">
        <div className="user-extern-offers-empty-icon">
          <FaBriefcase />
        </div>
        <h3>No hay ofertas publicadas</h3>
        <p>Esta empresa aún no ha publicado ninguna oferta de trabajo.</p>
      </div>
    );
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="user-extern-offers-container">
      {offers.map((offer, index) => (
        <div key={offer._id || index} className="user-extern-offer-card">
          <div className="user-extern-offer-header">
            <span className="user-extern-offer-type">{offer.position || 'Oferta de trabajo'}</span>

            <div className="user-extern-offer-metadata">
              {offer.yearsExperience && (
                <>
                  <span className="user-extern-offer-years">{offer.yearsExperience} años</span>
                  <span className="user-extern-offer-separator">|</span>
                </>
              )}

              {offer.schedule && (
                <>
                  <span className="user-extern-offer-schedule">{offer.schedule}</span>
                  <span className="user-extern-offer-separator">|</span>
                </>
              )}

              {offer.modality && <span className="user-extern-offer-modality">{offer.modality}</span>}

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
                    <FaCalendarAlt style={{ marginRight: '4px' }} />
                    {formatDate(offer.publicationDate)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="user-extern-offer-description">
            <p>
              {offer.description && offer.description.length > 150
                ? `${offer.description.substring(0, 150)}...`
                : offer.description || 'No hay descripción disponible.'}
            </p>
          </div>

          {offer.location && (
            <div className="user-extern-offer-location">
              <FaMapMarkerAlt style={{ marginRight: '4px' }} />
              <span>{offer.location}</span>
            </div>
          )}

          <div className="user-extern-offer-tags">
            {offer.tags && offer.tags.length > 0 ? (
              offer.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="user-extern-offer-tag">
                  {tag}
                </span>
              ))
            ) : offer.categories && offer.categories.length > 0 ? (
              offer.categories.map((category, catIndex) => (
                <span key={catIndex} className="user-extern-offer-tag">
                  {category}
                </span>
              ))
            ) : (
              <span className="user-extern-offer-tag">Sin categorías</span>
            )}
          </div>

          <div className="user-extern-offer-footer">
            <Link to={`/JobOfferDetail/${offer._id}`} className="user-extern-offer-button">
              Más información
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCompanyOffersSection;
