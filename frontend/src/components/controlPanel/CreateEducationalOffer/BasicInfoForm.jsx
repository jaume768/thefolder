import React from 'react';

const BasicInfoForm = ({ formData, handleInputChange, errors }) => {
    return (
        <div className="create-educational-form-field">
            <label htmlFor="programName" className="create-educational-form-title">Título de la formación</label>
            <input
                type="text"
                id="programName"
                name="programName"
                value={formData.programName}
                onChange={handleInputChange}
                required
                placeholder="Nombre de la formación. Ejemplo: Artesanía Contemporánea"
                className="create-educational-large-input"
            />
            {errors.programName && <span className="create-educational-error-message">{errors.programName}</span>}
            <small>Introduce el nombre de la formación sin incluir palabras como "Grado Superior" o "Máster"</small>
        </div>
    );
};

export default BasicInfoForm;
