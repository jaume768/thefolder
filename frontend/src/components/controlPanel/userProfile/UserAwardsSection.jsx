import React from 'react';
import '../css/professionalExperience.css';

const MONTHS = ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'];

const UserAwardsSection = ({ awards }) => {
  if (!awards || awards.length === 0) return null;

  const valid = awards.filter((a) => !a.isDraft && (a.name?.trim() || a.issuer?.trim()));
  if (valid.length === 0) return null;

  const formatDate = (month, year) => {
    if (!month && !year) return '';
    if (!month) return String(year);
    return `${MONTHS[(Number(month) || 1) - 1]} ${year}`;
  };

  const getTypeLabel = (item) => {
    if (!item.type) return '';
    if (item.type === 'Otro') return item.otherType || 'Otro';
    return item.type;
  };

  return (
    <section className="user-extern-section">
      <h2>Reconocimientos y premios</h2>

      <div className="experience-list">
        {valid.map((item, idx) => (
          <div key={idx} className="experience-item">
            <div className="experience-content">
              <h3 className="experience-title">{item.name}</h3>
              <p className="experience-company">{item.issuer}</p>
              {getTypeLabel(item) && (
                <p className="experience-location">{getTypeLabel(item)}</p>
              )}
              {(item.awardMonth || item.awardYear) && (
                <p className="experience-period">
                  {formatDate(item.awardMonth, item.awardYear)}
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
                  Ver referencia ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserAwardsSection;
