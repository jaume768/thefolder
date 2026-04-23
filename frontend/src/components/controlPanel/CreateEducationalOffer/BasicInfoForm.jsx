import React from 'react';
import { useTranslation } from 'react-i18next';

const BasicInfoForm = ({ formData, handleInputChange, errors }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-field">
            <label htmlFor="programName" className="create-educational-form-title">{t('create.basicInfo.title')}</label>
            <input
                type="text"
                id="programName"
                name="programName"
                value={formData.programName}
                onChange={handleInputChange}
                required
                placeholder={t('create.basicInfo.placeholder')}
                className="create-educational-large-input"
            />
            {errors.programName && <span className="create-educational-error-message">{errors.programName}</span>}
            <small>{t('create.basicInfo.hint')}</small>
        </div>
    );
};

export default BasicInfoForm;
