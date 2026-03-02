import React, { useState } from 'react';
import './css/applyOfferModal.css';

const ApplyOfferModal = ({ isOpen, onClose, offer, onSubmitApplication }) => {
    const [answers, setAnswers] = useState([]);
    const [step, setStep] = useState(1); // 1: Preguntas, 2: Confirmación
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inicializar las respuestas cuando el modal se abre
    React.useEffect(() => {
        if (isOpen && offer?.extraQuestions?.length > 0) {
            // Crear un array de respuestas vacías para cada pregunta
            const initialAnswers = offer.extraQuestions.map(question => ({
                question: question.question,
                responseType: question.responseType,
                answer: question.responseType === 'boolean' ? false : ''
            }));
            setAnswers(initialAnswers);
        } else {
            setAnswers([]);
        }
        setStep(1);
    }, [isOpen, offer]);

    // Manejar cambios en las respuestas
    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index].answer = value;
        setAnswers(newAnswers);
    };

    // Validar si todas las preguntas tienen respuesta
    const validateAnswers = () => {
        if (!offer?.extraQuestions?.length) return true;
        
        return answers.every(answer => {
            if (answer.responseType === 'boolean') return true; // Siempre tiene valor (true/false)
            return answer.answer !== '';
        });
    };

    // Avanzar al paso de confirmación
    const handleNextStep = () => {
        if (validateAnswers()) {
            setStep(2);
        } else {
            alert('Por favor, responde todas las preguntas.');
        }
    };

    // Volver al paso de preguntas
    const handlePreviousStep = () => {
        setStep(1);
    };

    // Enviar la aplicación
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await onSubmitApplication(answers);
            onClose();
        } catch (error) {
            console.error('Error al enviar la aplicación:', error);
            alert('Hubo un error al enviar tu aplicación. Por favor, intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderizar los campos de entrada según el tipo de respuesta
    const renderAnswerInput = (question, index) => {
        switch (question.responseType) {
            case 'text':
                return (
                    <textarea
                        value={answers[index]?.answer || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="apply-offer-textarea"
                        placeholder="Escribe tu respuesta aquí..."
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={answers[index]?.answer || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="apply-offer-input"
                        placeholder="0"
                    />
                );
            case 'boolean':
                return (
                    <div className="apply-offer-boolean">
                        <label>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                checked={answers[index]?.answer === true}
                                onChange={() => handleAnswerChange(index, true)}
                            />
                            Sí
                        </label>
                        <label>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                checked={answers[index]?.answer === false}
                                onChange={() => handleAnswerChange(index, false)}
                            />
                            No
                        </label>
                    </div>
                );
            case 'url':
                return (
                    <input
                        type="url"
                        value={answers[index]?.answer || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="apply-offer-input"
                        placeholder="https://ejemplo.com"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={answers[index]?.answer || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="apply-offer-input"
                        placeholder="Escribe tu respuesta aquí..."
                    />
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="apply-offer-modal-overlay">
            <div className="apply-offer-modal">
                <button className="apply-offer-close-button" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <div className="apply-offer-modal-header">
                    <h2>{step === 1 ? 'Preguntas adicionales' : 'Confirmar inscripción'}</h2>
                </div>
                
                <div className="apply-offer-modal-content">
                    {step === 1 ? (
                        // Paso 1: Responder preguntas
                        <>
                            <p className="apply-offer-description">
                                Para completar tu inscripción a esta oferta, por favor responde las siguientes preguntas.
                            </p>
                            
                            {offer?.extraQuestions?.length > 0 ? (
                                <div className="apply-offer-questions">
                                    {offer.extraQuestions.map((question, index) => (
                                        <div key={index} className="apply-offer-question">
                                            <label>{question.question} {answers[index]?.responseType !== 'boolean' && '*'}</label>
                                            {renderAnswerInput(question, index)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="apply-offer-no-questions">
                                    Esta oferta no tiene preguntas adicionales. Puedes continuar con la inscripción.
                                </p>
                            )}
                        </>
                    ) : (
                        // Paso 2: Confirmar inscripción
                        <div className="apply-offer-confirmation">
                            <p>Estás a punto de inscribirte a la oferta:</p>
                            <h3>{offer.position} - {offer.companyName}</h3>
                            
                            {offer?.extraQuestions?.length > 0 && (
                                <div className="apply-offer-summary">
                                    <h4>Tus respuestas:</h4>
                                    {answers.map((answer, index) => (
                                        <div key={index} className="apply-offer-answer-summary">
                                            <p className="apply-offer-question-text">{answer.question}</p>
                                            <p className="apply-offer-answer-text">
                                                {answer.responseType === 'boolean' 
                                                    ? (answer.answer ? 'Sí' : 'No') 
                                                    : answer.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="apply-offer-modal-footer">
                    {step === 1 ? (
                        // Botones para el paso 1
                        <div className="apply-offer-footer-buttons">
                            <button className="apply-offer-cancel-button" onClick={onClose}>
                                Cancelar
                            </button>
                            <button 
                                className="apply-offer-next-button" 
                                onClick={handleNextStep}
                                disabled={!validateAnswers()}
                            >
                                Continuar
                            </button>
                        </div>
                    ) : (
                        // Botones para el paso 2
                        <div className="apply-offer-footer-buttons">
                            <button 
                                className="apply-offer-back-button" 
                                onClick={handlePreviousStep}
                                disabled={isSubmitting}
                            >
                                Volver
                            </button>
                            <button 
                                className="apply-offer-submit-button" 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Enviando...' : 'Confirmar inscripción'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyOfferModal;
