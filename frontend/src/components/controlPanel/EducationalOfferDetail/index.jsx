import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderSection from './HeaderSection';
import MainInfoSection from './MainInfoSection';
import DescriptionSection from './DescriptionSection';
import GallerySection from './GallerySection';
import AdditionalInfoSection from './AdditionalInfoSection';
import { formatDate, formatPrice, formatDuration } from './utils';
import '../css/jobOfferDetail.css';

const EducationalOfferDetail = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [galleryIndex, setGalleryIndex] = useState(0);

    useEffect(() => {
        const fetchOfferDetails = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${backendUrl}/api/offers/educational/${offerId}`);
                setOffer(response.data.offer);
            } catch (error) {
                setError('No se pudo cargar la información de la oferta educativa');
            } finally {
                setLoading(false);
            }
        };

        if (offerId) {
            fetchOfferDetails();
        }
    }, [offerId]);

    if (loading) {
        return (
            <div className="job-offer-loading-jobdetail">
                <i className="fas fa-spinner fa-spin"></i>
                <span className="loading-indicator">Cargando detalles de la oferta educativa...</span>
            </div>
        );
    }

    if (error || !offer) {
        return <div className="job-offer-error-jobdetail">{error || 'No se encontró la oferta educativa'}</div>;
    }

    const handleBack = () => {
        navigate(-1);
    };

    const handleNextImage = () => {
        if (offer.gallery && offer.gallery.length > 0) {
            setGalleryIndex((prevIndex) => (prevIndex + 1) % offer.gallery.length);
        }
    };

    const handlePrevImage = () => {
        if (offer.gallery && offer.gallery.length > 0) {
            setGalleryIndex((prevIndex) => (prevIndex - 1 + offer.gallery.length) % offer.gallery.length);
        }
    };

    return (
        <div className="job-offer-detail-container-jobdetail">
            <button onClick={handleBack} className="back-button-jobdetail">
                <i className="fas fa-arrow-left"></i> Volver
            </button>
            
            <HeaderSection 
                banner={offer.banner} 
                programName={offer.programName} 
                studyType={offer.studyType} 
            />

            <MainInfoSection 
                offer={offer} 
                formatDuration={formatDuration} 
                formatDate={formatDate} 
            />

            <div className="job-offer-content-jobdetail">
                <DescriptionSection description={offer.description} />

                {offer.requirements && (
                    <DescriptionSection 
                        title="Requisitos" 
                        content={offer.requirements} 
                    />
                )}

                {offer.syllabus && (
                    <DescriptionSection 
                        title="Plan de estudios" 
                        content={offer.syllabus} 
                    />
                )}

                {offer.gallery && offer.gallery.length > 0 && (
                    <GallerySection 
                        gallery={offer.gallery} 
                        galleryIndex={galleryIndex} 
                        setGalleryIndex={setGalleryIndex} 
                        handlePrevImage={handlePrevImage} 
                        handleNextImage={handleNextImage} 
                        programName={offer.programName} 
                    />
                )}

                <AdditionalInfoSection 
                    offer={offer} 
                    formatPrice={formatPrice} 
                    formatDate={formatDate} 
                />
            </div>
        </div>
    );
};

export default EducationalOfferDetail;
