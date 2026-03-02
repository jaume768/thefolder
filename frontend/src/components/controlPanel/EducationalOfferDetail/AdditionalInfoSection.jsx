import React from 'react';

const AdditionalInfoSection = ({ offer, formatPrice, formatDate }) => {
    return (
        <>
            <section className="job-section-jobdetail">
                <h3 className="section-title-jobdetail">Información adicional</h3>
                <div className="additional-info-jobdetail">
                    <div className="info-row-jobdetail">
                        <span className="info-label-jobdetail">Créditos:</span>
                        <span className="info-value-jobdetail">{offer.credits || 'No especificado'}</span>
                    </div>
                    <div className="info-row-jobdetail">
                        <span className="info-label-jobdetail">Fecha de inicio:</span>
                        <span className="info-value-jobdetail">{offer.enrollmentPeriod?.startDate ? formatDate(offer.enrollmentPeriod.startDate) : 'No especificada'}</span>
                    </div>
                    {offer.enrollmentPeriod?.endDate && (
                        <div className="info-row-jobdetail">
                            <span className="info-label-jobdetail">Fecha de finalización:</span>
                            <span className="info-value-jobdetail">{formatDate(offer.enrollmentPeriod.endDate)}</span>
                        </div>
                    )}
                </div>
            </section>

            {offer.brochureUrl && (
                <section className="job-section-jobdetail">
                    <h3 className="section-title-jobdetail">Documentación</h3>
                    <a 
                        href={offer.brochureUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="download-brochure-button-jobdetail"
                    >
                        <i className="fas fa-file-download"></i> Descargar folleto informativo
                    </a>
                </section>
            )}
            
            {!offer.applicationLink && offer.contactInfo && (
                <section className="job-section-jobdetail">
                    <h3 className="section-title-jobdetail">Contacto</h3>
                    <div className="rich-text-jobdetail" dangerouslySetInnerHTML={{ __html: offer.contactInfo }}></div>
                </section>
            )}
        </>
    );
};

export default AdditionalInfoSection;
