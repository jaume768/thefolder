import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGraduationCap, FaCalendarAlt, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EducationalOffersSection = ({ offers = [] }) => {
    const { t } = useTranslation('profile');
    const [statusFilter, setStatusFilter] = useState('all');

    if (!Array.isArray(offers) || offers.length === 0) {
        return (
            <div className="company-offers-empty-company">
                <div className="offers-empty-icon-company">
                    <FaGraduationCap />
                </div>
                <h3>{t('offers.emptyEducationalTitle')}</h3>
                <p>{t('offers.emptyEducationalDescPersonal')}</p>
                <Link to="/createEducationalOffer" className="create-offer-button-company">
                    {t('offers.publishEducational')}
                </Link>
            </div>
        );
    }

    // Helper function to translate status
    const translateStatus = (status) => {
        switch (status) {
            case 'pending': return t('status.pending');
            case 'accepted': return t('status.accepted');
            case 'cancelled': return t('status.cancelled');
            default: return t('status.unknown');
        }
    };

    // Filter offers based on selected status
    const filteredOffers = statusFilter === 'all'
        ? offers
        : offers.filter(offer => offer.status === statusFilter);

    // Helper function to format duration
    const formatDuration = (duration) => {
        if (!duration) return t('offers.notSpecified');
        return `${duration.value} ${duration.unit}`;
    };

    return (
        <div className="company-offers-container-company">
            {filteredOffers.length === 0 ? (
                <div className="no-filtered-offers">
                    <p>{t('offers.noFiltered')}</p>
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
                                <span>{offer.studyType || t('offers.typeNotSpecified')}</span>
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
                                : t('offers.noDescriptionShort')}
                        </div>

                        <div className="offer-actions-company">
                            <Link to={`/EducationalOfferDetail/${offer._id}`} className="view-offer-button-company">
                                {t('offers.viewDetails')}
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default EducationalOffersSection;
