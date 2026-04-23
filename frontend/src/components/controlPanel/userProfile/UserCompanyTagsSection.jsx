// UserCompanyTagsSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaTags } from 'react-icons/fa';

const UserCompanyTagsSection = ({ companyTags, offersPractices = false }) => {
  const { t } = useTranslation('profile');
  const hasContent = Array.isArray(companyTags) && companyTags.length > 0;

  return (
    <section className="user-extern-section">
      <h2>
        <FaTags className="user-extern-section-icon" style={{ marginRight: '8px' }} />
        {t('sections.specialization')}
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
        <p>{t('sections.emptySpecialization')}</p>
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
          <span>{t('sections.offersPractices')}</span>
        </div>
      )}
    </section>
  );
};

export default UserCompanyTagsSection;
