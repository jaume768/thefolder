import React from 'react';

const ProfessionalTitleSection = ({ professionalTags }) => {
    // No renderizar la sección si no hay etiquetas profesionales
    if (!professionalTags || professionalTags.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>Título profesional</h2>
            <div className="miPerfil-tags-container">
                {professionalTags.map((tag, index) => (
                    <span key={index} className="creative-type">{tag}</span>
                ))}
            </div>
        </section>
    );
};

export default ProfessionalTitleSection;
