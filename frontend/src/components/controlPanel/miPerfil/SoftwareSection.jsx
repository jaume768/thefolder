import React from 'react';
import { useTranslation } from 'react-i18next';

const SoftwareSection = ({ software }) => {
    const { t } = useTranslation('profile');
    // No renderizar la sección si no hay software
    if (!software || software.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>{t('sections.software')}</h2>
            <div className="miPerfil-chips">
                {software.map((sw, index) => (
                    <span key={index} className="miPerfil-chip">{sw}</span>
                ))}
            </div>
        </section>
    );
};

export default SoftwareSection;
