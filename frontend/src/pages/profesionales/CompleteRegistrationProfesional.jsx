// CompleteRegistrationProfesional.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/complete-registration.css';

const CompleteRegistrationProfesional = () => {
    const navigate = useNavigate();
    const [professionalType, setProfessionalType] = useState(null);
    const [error, setError] = useState(""); // Estado para mensaje de error

    const options = [
        "Una marca pequeña",
        "Una empresa",
        "Una agencia/scout",
        "Una institución educativa",
        "Otro"
    ];

    const handleNext = async () => {
        if (!professionalType) {
            setError("Por favor, selecciona tu rol.");
            return;
        }
        setError("");
        try {
            const token = localStorage.getItem("authToken");
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ professionalType })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("professionalType", professionalType);
                if (professionalType === "4") {
                    navigate('/profesional/registro/institucion');
                } else {
                    navigate('/profesional/registro/datos-personales');
                }
            } else {
                setError(data.error || "Ha ocurrido un error.");
                console.error(data.error);
            }
        } catch (error) {
            setError("Error en la conexión o en el servidor.");
            console.error(error);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="complete-registration-container">
            <div className="contenedor-registro-objetivo">
                <p className="paso" style={{ color: 'gray', fontSize: '0.8rem' }}>paso 1</p>
                <p className="question">¿Cuál es tu rol?</p>
                <h2 className="titulo">Soy el representante de...</h2>

                {/* Mensaje de error */}
                {error && <p className="error-message">{error}</p>}

                <div className="objectives-list">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className={`objective-button ${professionalType === String(index + 1) ? "selected" : ""}`}
                            onClick={() => {
                                setProfessionalType(String(index + 1));
                                setError("");
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <div
                    className="navigation-buttons"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}
                >
                    <button
                        className="back-button"
                        onClick={handleBack}
                        style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}
                    >
                        &#8592; Volver atrás
                    </button>
                    <button className="next-button" onClick={handleNext}>
                        Siguiente
                    </button>
                </div>
                <div className="pagination-dots" style={{ marginTop: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((dot, index) => (
                        <span
                            key={index}
                            style={{
                                margin: '0 4px',
                                fontSize: index === 0 ? '1rem' : '0.9rem',
                                color: 'gray'
                            }}
                        >
                            &#9679;
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CompleteRegistrationProfesional;
