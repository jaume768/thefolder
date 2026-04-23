import React from 'react';
import { useTranslation } from 'react-i18next';

const SpecificationsForm = ({ formData, handleInputChange }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-section">
            <h3>{t('create.specifications.title')}</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="city">{t('create.specifications.locationLabel')}</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder={t('create.specifications.cityPlaceholder')}
                        required
                    />
                </div>
                <div className="create-educational-form-field">
                    <label htmlFor="country">&nbsp;</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder={t('create.specifications.countryPlaceholder')}
                        required
                    />
                </div>
            </div>
            
            <div className="create-educational-form-field">
                <label htmlFor="educationType">{t('create.specifications.educationTypeLabel')}</label>
                <select
                    id="educationType"
                    name="educationType"
                    value={formData.educationType}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">{t('create.specifications.select')}</option>
                    <option value="Grado">{t('create.specifications.grado')}</option>
                    <option value="Máster">{t('create.specifications.master')}</option>
                    <option value="FP">{t('create.specifications.fp')}</option>
                    <option value="Curso">{t('create.specifications.curso')}</option>
                    <option value="Taller">{t('create.specifications.taller')}</option>
                    <option value="Certificación">{t('create.specifications.certificacion')}</option>
                    <option value="Otro">{t('create.specifications.otro')}</option>
                </select>
            </div>
        </div>
    );
};

export default SpecificationsForm;
