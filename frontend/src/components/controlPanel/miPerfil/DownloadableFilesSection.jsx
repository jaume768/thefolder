import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { printUserProfile } from './printProfile'; // Importamos la nueva función de impresión
import downloadPdfIcon from '../../../../public/iconos/download-pdf.svg';


const DownloadableFilesSection = ({ cvUrl, portfolioUrl }) => {
    const { t } = useTranslation('profile');
    const [profileData, setProfileData] = useState(null);
    
    // Cargar los datos del perfil para el componente de impresión
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const res = await axios.get(`${backendUrl}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                setProfileData(res.data);
            } catch (error) {
            }
        };
        
        fetchProfileData();
    }, []);
    
    // Función para generar las secciones del perfil imprimible con estilos en línea
    const generatePrintSections = (profile) => {
        let sections = '';
        
        // Sección de descripción (biografía)
        if (profile.biography) {
            sections += `
                <section style="margin-bottom: 25px;">
                    <h2 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 600;">${t('sections.description')}</h2>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">${profile.biography}</p>
                </section>
            `;
        }
        
        // Sección de experiencia profesional
        if (profile.professionalFormation && profile.professionalFormation.length > 0) {
            const validExperience = profile.professionalFormation.filter(exp => 
                exp.title?.trim() || exp.institution?.trim()
            );
            
            if (validExperience.length > 0) {
                sections += `
                    <section style="margin-bottom: 25px;">
                        <h2 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 600;">${t('sections.experience')}</h2>
                        ${validExperience.map(exp => `
                            <div style="display: flex; margin-bottom: 15px;">
                                <div style="margin-right: 15px; flex-shrink: 0;">
                                    ${exp.companyLogo ? 
                                        `<img src="${exp.companyLogo}" alt="${exp.institution || t('sections.company')}" style="width: 35px; height: 35px; border-radius: 4px; object-fit: cover;" />` : 
                                        `<div style="width: 35px; height: 35px; border-radius: 4px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                            ${exp.institution ? exp.institution.charAt(0).toUpperCase() : 'E'}
                                        </div>`
                                    }
                                </div>
                                <div style="flex: 1;">
                                    <h3 style="font-weight: 600; margin: 0 0 4px 0; color: #333; font-size: 16px;">${exp.title || ''}</h3>
                                    <p style="font-size: 14px; margin: 0 0 2px 0; color: #555;">${exp.institution || ''}</p>
                                    <p style="font-size: 14px; margin: 0 0 2px 0; color: #666;">${exp.location || ''}</p>
                                    <p style="font-size: 13px; color: #777; margin: 0 0 5px 0;">
                                        ${formatDateForPrint(exp.startMonth, exp.startYear)}
                                        - 
                                        ${exp.currentlyWorking ? t('sections.current') : formatDateForPrint(exp.endMonth, exp.endYear)}
                                        · 
                                        <span style="color: #666;">${calculateDuration(exp)}</span>
                                    </p>
                                    ${exp.description ? `<div style="font-size: 14px; line-height: 1.5; color: #555; margin-top: 5px;">${exp.description}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </section>
                `;
            }
        }
        
        // Sección de formación educativa
        if (profile.education && profile.education.length > 0) {
            const validEducation = profile.education.filter(edu => 
                edu.formationName?.trim() || edu.institution?.trim() || edu.otherInstitution?.trim()
            );
            
            if (validEducation.length > 0) {
                sections += `
                    <section style="margin-bottom: 25px;">
                        <h2 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 600;">${t('sections.education')}</h2>
                        ${validEducation.map(edu => `
                            <div style="display: flex; margin-bottom: 15px;">
                                <div style="margin-right: 15px; flex-shrink: 0;">
                                    ${edu.institutionLogo ? 
                                        `<img src="${edu.institutionLogo}" alt="${edu.institution || edu.otherInstitution || t('sections.institution')}" style="width: 35px; height: 35px; border-radius: 4px; object-fit: cover;" />` : 
                                        `<div style="width: 35px; height: 35px; border-radius: 4px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                            ${edu.institution ? edu.institution.charAt(0).toUpperCase() : 'I'}
                                        </div>`
                                    }
                                </div>
                                <div style="flex: 1;">
                                    <h3 style="font-weight: 600; margin: 0 0 4px 0; color: #333; font-size: 16px;">${edu.formationName || ''}</h3>
                                    <p style="font-size: 14px; margin: 0 0 2px 0; color: #555;">${edu.institution || edu.otherInstitution || ''}</p>
                                    <p style="font-size: 14px; margin: 0 0 2px 0; color: #666;">${edu.location || ''}</p>
                                    <p style="font-size: 13px; color: #777; margin: 0 0 5px 0;">
                                        ${formatDateForPrint(edu.formationStartMonth, edu.formationStartYear)}
                                        - 
                                        ${edu.currentlyEnrolled ? t('sections.current') : formatDateForPrint(edu.formationEndMonth, edu.formationEndYear)}
                                        · 
                                        <span style="color: #666;">${calculateEducationDuration(edu)}</span>
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </section>
                `;
            }
        }
        
        // Sección de habilidades
        if (profile.skills && profile.skills.length > 0) {
            sections += `
                <section style="margin-bottom: 25px;">
                    <h2 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 600;">${t('sections.skills')}</h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${profile.skills.map(skill => `<span style="display: inline-block; padding: 6px 12px; margin: 3px; border-radius: 20px; background-color: #f2f2f2; color: #444; font-size: 13px;">${skill}</span>`).join('')}
                    </div>
                </section>
            `;
        }
        
        // Sección de software
        if (profile.software && profile.software.length > 0) {
            sections += `
                <section style="margin-bottom: 25px;">
                    <h2 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 600;">${t('sections.software')}</h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${profile.software.map(sw => `<span style="display: inline-block; padding: 6px 12px; margin: 3px; border-radius: 20px; background-color: #f2f2f2; color: #444; font-size: 13px;">${sw}</span>`).join('')}
                    </div>
                </section>
            `;
        }
        
        // Sección de idiomas
        if (profile.languages && profile.languages.length > 0) {
            sections += `
                <section style="margin-bottom: 25px;">
                    <h2 style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 600;">${t('sections.languages')}</h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${profile.languages.map(lang => `<span style="display: inline-block; padding: 6px 12px; margin: 3px; border-radius: 20px; background-color: #f2f2f2; color: #444; font-size: 13px;">${lang}</span>`).join('')}
                    </div>
                </section>
            `;
        }
        
        return sections;
    };
    
    // Funciones auxiliares para formateo de fechas y cálculo de duración
    const formatDateForPrint = (month, year) => {
        if (!month || !year) return '';
        
        const months = [
            t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'), t('months.may'), t('months.jun'),
            t('months.jul'), t('months.aug'), t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec')
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
            return `${months} ${months === 1 ? t('duration.month') : t('duration.months')}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            
            if (remainingMonths === 0) {
                return `${years} ${years === 1 ? t('duration.year') : t('duration.years')}`;
            } else {
                return `${years} ${years === 1 ? t('duration.year') : t('duration.years')} ${remainingMonths} ${remainingMonths === 1 ? t('duration.month') : t('duration.months')}`;
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
            return `${months} ${months === 1 ? t('duration.month') : t('duration.months')}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            
            if (remainingMonths === 0) {
                return `${years} ${years === 1 ? t('duration.year') : t('duration.years')}`;
            } else {
                return `${years} ${years === 1 ? t('duration.year') : t('duration.years')} ${remainingMonths} ${remainingMonths === 1 ? t('duration.month') : t('duration.months')}`;
            }
        }
    };
    
    const handlePrintProfile = () => {
        // Usar nuestra nueva función de impresión que crea una ventana emergente
        printUserProfile(profileData);
    };
    
    // Mensaje de estado de carga del perfil
    const renderProfileStatus = () => {
        if (!profileData) {
            return <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>{t('sections.loadingPdfData')}</p>;
        }
        return <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>{t('sections.pdfDataReady')}</p>;
    };

    return (
        <section className="miPerfil-section">
            <h2>{t('sections.downloads')}</h2>
            {renderProfileStatus()} {/* Mostrar el estado de carga */}
            <div className="miPerfil-downloads">
                <div className="pdf-row">
                    <a 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            handlePrintProfile();
                        }}
                        className="pdf-button"
                        title={t('sections.printPdf')}
                        style={{position: 'relative'}}
                    >
                        {t('sections.viewPdf')}
                        <img src={downloadPdfIcon} alt="Download" className="pdf-icon" />
                    </a>
                </div>
                <div className="pdf-row second-row">
                    <a 
                        href={portfolioUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`pdf-button ${!portfolioUrl ? 'disabled' : ''}`}
                        onClick={e => !portfolioUrl && e.preventDefault()}
                    >
                        {t('sections.portfolioPdf')}
                        <img src={downloadPdfIcon} alt="Download" className="pdf-icon" />

                    </a>
                    
                    <a 
                        href={cvUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`pdf-button ${!cvUrl ? 'disabled' : ''}`}
                        onClick={e => !cvUrl && e.preventDefault()}
                    >
                        {t('sections.cvPdf')}
                        <img src={downloadPdfIcon} alt="Download" className="pdf-icon" />

                    </a>
                </div>
            </div>
        </section>
    );
};

export default DownloadableFilesSection;
