// CompleteRegistrationProfesionalDatosPersonales.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/complete-registration.css';

const CompleteRegistrationProfesionalDatosPersonales = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState(""); // Estado para mensaje de error

    // Ref para el input de fecha
    const dateInputRef = useRef(null);

    // Definimos la fecha máxima (hoy - 2 días)
    const todayMinus2Days = new Date();
    todayMinus2Days.setDate(todayMinus2Days.getDate() - 2);
    const maxDate = todayMinus2Days.toISOString().split("T")[0];

    const countries = [
        "Estados Unidos", "Reino Unido", "Canadá", "Australia", "Alemania",
        "Francia", "Italia", "España", "Brasil", "México",
        "Japón", "China", "India", "Rusia", "Corea del Sur",
        "Países Bajos", "Suiza", "Suecia", "Noruega", "Argentina"
    ];

    const handleNext = async () => {
        if (!firstName || !lastName || !dateOfBirth || !country || !city) {
            setError("Por favor, completa todos los campos requeridos.");
            return;
        }
        setError("");
        const fullName = `${firstName} ${lastName}`;
        try {
            const token = localStorage.getItem("authToken");
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fullName, dateOfBirth, country, city })
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/photo/registro/03');
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

    // Función para abrir el selector de fecha
    const openCalendar = () => {
        if (dateInputRef.current) {
            if (dateInputRef.current.showPicker) {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.focus();
            }
        }
    };

    return (
        <div className="complete-registration-container">
            <div className="contenedor-registro-objetivo">
                <p className="paso" style={{ color: 'gray', fontSize: '0.8rem' }}>paso 2</p>
                <h2 className="titulo">Datos personales</h2>
                <div className="form-group-datos">
                    <label>Nombre</label>
                    <input
                        type="text"
                        placeholder="Introduce tu nombre"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
                </div>
                <div className="form-group-datos">
                    <label>Apellidos</label>
                    <input
                        type="text"
                        placeholder="Introduce tus apellidos"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
                </div>
                <div className="form-group-datos">
                    <label>Fecha de nacimiento</label>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => {
                                setDateOfBirth(e.target.value);
                                setError("");
                            }}
                            className="input-field"
                            style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                            min="1970-01-01"
                            max={maxDate}
                        />
                        <span
                            className="calendar-icon"
                            onClick={openCalendar}
                            style={{
                                position: 'absolute',
                                right: '0px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer'
                            }}
                        >
                            &#128197;
                        </span>
                    </div>
                </div>
                <div className="form-group-datos">
                    <label>País de residencia</label>
                    <select
                        value={country}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    >
                        <option value="">Selecciona tu país</option>
                        {countries.map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group-datos">
                    <label>Ciudad de residencia</label>
                    <input
                        type="text"
                        placeholder="Introduce tu ciudad"
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            setError("");
                        }}
                        className="input-field"
                        style={{ backgroundColor: '#f0f0f0', color: '#000' }}
                    />
                </div>
                {/* Mensaje de error */}
                {error && <p className="error-message">{error}</p>}
                <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
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
                                fontSize: index === 1 ? '1.2rem' : '1rem',
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

export default CompleteRegistrationProfesionalDatosPersonales;
