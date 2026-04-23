import React from 'react';
import { useTranslation } from 'react-i18next';

const AdditionalInfoSection = ({ offer, formatPrice, formatDate }) => {
    const { t } = useTranslation('offers');
    return (
        <>
            <section className="job-section-jobdetail">
                <h3 className="section-title-jobdetail">{t('view.additionalInfo.title')}</h3>
                <div className="additional-info-jobdetail">
                    <div className="info-row-jobdetail">
                        <span className="info-label-jobdetail">{t('view.additionalInfo.credits')}</span>
                        <span className="info-value-jobdetail">{offer.credits || t('view.additionalInfo.notSpecified')}</span>
                    </div>
                    <div className="info-row-jobdetail">
                        <span className="info-label-jobdetail">{t('view.additionalInfo.startDate')}</span>
                        <span className="info-value-jobdetail">{offer.enrollmentPeriod?.startDate ? formatDate(offer.enrollmentPeriod.startDate) : t('view.additionalInfo.notSpecifiedFem')}</span>
                    </div>
                    {offer.enrollmentPeriod?.endDate && (
                        <div className="info-row-jobdetail">
                            <span className="info-label-jobdetail">{t('view.additionalInfo.endDate')}</span>
                            <span className="info-value-jobdetail">{formatDate(offer.enrollmentPeriod.endDate)}</span>
                        </div>
                    )}
                </div>
            </section>

            {offer.brochureUrl && (
                <section className="job-section-jobdetail">
                    <h3 className="section-title-jobdetail">{t('view.additionalInfo.documentation')}</h3>
                    <a 
                        href={offer.brochureUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="download-brochure-button-jobdetail"
                    >
                        <i className="fas fa-file-download"></i> {t('view.additionalInfo.downloadBrochure')}
                    </a>
                </section>
            )}
            
            {!offer.applicationLink && offer.contactInfo && (
                <section className="job-section-jobdetail">
                    <h3 className="section-title-jobdetail">{t('view.additionalInfo.contact')}</h3>
                    <div className="rich-text-jobdetail" dangerouslySetInnerHTML={{ __html: offer.contactInfo }}></div>
                </section>
            )}
        </>
    );
};

export default AdditionalInfoSection;
