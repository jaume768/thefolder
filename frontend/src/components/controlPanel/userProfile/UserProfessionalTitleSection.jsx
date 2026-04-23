import React from 'react';
import { useTranslation } from 'react-i18next';

const UserProfessionalTitleSection = ({ professionalTags }) => {
  const { t } = useTranslation('profile');
    // No renderizar la sección si no hay etiquetas profesionales
    if (!professionalTags || professionalTags.length === 0) return null;
    
    return (
        <section className="user-extern-section">
            <h2>{t('sections.professionalTitle')}</h2>
            <div className="user-extern-tags-container">
                {professionalTags.map((tag, index) => (
                    <span key={index} className="user-extern-tag">{tag}</span>
                ))}
            </div>
        </section>
    );
};

export default UserProfessionalTitleSection;
