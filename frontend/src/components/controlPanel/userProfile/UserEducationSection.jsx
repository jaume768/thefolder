// UserEducationSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import '../css/professionalExperience.css';
import { clImg } from '../../../utils/optimizeImage';
import LogoWithFallback from './LogoWithFallback';

const UserEducationSection = ({ education }) => {
  const { t } = useTranslation('profile');
  // No renderizar la sección si no hay educación o está vacía
  if (!education || education.length === 0) return null;

  // Filtrar para asegurarse que al menos hay un elemento con datos relevantes
  const validEducation = education.filter(
    (edu) =>
      !edu.isDraft && (edu.formationName?.trim() || edu.institution?.trim() || edu.otherInstitution?.trim())
  );
  if (validEducation.length === 0) return null;

  // Función para calcular duración en meses
  const calculateDuration = (edu) => {
    if (!edu.formationStartMonth || !edu.formationStartYear) return '';

    const startDate = new Date(edu.formationStartYear, edu.formationStartMonth - 1);
    let endDate;

    if (edu.currentlyEnrolled) {
      endDate = new Date(); // Fecha actual
    } else if (edu.formationEndMonth && edu.formationEndYear) {
      endDate = new Date(edu.formationEndYear, edu.formationEndMonth - 1);
    } else {
      return '';
    }

    // Calcular diferencia en meses (+1: el mes de inicio ya cuenta como 1 mes)
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) + 1;

    if (months < 12) {
      return `${months} ${months === 1 ? t('duration.month') : t('duration.months')}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? t('duration.year') : t('duration.years')}`;
      } else {
        return `${years} ${years === 1 ? t('duration.year') : t('duration.years')} ${remainingMonths} ${
          remainingMonths === 1 ? t('duration.month') : t('duration.months')
        }`;
      }
    }
  };

  // Función para formatear la fecha
  const formatDate = (month, year) => {
    if (!month || !year) return '';

    const months = [
      t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'),
      t('months.may'), t('months.jun'), t('months.jul'), t('months.aug'),
      t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec'),
    ];

    return `${months[month - 1]} ${year}`;
  };

  return (
    <section className="user-extern-section">
      <h2>{t('sections.education')}</h2>

      <div className="experience-list">
        {validEducation.map((edu, index) => (
          <div key={index} className="experience-item">
            <LogoWithFallback
              src={clImg.logo(edu.institutionLogo)}
              name={edu.institution || edu.otherInstitution || t('sections.institution')}
              alt={edu.institution || edu.otherInstitution || t('sections.institution')}
            />

            <div className="experience-content">
              {edu.educationType && (
                <p className="experience-company" style={{ color: '#555' }}>
                  {edu.educationType === 'OTRO'
                    ? edu.educationOtherType
                    : edu.educationType === 'FP'
                    ? t('sections.vocationalTraining')
                    : edu.educationType}
                  {edu.educationHours ? ` · ${edu.educationHours}` : ''}
                </p>
              )}
              <h3 className="experience-title">{edu.formationName}</h3>
              <p className="experience-company">{edu.institution || edu.otherInstitution}</p>
              <p className="experience-location">{edu.location || ''}</p>

              <p className="experience-period">
                {formatDate(edu.formationStartMonth, edu.formationStartYear)}
                {' - '}
                {edu.currentlyEnrolled
                  ? t('sections.current')
                  : formatDate(edu.formationEndMonth, edu.formationEndYear)}
                {' · '}
                <span className="experience-duration">{calculateDuration(edu)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserEducationSection;
