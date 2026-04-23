import React from 'react';
import { useTranslation } from 'react-i18next';

const TrainingForm = ({ formData, handleInputChange, errors }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-section">
            <h3>{t('create.training.title')}</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="modality">{t('create.training.modalityLabel')}</label>
                    <select
                        id="modality"
                        name="modality"
                        value={formData.modality}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">{t('create.training.select')}</option>
                        <option value="Presencial">{t('create.training.presencial')}</option>
                        <option value="Online">{t('create.training.online')}</option>
                        <option value="Híbrida">{t('create.training.hibrida')}</option>
                    </select>
                </div>
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="morningSchedule">{t('create.training.morningSchedule')}</label>
                    <input
                        type="checkbox"
                        id="morningSchedule"
                        name="morningSchedule"
                        checked={formData.morningSchedule}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="duration">{t('create.training.durationLabel')}</label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        min="1"
                        step="1"
                    />
                    {errors.duration && <span className="create-educational-error-message">{errors.duration}</span>}
                </div>
                <div className="create-educational-form-field">
                    <label htmlFor="credits">{t('create.training.creditsLabel')}</label>
                    <input
                        type="number"
                        id="credits"
                        name="credits"
                        value={formData.credits}
                        onChange={handleInputChange}
                        min="1"
                        step="1"
                    />
                    {errors.credits && <span className="create-educational-error-message">{errors.credits}</span>}
                </div>
            </div>
            
            <div className="create-educational-form-row create-educational-checkbox-group">
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="internships">{t('create.training.internshipsLabel')}</label>
                    <input
                        type="checkbox"
                        id="internships"
                        name="internships"
                        checked={formData.internships}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="erasmus">{t('create.training.erasmusLabel')}</label>
                    <input
                        type="checkbox"
                        id="erasmus"
                        name="erasmus"
                        checked={formData.erasmus}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="bilingualEducation">{t('create.training.bilingualLabel')}</label>
                    <input
                        type="checkbox"
                        id="bilingualEducation"
                        name="bilingualEducation"
                        checked={formData.bilingualEducation}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrainingForm;
