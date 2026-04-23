import React from 'react';
import { useTranslation } from 'react-i18next';

const ExtraQuestionsForm = ({ formData, setFormData }) => {
    const { t } = useTranslation('offers');
    // Añadir una nueva pregunta vacía
    const addQuestion = () => {
        if (!formData.extraQuestions) {
            setFormData(prev => ({
                ...prev,
                extraQuestions: [{
                    question: '',
                    responseType: 'text'
                }]
            }));
        } else if (formData.extraQuestions.length < 3) {
            setFormData(prev => ({
                ...prev,
                extraQuestions: [
                    ...prev.extraQuestions,
                    {
                        question: '',
                        responseType: 'text'
                    }
                ]
            }));
        }
    };

    // Eliminar una pregunta
    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            extraQuestions: prev.extraQuestions.filter((_, i) => i !== index)
        }));
    };

    // Actualizar una pregunta
    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...(formData.extraQuestions || [])];
        if (!updatedQuestions[index]) {
            updatedQuestions[index] = { question: '', responseType: 'text' };
        }
        updatedQuestions[index][field] = value;
        
        setFormData(prev => ({
            ...prev,
            extraQuestions: updatedQuestions
        }));
    };

    return (
        <div className="create-educational-form-section">
            <h3>{t('create.extraQuestionsForm.title')}</h3>
            <p className="create-educational-form-description">
                {t('create.extraQuestionsForm.subtitle')}
            </p>

            {formData.extraQuestions && formData.extraQuestions.length > 0 && (
                <div className="create-educational-questions-list">
                    {formData.extraQuestions.map((question, index) => (
                        <div key={index} className="create-educational-question-item">
                            <div className="create-educational-question-header">
                                <h4>{t('create.extraQuestionsForm.questionLabel', { number: index + 1 })}</h4>
                                <button 
                                    type="button" 
                                    className="create-educational-remove-question"
                                    onClick={() => removeQuestion(index)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="create-educational-form-field">
                                <input
                                    type="text"
                                    value={question.question || ''}
                                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                    placeholder={t('create.extraQuestionsForm.questionPlaceholder')}
                                    className="create-educational-question-input"
                                />
                            </div>
                            <div className="create-educational-form-field">
                                <label>{t('create.extraQuestionsForm.responseTypeLabel')}</label>
                                <select
                                    value={question.responseType || 'text'}
                                    onChange={(e) => updateQuestion(index, 'responseType', e.target.value)}
                                    className="create-educational-question-select"
                                >
                                    <option value="text">{t('create.extraQuestionsForm.responseText')}</option>
                                    <option value="number">{t('create.extraQuestionsForm.responseNumber')}</option>
                                    <option value="boolean">{t('create.extraQuestionsForm.responseBoolean')}</option>
                                    <option value="url">{t('create.extraQuestionsForm.responseUrl')}</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(!formData.extraQuestions || formData.extraQuestions.length < 3) && (
                <button 
                    type="button" 
                    className="create-educational-add-question-button"
                    onClick={addQuestion}
                >
                    <i className="fas fa-plus"></i> {t('create.extraQuestionsForm.addQuestion')}
                </button>
            )}
        </div>
    );
};

export default ExtraQuestionsForm;
