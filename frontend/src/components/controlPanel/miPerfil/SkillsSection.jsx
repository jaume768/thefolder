import React from 'react';
import { useTranslation } from 'react-i18next';

const SkillsSection = ({ skills }) => {
    const { t } = useTranslation('profile');
    // No renderizar la sección si no hay habilidades
    if (!skills || skills.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>{t('sections.skills')}</h2>
            <div className="miPerfil-chips">
                {skills.map((skill, index) => (
                    <span key={index} className="miPerfil-chip">{skill}</span>
                ))}
            </div>
        </section>
    );
};

export default SkillsSection;
