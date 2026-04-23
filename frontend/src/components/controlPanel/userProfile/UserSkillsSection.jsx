// UserSkillsSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserSkillsSection = ({ skills }) => {
  const { t } = useTranslation('profile');
  // No renderizar la sección si no hay habilidades
  if (!skills || skills.length === 0) return null;

  return (
    <section className="user-extern-section">
      <h2>{t('sections.skills')}</h2>

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
