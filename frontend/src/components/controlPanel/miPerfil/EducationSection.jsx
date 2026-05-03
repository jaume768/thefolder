import React from 'react';
import { useTranslation } from 'react-i18next';
import '../css/professionalExperience.css';
import { clImg } from '../../../utils/optimizeImage';
import LogoWithFallback from '../userProfile/LogoWithFallback';

const EducationSection = ({ education }) => {
    const { t } = useTranslation('profile');
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
            endDate = new Date();
        } else if (edu.formationEndMonth && edu.formationEndYear) {
            endDate = new Date(edu.formationEndYear, edu.formationEndMonth - 1);
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
                            <h3 className="experience-title">{edu.formationName}</h3>
                            <p className="experience-company">{edu.institution || edu.otherInstitution}</p>
                            <p className="experience-location">{edu.location || ''}</p>
                            <p className="experience-period">
                                {formatDate(edu.formationStartMonth, edu.formationStartYear)}
                                {" - "}
                                {edu.currentlyEnrolled ? t('sections.current') : formatDate(edu.formationEndMonth, edu.formationEndYear)}
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
