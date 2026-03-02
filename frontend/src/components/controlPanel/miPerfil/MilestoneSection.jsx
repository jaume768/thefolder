import React from 'react';
import { FaAward } from 'react-icons/fa';

const MilestoneSection = ({ professionalMilestones }) => {
    if (!Array.isArray(professionalMilestones) || professionalMilestones.length === 0) {
        return (
            <section className="miPerfil-section">
                <h2>
                    <FaAward style={{marginRight: '8px'}} />
                    Hitos profesionales
                </h2>
                <p>No hay hitos profesionales registrados.</p>
            </section>
        );
    }

    return (
        <section className="miPerfil-section">
            <h2>
                Hitos profesionales
            </h2>
            <ul className="miPerfil-experience-list">
                {professionalMilestones.map((milestone, index) => (
                    <li key={index} className="miPerfil-experience-item">
                        <div className="miPerfil-experience-icon">
                            <FaAward />
                        </div>
                        <div className="miPerfil-experience-content">
                            <div className="miPerfil-experience-title">{milestone.name}</div>
                            <div className="miPerfil-experience-company">{milestone.entity}</div>
                            <div className="miPerfil-experience-date">{milestone.date}</div>
                            {milestone.description && (
                                <div className="miPerfil-experience-description">{milestone.description}</div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default MilestoneSection;
