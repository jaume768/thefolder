// UserSoftwareSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserSoftwareSection = ({ software }) => {
  const { t } = useTranslation('profile');
  // No renderizar la sección si no hay software
  if (!software || software.length === 0) return null;

  return (
    <section className="user-extern-section">
      <h2>{t('sections.software')}</h2>

      <div className="user-extern-chips">
        {software.map((sw, index) => (
          <span key={index} className="user-extern-skill-tag">
            {sw}
          </span>
        ))}
      </div>
    </section>
  );
};

export default UserSoftwareSection;
