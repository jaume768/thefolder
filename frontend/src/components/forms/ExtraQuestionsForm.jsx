// src/components/ExtraQuestionsForm.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const ExtraQuestionsForm = ({ formData, setFormData, className }) => {
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
        <div className={`form-section ${className || ''}`}>
            {/* Título y subtítulo con las clases de create-offer */}
            <span className="createoffer-subtitle">
                {t('create.extraQuestionsForm.subtitle')}
            </span>
            <h2 className="createoffer-section-title">{t('create.extraQuestionsForm.title')}</h2>

            {formData.extraQuestions && formData.extraQuestions.length > 0 && (
                <div className="questions-list">
                    {formData.extraQuestions.map((question, index) => (
                        <div key={index} className="question-item">
                            <div className="question-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4>{t('create.extraQuestionsForm.questionLabel', { number: index + 1 })}</h4>
                                <button
                                    type="button"
                                    className="remove-question-btn"
                                    onClick={() => removeQuestion(index)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    value={question.question || ''}
                                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                    placeholder={t('create.extraQuestionsForm.questionPlaceholder')}
                                    className="question-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('create.extraQuestionsForm.responseTypeLabel')}</label>
                                <select
                                    value={question.responseType || 'text'}
                                    onChange={(e) => updateQuestion(index, 'responseType', e.target.value)}
                                    className="question-select"
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
                    className="add-question-btn"
                    onClick={addQuestion}
                >
                    {t('create.extraQuestionsForm.addQuestion')}
                </button>
            )}
        </div>
    );
};

export default ExtraQuestionsForm;
