import React from 'react';
import { FaTags } from 'react-icons/fa';

const CompanyTagsSection = ({ companyTags, offersPractices = false }) => {
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
                <p className="no-data-message">No hay etiquetas de especialización registradas.</p>
            )}
            
            {offersPractices && (
                <div className="practice-badge">
                    <span>Ofrece prácticas profesionales</span>
                </div>
            )}
        </div>
    );
};

export default CompanyTagsSection;
