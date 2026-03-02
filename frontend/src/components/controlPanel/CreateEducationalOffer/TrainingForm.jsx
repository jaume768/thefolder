import React from 'react';

const TrainingForm = ({ formData, handleInputChange, errors }) => {
    return (
        <div className="create-educational-form-section">
            <h3>Formación</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="modality">Presencial</label>
                    <select
                        id="modality"
                        name="modality"
                        value={formData.modality}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Online">Online</option>
                        <option value="Híbrida">Híbrida</option>
                    </select>
                </div>
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="morningSchedule">Horario de mañana?</label>
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
                    <label htmlFor="duration">Duración (Años)</label>
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
                    <label htmlFor="credits">¿Créditos?</label>
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
                    <label htmlFor="internships">¿Prácticas?</label>
                    <input
                        type="checkbox"
                        id="internships"
                        name="internships"
                        checked={formData.internships}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="erasmus">¿Erasmus?</label>
                    <input
                        type="checkbox"
                        id="erasmus"
                        name="erasmus"
                        checked={formData.erasmus}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="create-educational-form-field create-educational-checkbox-field">
                    <label htmlFor="bilingualEducation">Educación bilingüe</label>
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
