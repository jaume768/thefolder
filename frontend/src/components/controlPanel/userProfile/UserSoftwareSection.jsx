// UserSoftwareSection.jsx
import React from 'react';

const UserSoftwareSection = ({ software }) => {
  // No renderizar la sección si no hay software
  if (!software || software.length === 0) return null;

  return (
    <section className="user-extern-section">
      <h2>Software</h2>

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
