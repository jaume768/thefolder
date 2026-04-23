// UserDownloadableFilesSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { printUserProfile } from '../miPerfil/printProfile';
import downloadPdfIcon from '../../../../public/iconos/download-pdf.svg';

const UserDownloadableFilesSection = ({ cvUrl, portfolioUrl, userId, username }) => {
  const { t } = useTranslation('profile');
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cargar los datos del perfil solo cuando se necesiten para imprimir
    if (userId) {
      const fetchProfileData = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem('authToken');
          if (!token) {
            setIsLoading(false);
            return;
          }

          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          const headers = { Authorization: `Bearer ${token}` };

          const res = await axios.get(`${backendUrl}/api/users/profile/${username}`, { headers });
          setProfileData(res.data);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      };

      fetchProfileData();
    }
  }, [userId, username]);

  const handlePrintProfile = () => {
    if (!profileData) {
      alert(t('sections.loadingProfileData'));
      return;
    }
    // Usar la misma función de impresión que se usa en MiPerfil
    printUserProfile(profileData);
  };

  return (
    <section className="user-extern-section">
      <h2>{t('sections.downloads')}</h2>

      <div className="user-extern-downloads">
        <div className="pdf-row">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePrintProfile();
            }}
            className="pdf-button"
          >
            {t('sections.viewPdf')}
            <img src={downloadPdfIcon} alt="Download" className="pdf-icon" />
          </a>
        </div>

        <div className="pdf-row second-row">
          <a
            href={portfolioUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`pdf-button ${!portfolioUrl ? 'disabled' : ''}`}
            onClick={(e) => !portfolioUrl && e.preventDefault()}
          >
            Portfolio PDF
            <img src={downloadPdfIcon} alt="Download" className="pdf-icon" />
          </a>

          <a
            href={cvUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`pdf-button ${!cvUrl ? 'disabled' : ''}`}
            onClick={(e) => !cvUrl && e.preventDefault()}
          >
            CV PDF
            <img src={downloadPdfIcon} alt="Download" className="pdf-icon" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default UserDownloadableFilesSection;
