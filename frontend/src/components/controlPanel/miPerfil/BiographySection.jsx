import React from 'react';

const BiographySection = ({ biography }) => {
    // No renderizar la sección si no hay biografía
    if (!biography || biography.trim() === '') return null;
    
    return (
        <section className="miPerfil-section-description">
            <h2>Bio</h2>
            <p>
                {biography}
            </p>
        </section>
    );
};

export default BiographySection;
