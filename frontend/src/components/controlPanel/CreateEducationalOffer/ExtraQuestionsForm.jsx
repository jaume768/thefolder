import React from 'react';

const ExtraQuestionsForm = ({ formData, setFormData }) => {
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
            <h3>Preguntas extra</h3>
            <p className="create-educational-form-description">
                ¿Te gustaría preguntar algo concreto a los candidatos que se interesen por tu oferta?
            </p>

            {formData.extraQuestions && formData.extraQuestions.length > 0 && (
                <div className="create-educational-questions-list">
                    {formData.extraQuestions.map((question, index) => (
                        <div key={index} className="create-educational-question-item">
                            <div className="create-educational-question-header">
                                <h4>Pregunta {index + 1}</h4>
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
                                    placeholder="Escribe aquí tu pregunta"
                                    className="create-educational-question-input"
                                />
                            </div>
                            <div className="create-educational-form-field">
                                <label>Selecciona el tipo de respuesta</label>
                                <select
                                    value={question.responseType || 'text'}
                                    onChange={(e) => updateQuestion(index, 'responseType', e.target.value)}
                                    className="create-educational-question-select"
                                >
                                    <option value="text">Texto</option>
                                    <option value="number">Numérico</option>
                                    <option value="boolean">Sí/No - Verdadero/Falso</option>
                                    <option value="url">Enlace</option>
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
                    <i className="fas fa-plus"></i> Añadir pregunta
                </button>
            )}
        </div>
    );
};

export default ExtraQuestionsForm;
