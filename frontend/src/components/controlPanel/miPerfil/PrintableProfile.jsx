import React from 'react';
import '../css/printProfile.css';
import { clImg } from '../../../utils/optimizeImage';

// Componente especial que solo se muestra durante la impresión
const PrintableProfile = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="printable-profile">
      {/* Perfil básico */}
      <div className="print-profile-header">
        <div className="print-profile-photo">
          <img
            src={clImg.avatar(profile?.profile?.profilePicture) || "/multimedia/usuarioDefault.jpg"}
            alt={profile?.fullName || "Usuario"}
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
            <h2>Descripción</h2>
            <p>{profile.biography}</p>
          </section>
        )}
        
        {/* Experiencia profesional */}
        {profile.professionalFormation && profile.professionalFormation.length > 0 && (
          <section className="print-section">
            <h2>Experiencia profesional</h2>
            {profile.professionalFormation.map((exp, index) => (
              <div key={index} className="print-experience-item">
                <div className="print-experience-logo">
                  {exp.companyLogo ? (
                    <img src={clImg.logo(exp.companyLogo)} alt={exp.institution || 'Empresa'} />
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
                    {exp.currentlyWorking ? "Actual" : formatDateForPrint(exp.endMonth, exp.endYear)}
                    {" · "}
                    <span className="print-experience-duration">{calculateDuration(exp)}</span>
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
            <h2>Formación educativa</h2>
            {profile.education.map((edu, index) => (
              <div key={index} className="print-experience-item">
                <div className="print-experience-logo">
                  {edu.institutionLogo ? (
                    <img src={clImg.logo(edu.institutionLogo)} alt={edu.institution || edu.otherInstitution || 'Institución'} />
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
                    {edu.currentlyEnrolled ? "Actual" : formatDateForPrint(edu.formationEndMonth, edu.formationEndYear)}
                    {" · "}
                    <span className="print-experience-duration">{calculateEducationDuration(edu)}</span>
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
        
        {/* Habilidades */}
        {profile.skills && profile.skills.length > 0 && (
          <section className="print-section">
            <h2>Habilidades</h2>
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
            <h2>Software</h2>
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
            <h2>Idiomas</h2>
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

// Funciones auxiliares
const formatDateForPrint = (month, year) => {
  if (!month || !year) return '';
  
  const months = [
    'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
    'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
  ];
  
  return `${months[month - 1]} ${year}`;
};

const calculateDuration = (exp) => {
  if (!exp.startMonth || !exp.startYear) return '';
  
  const startDate = new Date(exp.startYear, exp.startMonth - 1);
  let endDate;
  
  if (exp.currentlyWorking) {
    endDate = new Date();
  } else if (exp.endMonth && exp.endYear) {
    endDate = new Date(exp.endYear, exp.endMonth - 1);
  } else {
    return '';
  }
  
  // Calcular diferencia en meses
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth()) + 1;
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      return `${years} ${years === 1 ? 'año' : 'años'} ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
  }
};

const calculateEducationDuration = (edu) => {
  if (!edu.formationStartMonth || !edu.formationStartYear) return '';
  
  const startDate = new Date(edu.formationStartYear, edu.formationStartMonth - 1);
  let endDate;
  
  if (edu.currentlyEnrolled) {
    endDate = new Date();
  } else if (edu.formationEndMonth && edu.formationEndYear) {
    endDate = new Date(edu.formationEndYear, edu.formationEndMonth - 1);
  } else {
    return '';
  }
  
  // Calcular diferencia en meses
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth()) + 1;
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      return `${years} ${years === 1 ? 'año' : 'años'} ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
  }
};

export default PrintableProfile;
