import React from 'react';

const SchoolYearForm = ({ formData, handleInputChange }) => {
    return (
        <div className="create-educational-form-section">
            <h3>Año escolar</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="schoolYearStartMonth">Mes de inicio</label>
                    <select
                        id="schoolYearStartMonth"
                        name="schoolYearStartMonth"
                        value={formData.schoolYearStartMonth}
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
                <div className="create-educational-form-field">
                    <label htmlFor="schoolYearEndMonth">Mes de finalización</label>
                    <select
                        id="schoolYearEndMonth"
                        name="schoolYearEndMonth"
                        value={formData.schoolYearEndMonth}
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
        </div>
    );
};

export default SchoolYearForm;
