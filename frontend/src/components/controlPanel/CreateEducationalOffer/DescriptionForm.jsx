import React from 'react';
import { useTranslation } from 'react-i18next';

const DescriptionForm = ({ 
    formData, 
    handleInputChange, 
    newRequirement, 
    setNewRequirement, 
    addRequirement, 
    removeRequirement 
}) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-section">
            <h3>{t('create.description.title')}</h3>
            <div className="create-educational-form-field">
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder={t('create.description.placeholder')}
                />
            </div>
            
            {/* Requisitos */}
            <div className="create-educational-form-field">
                <h4>{t('create.description.requirementsLabel')}</h4>
                <div className="create-educational-requirements-input">
                    <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder={t('create.description.requirementPlaceholder')}
                    />
                    <button type="button" onClick={addRequirement}>{t('create.description.addButton')}</button>
                </div>
                
                {formData.requirements.length > 0 && (
                    <ul className="create-educational-requirements-list">
                        {formData.requirements.map((req, index) => (
                            <li key={index}>
                                {req}
                                <button 
                                    type="button" 
                                    onClick={() => removeRequirement(index)}
                                    className="create-educational-remove-requirement"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DescriptionForm;
