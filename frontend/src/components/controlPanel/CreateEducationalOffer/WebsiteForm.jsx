import React from 'react';

const WebsiteForm = ({ formData, handleInputChange, errors }) => {
    return (
        <div className="create-educational-form-section">
            <h3>Página web donde ampliar información</h3>
            <div className="create-educational-form-field">
                <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="Escribe aquí tu enlace"
                />
                {errors.websiteUrl && <span className="create-educational-error-message">{errors.websiteUrl}</span>}
            </div>
        </div>
    );
};

export default WebsiteForm;
