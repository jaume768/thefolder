import React from 'react';
import '../css/professionalExperience.css';

const ProfessionalExperienceSection = ({ professionalFormation }) => {
    // No renderizar la sección si no hay experiencia profesional o está vacía
    if (!professionalFormation || professionalFormation.length === 0) return null;
    
    // Filtrar para asegurarse que al menos hay un elemento con datos relevantes
    const validExperience = professionalFormation.filter(exp => 
        exp.title?.trim() || exp.institution?.trim()
    );
    
    if (validExperience.length === 0) return null;
    
    // Función para calcular duración en meses
    const calculateDuration = (exp) => {
        if (!exp.startMonth || !exp.startYear) return '';
        
        const startDate = new Date(exp.startYear, exp.startMonth - 1);
        let endDate;
        
        if (exp.currentlyWorking) {
            endDate = new Date(); // Fecha actual
        } else if (exp.endMonth && exp.endYear) {
            endDate = new Date(exp.endYear, exp.endMonth - 1);
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
            <h2>Experiencia profesional</h2>
            <div className="experience-list">
                {validExperience.map((exp, index) => (
                    <div key={index} className="experience-item">
                        <div className="experience-logo">
                            {exp.companyLogo ? (
                                <img src={exp.companyLogo} alt={exp.institution || 'Empresa'} />
                            ) : (
                                <div className="experience-logo-placeholder">
                                    {exp.institution ? exp.institution.charAt(0).toUpperCase() : 'E'}
                                </div>
                            )}
                        </div>
                        <div className="experience-content">
                            <h3 className="experience-title">{exp.title}</h3>
                            <p className="experience-company">{exp.institution}</p>
                            <p className="experience-location">{exp.location || ''}</p>
                            <p className="experience-period">
                                {formatDate(exp.startMonth, exp.startYear)}
                                {" - "}
                                {exp.currentlyWorking ? "Actual" : formatDate(exp.endMonth, exp.endYear)}
                                {" · "}
                                <span className="experience-duration">{calculateDuration(exp)}</span>
                            </p>
                            {exp.description && (
                                <div className="experience-description">{exp.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProfessionalExperienceSection;
