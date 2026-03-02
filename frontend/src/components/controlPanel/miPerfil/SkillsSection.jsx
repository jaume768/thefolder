import React from 'react';

const SkillsSection = ({ skills }) => {
    // No renderizar la sección si no hay habilidades
    if (!skills || skills.length === 0) return null;
    
    return (
        <section className="miPerfil-section">
            <h2>Habilidades</h2>
            <div className="miPerfil-chips">
                {skills.map((skill, index) => (
                    <span key={index} className="miPerfil-chip">{skill}</span>
                ))}
            </div>
        </section>
    );
};

export default SkillsSection;
