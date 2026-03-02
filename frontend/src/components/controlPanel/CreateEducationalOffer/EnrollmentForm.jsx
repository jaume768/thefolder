import React from 'react';

const EnrollmentForm = ({ formData, handleInputChange, errors }) => {
    return (
        <div className="create-educational-form-section">
            <h3>Plazo de matriculación</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentStartDate">Día de inicio</label>
                    <input
                        type="number"
                        id="enrollmentStartDate"
                        name="enrollmentStartDate"
                        value={formData.enrollmentStartDate}
                        onChange={handleInputChange}
                        placeholder="Día"
                        min="1"
                        max="31"
                    />
                </div>
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentStartMonth">Mes</label>
                    <select
                        id="enrollmentStartMonth"
                        name="enrollmentStartMonth"
                        value={formData.enrollmentStartMonth}
                        onChange={handleInputChange}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Enero">Enero</option>
                        <option value="Febrero">Febrero</option>
                        <option value="Marzo">Marzo</option>
                        <option value="Abril">Abril</option>
                        <option value="Mayo">Mayo</option>
                        <option value="Junio">Junio</option>
                        <option value="Julio">Julio</option>
                        <option value="Agosto">Agosto</option>
                        <option value="Septiembre">Septiembre</option>
                        <option value="Octubre">Octubre</option>
                        <option value="Noviembre">Noviembre</option>
                        <option value="Diciembre">Diciembre</option>
                    </select>
                </div>
            </div>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentEndDate">Día de finalización</label>
                    <input
                        type="number"
                        id="enrollmentEndDate"
                        name="enrollmentEndDate"
                        value={formData.enrollmentEndDate}
                        onChange={handleInputChange}
                        placeholder="Día"
                        min="1"
                        max="31"
                    />
                </div>
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentEndMonth">Mes</label>
                    <select
                        id="enrollmentEndMonth"
                        name="enrollmentEndMonth"
                        value={formData.enrollmentEndMonth}
                        onChange={handleInputChange}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Enero">Enero</option>
                        <option value="Febrero">Febrero</option>
                        <option value="Marzo">Marzo</option>
                        <option value="Abril">Abril</option>
                        <option value="Mayo">Mayo</option>
                        <option value="Junio">Junio</option>
                        <option value="Julio">Julio</option>
                        <option value="Agosto">Agosto</option>
                        <option value="Septiembre">Septiembre</option>
                        <option value="Octubre">Octubre</option>
                        <option value="Noviembre">Noviembre</option>
                        <option value="Diciembre">Diciembre</option>
                    </select>
                </div>
            </div>
            {errors.enrollmentDates && <span className="create-educational-error-message">{errors.enrollmentDates}</span>}
        </div>
    );
};

export default EnrollmentForm;
