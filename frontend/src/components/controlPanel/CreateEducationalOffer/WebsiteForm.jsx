import React from 'react';
import { useTranslation } from 'react-i18next';

const WebsiteForm = ({ formData, handleInputChange, errors }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-section">
            <h3>{t('create.websiteForm.title')}</h3>
            <div className="create-educational-form-field">
                <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder={t('create.websiteForm.placeholder')}
                />
                {errors.websiteUrl && <span className="create-educational-error-message">{errors.websiteUrl}</span>}
            </div>
        </div>
    );
};

export default WebsiteForm;
