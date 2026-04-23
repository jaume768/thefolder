import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfessionalTitleSection = ({ professionalTags }) => {
    const { t } = useTranslation('profile');
    // No renderizar la sección si no hay etiquetas profesionales
    if (!professionalTags || professionalTags.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>{t('sections.professionalTitle')}</h2>
            <div className="miPerfil-tags-container">
                {professionalTags.map((tag, index) => (
                    <span key={index} className="creative-type">{tag}</span>
                ))}
            </div>
        </section>
    );
};

export default ProfessionalTitleSection;
