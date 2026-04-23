import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaTags } from 'react-icons/fa';

const CompanyTagsSection = ({ companyTags, offersPractices = false }) => {
    const { t } = useTranslation('profile');
    const hasContent = Array.isArray(companyTags) && companyTags.length > 0;

    return (
        <div className="profile-section">
            {hasContent ? (
                <div className="company-tags-container">
                    {companyTags.map((tag, index) => (
                        <span key={index} className="company-tag">
                            {tag}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="no-data-message">{t('sections.emptySpecialization')}</p>
            )}
            
            {offersPractices && (
                <div className="practice-badge">
                    <span>{t('sections.offersPractices')}</span>
                </div>
            )}
        </div>
    );
};

export default CompanyTagsSection;
