import React from 'react';

const SpecificationsForm = ({ formData, handleInputChange }) => {
    return (
        <div className="create-educational-form-section">
            <h3>Especificaciones</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="city">Ubicación</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ciudad"
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
                        placeholder="País"
                        required
                    />
                </div>
            </div>
            
            <div className="create-educational-form-field">
                <label htmlFor="educationType">Tipo de Educación</label>
                <select
                    id="educationType"
                    name="educationType"
                    value={formData.educationType}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Seleccionar...</option>
                    <option value="Grado">Grado</option>
                    <option value="Máster">Máster</option>
                    <option value="FP">FP</option>
                    <option value="Curso">Curso</option>
                    <option value="Taller">Taller</option>
                    <option value="Certificación">Certificación</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>
        </div>
    );
};

export default SpecificationsForm;
