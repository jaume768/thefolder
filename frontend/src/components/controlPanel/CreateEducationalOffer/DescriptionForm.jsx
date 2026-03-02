import React from 'react';

const DescriptionForm = ({ 
    formData, 
    handleInputChange, 
    newRequirement, 
    setNewRequirement, 
    addRequirement, 
    removeRequirement 
}) => {
    return (
        <div className="create-educational-form-section">
            <h3>Descripción</h3>
            <div className="create-educational-form-field">
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe brevemente esta oferta educativa"
                />
            </div>
            
            {/* Requisitos */}
            <div className="create-educational-form-field">
                <h4>Requisitos (opcional)</h4>
                <div className="create-educational-requirements-input">
                    <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Añadir requisito"
                    />
                    <button type="button" onClick={addRequirement}>Añadir</button>
                </div>
                
                {formData.requirements.length > 0 && (
                    <ul className="create-educational-requirements-list">
                        {formData.requirements.map((req, index) => (
                            <li key={index}>
                                {req}
                                <button 
                                    type="button" 
                                    onClick={() => removeRequirement(index)}
                                    className="create-educational-remove-requirement"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DescriptionForm;
