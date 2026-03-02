// UserBiographySection.jsx
import React from 'react';

const UserBiographySection = ({ biography }) => {
  // No renderizar la sección si no hay biografía
  if (!biography || biography.trim() === '') return null;

  return (
    <section className="user-extern-section">
      <h2>Bio</h2>
      <p className='user-extern-p'>{biography}</p>
    </section>
  );
};

export default UserBiographySection;
