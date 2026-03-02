// CompleteRegistrationProfesionalAgencia05.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/complete-registration.css';

const CompleteRegistrationProfesionalAgencia05 = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [agencyServices, setAgencyServices] = useState("");
    const [shareName, setShareName] = useState(true);
    const [error, setError] = useState(""); // Estado para mensaje de error

    const serviceOptions = [
        "Gestión de talentos",
        "Dirección creativa o producción",
        "Fotografía y video",
        "Consultoría y estrategia de marca",
        "Organización de desfiles",
        "Marketing digital"
    ];

    const handleNext = async () => {
        if (!companyName || !agencyServices) {
            setError("Por favor, completa todos los campos requeridos.");
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
                body: JSON.stringify({
                    companyName,
                    agencyServices,
                    showNameCompany: shareName, 
                    profileCompleted: true
                })
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/creativo/registro/final');
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
                <p className="paso" style={{ color: 'gray', fontSize: '0.8rem' }}>paso 5</p>
                <h2 className="titulo">Últimos datos...</h2>
                <div className="form-group-datos">
                    <label>Nombre de la Empresa</label>
                    <input
                        type="text"
                        placeholder="Introduce el nombre"
                        value={companyName}
                        onChange={(e) => {
                            setCompanyName(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
                    <div className="checkbox-wrapper">
                        <input
                            type="checkbox"
                            checked={!shareName}
                            onChange={(e) => setShareName(!e.target.checked)}
                        />
                        <span>Prefiero no compartir esta información</span>
                    </div>
                </div>
                <div className="form-group-datos">
                    <label>¿Servicios que ofrece?</label>
                    <select
                        value={agencyServices}
                        onChange={(e) => {
                            setAgencyServices(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    >
                        <option value="">Selecciona una opción</option>
                        {serviceOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                {/* Mensaje de error */}
                {error && <p className="error-message">{error}</p>}
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
                                fontSize: index === 4 ? '1rem' : '0.9rem',
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

export default CompleteRegistrationProfesionalAgencia05;
