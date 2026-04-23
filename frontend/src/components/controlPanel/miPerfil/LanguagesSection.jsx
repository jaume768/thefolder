import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguagesSection = ({ languages }) => {
    const { t } = useTranslation('profile');
    if (!languages || languages.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>{t('sections.languages')}</h2>
            <div className="miPerfil-languages">
                {languages.map((language, index) => (
                    <span key={index} className="creative-type">
                        {language}
                    </span>
                ))}
            </div>
        </section>
    );
};

export default LanguagesSection;
