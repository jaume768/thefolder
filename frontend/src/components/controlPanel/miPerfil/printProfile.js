/**
 * Función para generar e imprimir un PDF del perfil de usuario
 * Esta función usa un iframe oculto para imprimir directamente sin mostrar una ventana previa
 */

export const printUserProfile = (profileData) => {
  if (!profileData) {
    alert('No se pudieron cargar los datos del perfil. Por favor, intenta nuevamente.');
    return;
  }

  // Buscar si ya existe un iframe para impresión y eliminarlo
  const existingIframe = document.getElementById('print-profile-iframe');
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }
  
  // Crear un iframe oculto para la impresión
  const printIframe = document.createElement('iframe');
  printIframe.id = 'print-profile-iframe';
  printIframe.style.position = 'fixed';
  printIframe.style.left = '-9999px'; // Fuera de la vista
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  document.body.appendChild(printIframe);

  // Función para formatear la fecha
  const formatDate = (month, year) => {
    if (!month || !year) return '';
    
    const months = [
      'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
      'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
    ];
    
    return `${months[month - 1]} ${year}`;
  };

  // Función para calcular la duración de una experiencia
  const calculateDuration = (startMonth, startYear, endMonth, endYear, current) => {
    if (!startMonth || !startYear) return '';
    
    const startDate = new Date(startYear, startMonth - 1);
    let endDate;
    
    if (current) {
      endDate = new Date();
    } else if (endMonth && endYear) {
      endDate = new Date(endYear, endMonth - 1);
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

  // Generar secciones del perfil
  const generateExperienceSection = () => {
    if (!profileData.professionalFormation || profileData.professionalFormation.length === 0) {
      return '';
    }

    const validExperience = profileData.professionalFormation.filter(exp => 
      exp.title?.trim() || exp.institution?.trim()
    );

    if (validExperience.length === 0) {
      return '';
    }

    return `
      <section class="profile-section">
        <h2>Experiencia profesional</h2>
        ${validExperience.map(exp => `
          <div class="experience-item">
            <div class="logo-container">
              ${exp.companyLogo 
                ? `<img src="${exp.companyLogo}" alt="${exp.institution || 'Empresa'}" class="logo" />` 
                : `<div class="logo-placeholder">${exp.institution ? exp.institution.charAt(0).toUpperCase() : 'E'}</div>`
              }
            </div>
            <div class="content">
              <h3>${exp.title || ''}</h3>
              <p class="company">${exp.institution || ''}</p>
              <p class="location">${exp.location || ''}</p>
              <p class="period">
                ${formatDate(exp.startMonth, exp.startYear)}
                - 
                ${exp.currentlyWorking ? "Actual" : formatDate(exp.endMonth, exp.endYear)}
                · 
                <span class="duration">${calculateDuration(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.currentlyWorking)}</span>
              </p>
              ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </section>
    `;
  };

  const generateEducationSection = () => {
    if (!profileData.education || profileData.education.length === 0) {
      return '';
    }

    const validEducation = profileData.education.filter(edu => 
      edu.formationName?.trim() || edu.institution?.trim() || edu.otherInstitution?.trim()
    );

    if (validEducation.length === 0) {
      return '';
    }

    return `
      <section class="profile-section">
        <h2>Formación educativa</h2>
        ${validEducation.map(edu => `
          <div class="experience-item">
            <div class="logo-container">
              ${edu.institutionLogo 
                ? `<img src="${edu.institutionLogo}" alt="${edu.institution || edu.otherInstitution || 'Institución'}" class="logo" />` 
                : `<div class="logo-placeholder">${edu.institution ? edu.institution.charAt(0).toUpperCase() : 'I'}</div>`
              }
            </div>
            <div class="content">
              <h3>${edu.formationName || ''}</h3>
              <p class="company">${edu.institution || edu.otherInstitution || ''}</p>
              <p class="location">${edu.location || ''}</p>
              <p class="period">
                ${formatDate(edu.formationStartMonth, edu.formationStartYear)}
                - 
                ${edu.currentlyEnrolled ? "Actual" : formatDate(edu.formationEndMonth, edu.formationEndYear)}
                · 
                <span class="duration">${calculateDuration(edu.formationStartMonth, edu.formationStartYear, edu.formationEndMonth, edu.formationEndYear, edu.currentlyEnrolled)}</span>
              </p>
            </div>
          </div>
        `).join('')}
      </section>
    `;
  };

  const generateSkillsSection = () => {
    if (!profileData.skills || profileData.skills.length === 0) {
      return '';
    }

    return `
      <section class="profile-section">
        <h2>Habilidades</h2>
        <div class="tags-container">
          ${profileData.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
        </div>
      </section>
    `;
  };

  const generateSoftwareSection = () => {
    if (!profileData.software || profileData.software.length === 0) {
      return '';
    }

    return `
      <section class="profile-section">
        <h2>Software</h2>
        <div class="tags-container">
          ${profileData.software.map(sw => `<span class="tag">${sw}</span>`).join('')}
        </div>
      </section>
    `;
  };

  const generateLanguagesSection = () => {
    if (!profileData.languages || profileData.languages.length === 0) {
      return '';
    }

    return `
      <section class="profile-section">
        <h2>Idiomas</h2>
        <div class="tags-container">
          ${profileData.languages.map(lang => `<span class="tag">${lang}</span>`).join('')}
        </div>
      </section>
    `;
  };

  const generateBiographySection = () => {
    if (!profileData.biography) {
      return '';
    }

    return `
      <section class="profile-section">
        <h2>Descripción</h2>
        <p>${profileData.biography}</p>
      </section>
    `;
  };

  // Construir el contenido HTML completo de la ventana de impresión
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Perfil Profesional - The Folder World</title>
      <style>
        body {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.5;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        .tab {
          padding: 8px 20px;
          margin: 0 5px;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          background-color: #fff;
          color: #333;
          font-size: 14px;
        }
        .tab.active {
          background-color: #f8f8f8;
          font-weight: bold;
          color: #000;
        }
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
          text-align: center;
        }
        .profile-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 15px;
        }
        .profile-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-name {
          font-size: 26px;
          font-weight: bold;
          margin: 0 0 5px 0;
          color: #333;
        }
        .profile-username {
          font-size: 16px;
          color: #666;
          margin: 0 0 10px 0;
        }
        .profile-location, .profile-bio {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .profile-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: 10px 0;
        }
        .profile-tag {
          display: inline-block;
          padding: 6px 12px;
          margin: 3px;
          border-radius: 20px;
          background-color: #f2f2f2;
          color: #444;
          font-size: 13px;
        }
        .profile-section {
          margin-bottom: 25px;
        }
        .profile-section h2 {
          font-size: 18px;
          color: #333;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .experience-item {
          display: flex;
          margin-bottom: 15px;
        }
        .logo-container {
          margin-right: 15px;
          flex-shrink: 0;
        }
        .logo, .logo-placeholder {
          width: 35px;
          height: 35px;
          border-radius: 4px;
          object-fit: cover;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .logo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .content {
          flex: 1;
        }
        .content h3 {
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #333;
          font-size: 16px;
        }
        .company {
          font-size: 14px;
          margin: 0 0 2px 0;
          color: #555;
        }
        .location {
          font-size: 14px;
          margin: 0 0 2px 0;
          color: #666;
        }
        .period {
          font-size: 13px;
          color: #777;
          margin: 0 0 5px 0;
        }
        .duration {
          color: #666;
        }
        .description {
          font-size: 14px;
          line-height: 1.5;
          color: #555;
          margin-top: 5px;
        }
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag {
          display: inline-block;
          padding: 6px 12px;
          margin: 3px;
          border-radius: 20px;
          background-color: #f2f2f2;
          color: #444;
          font-size: 13px;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="profile-header">
        <div class="profile-photo">
          <img src="${profileData?.profile?.profilePicture || '/multimedia/usuarioDefault.jpg'}" alt="${profileData?.fullName || 'Usuario'}" />
        </div>
        <h1 class="profile-name">${profileData.companyName || profileData.fullName}</h1>
        
        ${(profileData.city || profileData.country) ? `
          <p class="profile-location">
            ${profileData.city && profileData.country ? `${profileData.city}, ${profileData.country}` : profileData.city || profileData.country}
          </p>
        ` : ''}
      </div>
      
      <div class="profile-content">
        ${generateBiographySection()}
        ${generateExperienceSection()}
        ${generateEducationSection()}
        ${generateSkillsSection()}
        ${generateSoftwareSection()}
        ${generateLanguagesSection()}
      </div>
      
      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print(); return false;" style="padding: 10px 20px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Imprimir perfil
        </button>
      </div>
    </body>
    </html>
  `;

  // Generar diferente contenido según tipo de perfil (empresa/institución o perfil individual)
  const isCompany = profileData.professionalType === 1 || profileData.professionalType === 2 || profileData.professionalType === 4;

  // Escribir el contenido HTML en el iframe
  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();
  
  // Para documentar: solo queremos imprimir una vez, por lo que usamos una variable global
  // para rastrear si ya se ha iniciado la impresión
  if (window._hasPrintStarted) {
    console.log('Ya hay una impresión en curso, cancelando...');
    return;
  }
  
  // Establecer bandera global
  window._hasPrintStarted = true;
  
  // Programar reseteo de la bandera después de un tiempo prudencial
  setTimeout(() => {
    window._hasPrintStarted = false;
  }, 5000); // 5 segundos debería ser suficiente
  
  // Función para imprimir que solo se ejecutará una vez
  const printDocument = () => {
    try {
      // Enfocamos y ejecutamos la impresión
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
      
      // Limpieza del iframe
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2000);
    } catch (error) {
      console.error('Error al imprimir:', error);
      window._hasPrintStarted = false; // Resetear en caso de error
      alert('Hubo un problema al intentar imprimir. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Ejecutar la impresión directamente, sin esperar eventos o timeouts adicionales
  // Este enfoque más directo evita llamadas múltiples a la impresión
  printDocument();
};
