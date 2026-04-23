import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../controlPanel/css/applyOfferModal.css';

const ApplyOfferModal = ({ isOpen, onClose, offer, onSubmitApplication }) => {
    const { t } = useTranslation('offers');
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
            alert(t('applyModal.sendError'));
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
            alert(t('applyModal.sendError'));
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
                        placeholder={t('applyModal.placeholder')}
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
                            {t('applyModal.yes')}
                        </label>
                        <label>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                checked={answers[index]?.answer === false}
                                onChange={() => handleAnswerChange(index, false)}
                            />
                            {t('applyModal.no')}
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
                        placeholder={t('applyModal.placeholder')}
                    />
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="apply-offer-modal-overlay" onClick={onClose}>
            <div className="apply-offer-modal" onClick={(e) => e.stopPropagation()}>
                <button className="apply-offer-close-button" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <div className="apply-offer-modal-header">
                    <h2>{step === 1 ? t('applyModal.questionsTitle') : t('applyModal.confirmTitle')}</h2>
                </div>
                
                <div className="apply-offer-modal-content">
                    {step === 1 ? (
                        // Paso 1: Responder preguntas
                        <>
                            <p className="apply-offer-description">
                                {t('applyModal.description')}
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
                                    {t('applyModal.noQuestions')}
                                </p>
                            )}
                        </>
                    ) : (
                        // Paso 2: Confirmar inscripción
                        <div className="apply-offer-confirmation">
                            <p>{t('applyModal.confirmationText')}</p>
                            <h3>{offer.position} - {offer.companyName}</h3>
                            
                            {offer?.extraQuestions?.length > 0 && (
                                <div className="apply-offer-summary">
                                    <h4>{t('applyModal.answersTitle')}</h4>
                                    {answers.map((answer, index) => (
                                        <div key={index} className="apply-offer-answer-summary">
                                            <p className="apply-offer-question-text">{answer.question}</p>
                                            <p className="apply-offer-answer-text">
                                                {answer.responseType === 'boolean' 
                                                    ? (answer.answer ? t('applyModal.yes') : t('applyModal.no')) 
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
                                {t('applyModal.cancel')}
                            </button>
                            <button 
                                className="apply-offer-next-button" 
                                onClick={handleNextStep}
                                disabled={!validateAnswers()}
                            >
                                {t('applyModal.continue')}
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
                                {t('applyModal.back')}
                            </button>
                            <button 
                                className="apply-offer-submit-button" 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t('applyModal.sending') : t('applyModal.confirm')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyOfferModal;
