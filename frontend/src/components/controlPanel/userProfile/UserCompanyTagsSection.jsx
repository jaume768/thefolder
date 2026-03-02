// UserCompanyTagsSection.jsx
import React from 'react';
import { FaTags } from 'react-icons/fa';

const UserCompanyTagsSection = ({ companyTags, offersPractices = false }) => {
  const hasContent = Array.isArray(companyTags) && companyTags.length > 0;

  return (
    <section className="user-extern-section">
      <h2>
        <FaTags className="user-extern-section-icon" style={{ marginRight: '8px' }} />
        Especialización
      </h2>

      {hasContent ? (
        <div className="user-extern-skills-tags">
          {companyTags.map((tag, index) => (
            <span key={index} className="user-extern-skill-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p>No hay etiquetas de especialización registradas.</p>
      )}

      {offersPractices && (
        <div
          className="user-extern-practice-badge"
          style={{
            marginTop: '15px',
            padding: '8px 12px',
            background: '#f0f8ff',
            borderRadius: '6px',
            display: 'inline-block',
          }}
        >
          <span>Ofrece prácticas profesionales</span>
        </div>
      )}
    </section>
  );
};

export default UserCompanyTagsSection;
