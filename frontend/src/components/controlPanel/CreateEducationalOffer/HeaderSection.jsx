import React from 'react';

const HeaderSection = ({ files, handleFileChange }) => {
    return (
        <div className="create-educational-header-image-section">
            <div className="create-educational-header-image-upload">
                <label htmlFor="headerImage" className="create-educational-upload-label">
                    <div className="create-educational-upload-icon">
                        <i className="fas fa-arrow-up"></i>
                    </div>
                    <span>Sube tu imagen de cabecera</span>
                </label>
                <input
                    type="file"
                    id="headerImage"
                    name="headerImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="create-educational-file-input"
                />
            </div>
            {files.headerImage && (
                <div className="create-educational-header-image-preview">
                    <img src={URL.createObjectURL(files.headerImage)} alt="Vista previa" />
                </div>
            )}
        </div>
    );
};

export default HeaderSection;
