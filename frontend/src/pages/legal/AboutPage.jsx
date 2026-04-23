import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../components/controlPanel/css/About.css';

const About = () => {
    const { t } = useTranslation('legal');
    return (
        <div className="about-container">

            <div className="about-content">
                <div className="about-section">
                    <div className="about-text">
                        <h1>{t('about.title')}</h1>
                        <span dangerouslySetInnerHTML={{ __html: t('about.section1') }} />
                    </div>
                    <div className="about-image">
                        <img src="/multimedia/about-polas-ManelAbella-2.png" alt="Creativos trabajando" />
                    </div>
                </div>

                <div className="about-section">
                    <div className="about-text">
                        <span dangerouslySetInnerHTML={{ __html: t('about.section2') }} />
                    </div>
                    <div className="about-image">
                        <img src="/multimedia/about-polas-ManelAbella.png" alt="Diseño y moda" />
                    </div>
                </div>

                <div className="about-section">
                    <div className="about-text">
                        <strong>{t('about.howTitle')}</strong><br />
                        <span dangerouslySetInnerHTML={{ __html: t('about.howText') }} /><br /><br />
                        <strong>{t('about.whyTitle')}</strong><br />
                        <span dangerouslySetInnerHTML={{ __html: t('about.whyText') }} /><br /><br />
                        <strong>{t('about.contactTitle')}</strong><br />
                        <a href="mailto:thefolderworld@gmail.com" className="about-contact">thefolderworld@gmail.com</a>
                    </div>
                    <div className="about-image">
                        <img src="/multimedia/about-polas-ManelAbella-3.png" alt="Portafolio y trabajo" />
                    </div>
                </div>

                <p className="about-photo-autor" dangerouslySetInnerHTML={{ __html: t('about.photoCredit') }} />
            </div>
        </div>
    );
};

export default About;
