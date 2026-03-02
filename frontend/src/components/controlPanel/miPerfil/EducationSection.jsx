import React from 'react';
import '../css/professionalExperience.css';

const EducationSection = ({ education }) => {
    // No renderizar la sección si no hay educación o está vacía
    if (!education || education.length === 0) return null;
    
    // Filtrar para asegurarse que al menos hay un elemento con datos relevantes
    const validEducation = education.filter(edu => 
        edu.formationName?.trim() || edu.institution?.trim() || edu.otherInstitution?.trim()
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
        
        // Calcular diferencia en meses
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        
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
    
    // Función para formatear la fecha
    const formatDate = (month, year) => {
        if (!month || !year) return '';
        
        const months = [
            'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
            'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
        ];
        
        return `${months[month - 1]} ${year}`;
    };
    
    return (
        <section className="miPerfil-section">
            <h2>Formación educativa</h2>
            <div className="experience-list">
                {validEducation.map((edu, index) => (
                    <div key={index} className="experience-item">
                        <div className="experience-logo">
                            {edu.institutionLogo ? (
                                <img src={edu.institutionLogo} alt={edu.institution || edu.otherInstitution || 'Institución'} />
                            ) : (
                                <div className="experience-logo-placeholder">
                                    {edu.institution ? edu.institution.charAt(0).toUpperCase() : 'I'}
                                </div>
                            )}
                        </div>
                        <div className="experience-content">
                            <h3 className="experience-title">{edu.formationName}</h3>
                            <p className="experience-company">{edu.institution || edu.otherInstitution}</p>
                            <p className="experience-location">{edu.location || ''}</p>
                            <p className="experience-period">
                                {formatDate(edu.formationStartMonth, edu.formationStartYear)}
                                {" - "}
                                {edu.currentlyEnrolled ? "Actual" : formatDate(edu.formationEndMonth, edu.formationEndYear)}
                                {" · "}
                                <span className="experience-duration">{calculateDuration(edu)}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EducationSection;
