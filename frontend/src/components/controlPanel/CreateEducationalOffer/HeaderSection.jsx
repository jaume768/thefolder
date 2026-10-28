import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageUp } from 'lucide-react';

const HeaderSection = ({ files, handleFileChange }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-header-image-section">
            <div className="create-educational-header-image-upload">
                <label htmlFor="headerImage" className="create-educational-upload-label">
                    <div className="create-educational-upload-icon">
                        <ImageUp size={20} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <span>{t('create.headerSection.uploadLabel')}</span>
                </label>
                <input
                    type="file"
                    id="headerImage"
                    name="headerImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="create-educational-file-input"
                />
            </div>
            {files.headerImage && (
                <div className="create-educational-header-image-preview">
                    <img src={URL.createObjectURL(files.headerImage)} alt={t('create.headerSection.previewAlt')} />
                </div>
            )}
        </div>
    );
};

export default HeaderSection;
