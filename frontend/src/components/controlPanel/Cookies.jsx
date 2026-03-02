import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './css/Cookies.css';

const Cookies = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="cookies-container">
            <div className="cookies-header">
                <button className="cookies-back-button" onClick={goBack}>
                    <FaArrowLeft /> Volver
                </button>
            </div>
            
            <div className="cookies-content">
                <h1 className="cookies-title">Política de Cookies</h1>
                <p className="cookies-version">Actualizado: 20 de Mayo de 2025 Versión: 1.0</p>
                
                <p className="cookies-paragraph">
                    En TheFolderWorld, nos comprometemos a ofrecerte una experiencia de navegación segura y fluida. Para ello, utilizamos cookies y tecnologías similares que nos permiten mejorar la funcionalidad del sitio web y asegurar su correcto funcionamiento.
                </p>

                <section>
                    <h2 className="cookies-subtitle">¿Qué son las cookies?</h2>
                    <p className="cookies-paragraph">
                        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, smartphone, etc.) cuando accedes a un sitio web. Estos archivos permiten que el sitio web recuerde información sobre tu visita, como tus preferencias de navegación o el contenido que has consultado. Existen diferentes tipos de cookies, algunas necesarias para el funcionamiento del sitio y otras que pueden utilizarse para analizar el uso de la plataforma y mejorar nuestra oferta de servicios.
                    </p>
                </section>

                <section>
                    <h2 className="cookies-subtitle">Tipos de cookies utilizadas en TheFolderWorld</h2>
                    <p className="cookies-paragraph">
                        En este momento, TheFolderWorld utiliza únicamente cookies técnicas esenciales para garantizar el correcto funcionamiento de la plataforma. Estas cookies no recogen información personal identificable ni se utilizan para realizar seguimiento o análisis de comportamiento.
                        Las cookies que utilizamos son las siguientes:
                    </p>
                    <ul className="cookies-list">
                        <li><strong>Cookies técnicas:</strong> Son imprescindibles para la correcta navegación y el funcionamiento de la plataforma. Estas cookies permiten gestionar la sesión del usuario, la autenticación en el servicio y la seguridad en la transmisión de datos.
                        </li>
                        <li><strong>Cookies de seguridad:</strong> Se utilizan para proteger tu información y garantizar que las comunicaciones en la plataforma se realicen de forma segura mediante protocolos SSL/TLS, cifrado en reposo y backups automáticos.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="cookies-subtitle">Seguridad en el uso de las cookies</h2>
                    <p className="cookies-paragraph">
                        TheFolderWorld implementa rigurosas medidas de seguridad para proteger la información que manejamos, tanto la que nos proporcionas como la que gestionamos para mantener la plataforma segura:
                    </p>
                    <ul className="cookies-list">
                        <li><strong>Cifrado SSL/TLS:</strong> Utilizamos protocolos de seguridad avanzados para garantizar que la información transmitida entre tu dispositivo y nuestra plataforma esté protegida.</li>
                        <li><strong>Cifrado en reposo:</strong> Los datos que almacenamos están cifrados para evitar accesos no autorizados.</li>
                        <li><strong>Backups automáticos diarios:</strong> Realizamos copias de seguridad de manera automática para proteger tus datos.</li>
                        <li><strong>Firewalls e IDS/IPS:</strong> Contamos con sistemas de protección avanzados para detectar y prevenir posibles amenazas.</li>
                        <li><strong>Monitorización continua de logs y aplicación inmediata de parches:</strong> Supervisamos continuamente el funcionamiento de la plataforma y aplicamos actualizaciones de seguridad de manera inmediata.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="cookies-subtitle">¿Cómo puedes gestionar las cookies?</h2>
                    <p className="cookies-paragraph">
                        Puedes configurar tu navegador para bloquear o eliminar las cookies en cualquier momento. Sin embargo, ten en cuenta que si desactivas las cookies esenciales, algunas funciones de la plataforma pueden no funcionar correctamente. La mayoría de los navegadores permiten aceptar, rechazar o eliminar las cookies a través de la configuración de privacidad.
                    </p>
                </section>

                <section>
                    <h2 className="cookies-subtitle">Cambios en la política de cookies</h2>
                    <p className="cookies-paragraph">
                        TheFolderWorld se reserva el derecho a modificar esta política de cookies en cualquier momento para adaptarla a cambios normativos o a mejoras en el servicio. Cualquier cambio significativo será notificado a los usuarios registrados, y la nueva versión será publicada en esta misma página.
                        Recomendamos revisar periódicamente nuestra política de cookies para mantenerte informado sobre cualquier actualización. La última modificación de esta política se realizó el 20 de mayo de 2025.
                    </p>
                </section>

                <section>
                    <h2 className="cookies-subtitle">Contacto</h2>
                    <p className="cookies-paragraph">
                        Si tienes preguntas sobre nuestra Política de Cookies o sobre cómo gestionamos tus datos, puedes ponerte en contacto con nosotros a través de la dirección de correo electrónico: <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Cookies;
