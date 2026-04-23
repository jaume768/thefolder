import React from 'react';
import { useTranslation } from 'react-i18next';
import '../css/printProfile.css';
import { clImg } from '../../../utils/optimizeImage';

// Componente especial que solo se muestra durante la impresión
const PrintableProfile = ({ profile }) => {
  const { t } = useTranslation('profile');
  if (!profile) return null;

  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  const formatDateForPrint = (month, year) => {
    if (!month || !year) return '';
    return `${t(`months.${monthKeys[month - 1]}`)} ${year}`;
  };

  const calcDuration = (startMonth, startYear, endMonth, endYear, isCurrent) => {
    if (!startMonth || !startYear) return '';
    const startDate = new Date(startYear, startMonth - 1);
    let endDate;
    if (isCurrent) {
      endDate = new Date();
    } else if (endMonth && endYear) {
      endDate = new Date(endYear, endMonth - 1);
    } else {
      return '';
    }
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth()) + 1;
    if (months < 12) {
      return `${months} ${t(months === 1 ? 'duration.month' : 'duration.months')}`;
    } else {
      const years = Math.floor(months / 12);
      const rem = months % 12;
      if (rem === 0) return `${years} ${t(years === 1 ? 'duration.year' : 'duration.years')}`;
      return `${years} ${t(years === 1 ? 'duration.year' : 'duration.years')} ${rem} ${t(rem === 1 ? 'duration.month' : 'duration.months')}`;
    }
  };

  return (
    <div className="printable-profile">
      {/* Perfil básico */}
      <div className="print-profile-header">
        <div className="print-profile-photo">
          <img
            src={clImg.avatar(profile?.profile?.profilePicture) || "/multimedia/usuarioDefault.jpg"}
            alt={profile?.fullName || profile?.companyName || ''}
          />
        </div>
        <h1 className="print-profile-name">
          {profile.companyName || profile.fullName}
        </h1>
        
        {(profile.city || profile.country) && (
          <p className="print-profile-location">
            {profile.city && profile.country
              ? `${profile.city}, ${profile.country}`
              : profile.city || profile.country}
          </p>
        )}
        
      </div>

      {/* Secciones de perfil */}
      <div className="print-profile-sections">
        {/* Descripción */}
        {profile.biography && (
          <section className="print-section">
            <h2>{t('sections.description')}</h2>
            <p>{profile.biography}</p>
          </section>
        )}
        
        {/* Experiencia profesional */}
        {profile.professionalFormation && profile.professionalFormation.length > 0 && (
          <section className="print-section">
            <h2>{t('sections.experience')}</h2>
            {profile.professionalFormation.map((exp, index) => (
              <div key={index} className="print-experience-item">
                <div className="print-experience-logo">
                  {exp.companyLogo ? (
                    <img src={clImg.logo(exp.companyLogo)} alt={exp.institution || t('sections.company')} />
                  ) : (
                    <div className="print-logo-placeholder">
                      {exp.institution ? exp.institution.charAt(0).toUpperCase() : 'E'}
                    </div>
                  )}
                </div>
                <div className="print-experience-content">
                  <h3 className="print-experience-title">{exp.title}</h3>
                  <p className="print-experience-company">{exp.institution}</p>
                  <p className="print-experience-location">{exp.location || ''}</p>
                  <p className="print-experience-period">
                    {formatDateForPrint(exp.startMonth, exp.startYear)}
                    {" - "}
                    {exp.currentlyWorking ? t('sections.current') : formatDateForPrint(exp.endMonth, exp.endYear)}
                    {" · "}
                    <span className="print-experience-duration">{calcDuration(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.currentlyWorking)}</span>
                  </p>
                  {exp.description && (
                    <div className="print-experience-description">{exp.description}</div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
        
        {/* Formación educativa */}
        {profile.education && profile.education.length > 0 && (
          <section className="print-section">
            <h2>{t('sections.education')}</h2>
            {profile.education.map((edu, index) => (
              <div key={index} className="print-experience-item">
                <div className="print-experience-logo">
                  {edu.institutionLogo ? (
                    <img src={clImg.logo(edu.institutionLogo)} alt={edu.institution || edu.otherInstitution || t('sections.institution')} />
                  ) : (
                    <div className="print-logo-placeholder">
                      {edu.institution ? edu.institution.charAt(0).toUpperCase() : 'I'}
                    </div>
                  )}
                </div>
                <div className="print-experience-content">
                  <h3 className="print-experience-title">{edu.formationName}</h3>
                  <p className="print-experience-company">{edu.institution || edu.otherInstitution}</p>
                  <p className="print-experience-location">{edu.location || ''}</p>
                  <p className="print-experience-period">
                    {formatDateForPrint(edu.formationStartMonth, edu.formationStartYear)}
                    {" - "}
                    {edu.currentlyEnrolled ? t('sections.current') : formatDateForPrint(edu.formationEndMonth, edu.formationEndYear)}
                    {" · "}
                    <span className="print-experience-duration">{calcDuration(edu.formationStartMonth, edu.formationStartYear, edu.formationEndMonth, edu.formationEndYear, edu.currentlyEnrolled)}</span>
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
        
        {/* Habilidades */}
        {profile.skills && profile.skills.length > 0 && (
          <section className="print-section">
            <h2>{t('sections.skills')}</h2>
            <div className="print-tags-container">
              {profile.skills.map((skill, index) => (
                <span key={index} className="print-tag">{skill}</span>
              ))}
            </div>
          </section>
        )}
        
        {/* Software */}
        {profile.software && profile.software.length > 0 && (
          <section className="print-section">
            <h2>{t('sections.software')}</h2>
            <div className="print-tags-container">
              {profile.software.map((sw, index) => (
                <span key={index} className="print-tag">{sw}</span>
              ))}
            </div>
          </section>
        )}
        
        {/* Idiomas */}
        {profile.languages && profile.languages.length > 0 && (
          <section className="print-section">
            <h2>{t('sections.languages')}</h2>
            <div className="print-tags-container">
              {profile.languages.map((lang, index) => (
                <span key={index} className="print-tag">{lang}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PrintableProfile;
