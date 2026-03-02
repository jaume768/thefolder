import React from 'react';

const SoftwareSection = ({ software }) => {
    // No renderizar la sección si no hay software
    if (!software || software.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>Software</h2>
            <div className="miPerfil-chips">
                {software.map((sw, index) => (
                    <span key={index} className="miPerfil-chip">{sw}</span>
                ))}
            </div>
        </section>
    );
};

export default SoftwareSection;
