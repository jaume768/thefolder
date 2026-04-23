// UserBiographySection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserBiographySection = ({ biography }) => {
  const { t } = useTranslation('profile');
  // No renderizar la sección si no hay biografía
  if (!biography || biography.trim() === '') return null;

  return (
    <section className="user-extern-section">
      <h2>{t('sections.biography')}</h2>
      <p className='user-extern-p'>{biography}</p>
    </section>
  );
};

export default UserBiographySection;
