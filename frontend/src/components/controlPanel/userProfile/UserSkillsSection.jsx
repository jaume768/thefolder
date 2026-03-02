// UserSkillsSection.jsx
import React from 'react';

const UserSkillsSection = ({ skills }) => {
  // No renderizar la sección si no hay habilidades
  if (!skills || skills.length === 0) return null;

  return (
    <section className="user-extern-section">
      <h2>Habilidades</h2>

      <div className="user-extern-skills-tags">
        {skills.map((skill, index) => (
          <span key={index} className="user-extern-skill-tag">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
};

export default UserSkillsSection;
