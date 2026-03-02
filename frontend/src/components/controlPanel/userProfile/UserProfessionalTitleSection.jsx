import React from 'react';

const UserProfessionalTitleSection = ({ professionalTags }) => {
    // No renderizar la sección si no hay etiquetas profesionales
    if (!professionalTags || professionalTags.length === 0) return null;
    
    return (
        <section className="user-extern-section">
            <h2>Título profesional</h2>
            <div className="user-extern-tags-container">
                {professionalTags.map((tag, index) => (
                    <span key={index} className="user-extern-tag">{tag}</span>
                ))}
            </div>
        </section>
    );
};

export default UserProfessionalTitleSection;
