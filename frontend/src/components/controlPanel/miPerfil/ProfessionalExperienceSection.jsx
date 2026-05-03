import React from 'react';
import { useTranslation } from 'react-i18next';
import '../css/professionalExperience.css';
import { clImg } from '../../../utils/optimizeImage';
import LogoWithFallback from '../userProfile/LogoWithFallback';

const ProfessionalExperienceSection = ({ professionalFormation }) => {
    const { t } = useTranslation('profile');
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
            endDate = new Date();
        } else if (exp.endMonth && exp.endYear) {
            endDate = new Date(exp.endYear, exp.endMonth - 1);
        } else {
            return '';
        }
        
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                       (endDate.getMonth() - startDate.getMonth()) + 1;
        
        if (months < 12) {
            return `${months} ${t(months === 1 ? 'duration.month' : 'duration.months')}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            
            if (remainingMonths === 0) {
                return `${years} ${t(years === 1 ? 'duration.year' : 'duration.years')}`;
            } else {
                return `${years} ${t(years === 1 ? 'duration.year' : 'duration.years')} ${remainingMonths} ${t(remainingMonths === 1 ? 'duration.month' : 'duration.months')}`;
            }
        }
    };
    
    // Función para formatear la fecha
    const formatDate = (month, year) => {
        if (!month || !year) return '';
        const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        return `${t(`months.${monthKeys[month - 1]}`)} ${year}`;
    };
    
    return (
        <section className="miPerfil-section">
            <h2>{t('sections.experience')}</h2>
            <div className="experience-list">
                {validExperience.map((exp, index) => (
                    <div key={index} className="experience-item">
                        <LogoWithFallback
                            src={clImg.logo(exp.companyLogo)}
                            name={exp.institution || t('sections.company')}
                            alt={exp.institution || t('sections.company')}
                        />
                        <div className="experience-content">
                            <h3 className="experience-title">{exp.title}</h3>
                            <p className="experience-company">{exp.institution}</p>
                            <p className="experience-location">{exp.location || ''}</p>
                            <p className="experience-period">
                                {formatDate(exp.startMonth, exp.startYear)}
                                {" - "}
                                {exp.currentlyWorking ? t('sections.current') : formatDate(exp.endMonth, exp.endYear)}
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
