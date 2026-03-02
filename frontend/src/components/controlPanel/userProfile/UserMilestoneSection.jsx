// UserMilestoneSection.jsx
import React from 'react';
import { FaAward } from 'react-icons/fa';

const UserMilestoneSection = ({ professionalMilestones }) => {
  if (!Array.isArray(professionalMilestones) || professionalMilestones.length === 0) {
    return (
      <section className="user-extern-section">
        <h2>
          <FaAward style={{ marginRight: '8px' }} /> Hitos profesionales
        </h2>
        <p>No hay hitos profesionales registrados.</p>
      </section>
    );
  }

  return (
    <section className="user-extern-section">
      <h2>Hitos profesionales</h2>

      <ul className="user-extern-experience-list">
        {professionalMilestones.map((milestone, index) => (
          <li key={index} className="user-extern-experience-item">
            <div className="user-extern-experience-icon">
              <FaAward />
            </div>

            <div className="user-extern-experience-content">
              <div className="user-extern-experience-title">{milestone.name}</div>
              <div className="user-extern-experience-company">{milestone.entity}</div>
              <div className="user-extern-experience-date">{milestone.date}</div>

              {milestone.description && (
                <div className="user-extern-experience-description">{milestone.description}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserMilestoneSection;
