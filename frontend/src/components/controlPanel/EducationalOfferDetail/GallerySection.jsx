import React from 'react';
import { useTranslation } from 'react-i18next';

const GallerySection = ({ 
    gallery, 
    galleryIndex, 
    setGalleryIndex, 
    handlePrevImage, 
    handleNextImage, 
    programName 
}) => {
    const { t } = useTranslation('offers');
    return (
        <section className="job-section-jobdetail">
            <h3 className="section-title-jobdetail">{t('view.gallery')}</h3>
            <div className="educational-offer-gallery-jobdetail">
                <div className="gallery-navigation-jobdetail">
                    <button onClick={handlePrevImage} className="gallery-nav-button-jobdetail">
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div className="gallery-image-container-jobdetail">
                        <img 
                            src={gallery[galleryIndex]} 
                            alt={t('view.imageAlt', { index: galleryIndex + 1, programName })} 
                        />
                    </div>
                    <button onClick={handleNextImage} className="gallery-nav-button-jobdetail">
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div className="gallery-indicators-jobdetail">
                    {gallery.map((_, index) => (
                        <span 
                            key={index} 
                            className={`gallery-indicator-jobdetail ${index === galleryIndex ? 'active' : ''}`}
                            onClick={() => setGalleryIndex(index)}
                        ></span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GallerySection;
