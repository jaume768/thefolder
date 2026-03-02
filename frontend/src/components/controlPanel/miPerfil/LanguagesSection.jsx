import React from 'react';

const LanguagesSection = ({ languages }) => {
    if (!languages || languages.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>Idiomas</h2>
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
