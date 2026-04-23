import React from 'react';
import { useTranslation } from 'react-i18next';
import '../css/professionalExperience.css';
import { clImg } from '../../../utils/optimizeImage';

const UserPressPublicationsSection = ({ pressPublications }) => {
  const { t } = useTranslation('profile');
  if (!pressPublications || pressPublications.length === 0) return null;

  const valid = pressPublications.filter(
    (p) => !p.isDraft && (p.title?.trim() || p.publication?.trim())
  );
  if (valid.length === 0) return null;

  const formatDate = (month, year) => {
    if (!month && !year) return '';
    if (!month) return String(year);
    const months = [
      t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'),
      t('months.may'), t('months.jun'), t('months.jul'), t('months.aug'),
      t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec'),
    ];
    return `${months[(Number(month) || 1) - 1]} ${year}`;
  };

  return (
    <section className="user-extern-section">
      <h2>{t('sections.press')}</h2>

      <div className="experience-list">
        {valid.map((item, idx) => (
          <div key={idx} className="experience-item">
            <div className="experience-logo">
              {item.logoUrl ? (
                <img src={clImg.logo(item.logoUrl)} alt={item.publication || t('sections.medium')} />
              ) : (
                <div className="experience-logo-placeholder">
                  {(item.publication || t('sections.medium')).trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="experience-content">
              <h3 className="experience-title">{item.title}</h3>
              <p className="experience-company">{item.publication}</p>
              {item.role && (
                <p className="experience-location">{item.role}</p>
              )}
              {(item.pubMonth || item.pubYear) && (
                <p className="experience-period">
                  {formatDate(item.pubMonth, item.pubYear)}
                </p>
              )}
              {item.description && (
                <p className="experience-description">{item.description}</p>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ux-exp-link"
                >
                  {t('sections.viewPublication')}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserPressPublicationsSection;
