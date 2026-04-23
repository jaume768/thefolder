import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../components/controlPanel/css/Legal.css';

const Cookies = () => {
    const { t } = useTranslation('legal');
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1 className="legal-title">{t('cookies.title')}</h1>
                <p className="legal-version">{t('cookies.version')}</p>

                <p className="legal-paragraph">
                    En THEFOLDER utilizamos un número mínimo de elementos de almacenamiento local, todos ellos estrictamente necesarios para el funcionamiento de la plataforma. No utilizamos cookies de seguimiento, publicidad ni analíticas de terceros.
                </p>

                <section>
                    <h2 className="legal-subtitle">1/ ¿Qué son las cookies?</h2>
                    <p className="legal-paragraph">
                        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde información sobre tu visita, como si has iniciado sesión o tus preferencias de navegación.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">2/ Qué almacenamos en tu dispositivo</h2>

                    <h3 className="legal-subtitle-small">Cookie de sesión del servidor</h3>
                    <ul className="legal-list">
                        <li><strong>Nombre:</strong> connect.sid</li>
                        <li><strong>Tipo:</strong> Cookie HTTP (no accesible desde JavaScript)</li>
                        <li><strong>Finalidad:</strong> Mantener tu sesión activa mientras navegas por la plataforma. Identifica tu sesión en el servidor de forma segura.</li>
                        <li><strong>Duración:</strong> 24 horas. Se elimina al expirar o al cerrar sesión.</li>
                        <li><strong>Carácter:</strong> Estrictamente necesaria. Sin ella no es posible iniciar sesión ni usar la plataforma.</li>
                    </ul>

                    <h3 className="legal-subtitle-small">Almacenamiento local (localStorage)</h3>
                    <p className="legal-paragraph">Los siguientes datos se almacenan en el localStorage de tu navegador. No son cookies en sentido técnico y no se envían al servidor en cada petición, pero cumplen una función similar.</p>
                    <ul className="legal-list">
                        <li><strong>authToken:</strong> Token de autenticación (JWT) que permite que la plataforma te reconozca como usuario registrado sin necesidad de volver a introducir tus credenciales.</li>
                        <li><strong>user:</strong> Datos básicos de tu perfil (nombre, tipo de cuenta) para mostrarlos en la interfaz sin consultar el servidor constantemente.</li>
                        <li><strong>thefolder_cookie_basic_ok:</strong> Registro de que has aceptado esta política, para no mostrarte el aviso de nuevo.</li>
                    </ul>
                    <p className="legal-paragraph">
                        Todos estos elementos son estrictamente necesarios para el funcionamiento de la plataforma y no requieren tu consentimiento previo según el artículo 22.2 de la LSSI-CE. Te informamos de su existencia en cumplimiento del principio de transparencia del RGPD.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">3/ Lo que NO hacemos</h2>
                    <p className="legal-paragraph">THEFOLDER no utiliza:</p>
                    <ul className="legal-list">
                        <li>Cookies de Google Analytics, Hotjar, Mixpanel ni ninguna otra herramienta de analítica de terceros.</li>
                        <li>Cookies de publicidad o retargeting.</li>
                        <li>Píxeles de seguimiento de redes sociales.</li>
                        <li>Cookies de terceros de ningún tipo.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">4/ Servicios de terceros que pueden establecer cookies</h2>
                    <p className="legal-paragraph">
                        Si utilizas el inicio de sesión con Google (Google OAuth 2.0), Google puede establecer sus propias cookies en tu dispositivo conforme a su política de privacidad. Te recomendamos consultarla si usas esta opción.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">5/ Cómo gestionar o eliminar las cookies</h2>
                    <p className="legal-paragraph">
                        Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que si bloqueas la cookie de sesión (connect.sid), no podrás iniciar sesión en la plataforma.
                    </p>
                    <ul className="legal-list">
                        <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
                        <li><strong>Mozilla Firefox:</strong> Preferencias &gt; Privacidad y seguridad &gt; Cookies y datos del sitio.</li>
                        <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Gestionar datos del sitio web.</li>
                        <li><strong>Microsoft Edge:</strong> Configuración &gt; Privacidad, búsqueda y servicios &gt; Cookies.</li>
                    </ul>
                    <p className="legal-paragraph">
                        Para eliminar el almacenamiento local (localStorage), puedes usar las herramientas de desarrollo de tu navegador (F12 &gt; Application &gt; Local Storage).
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">6/ Seguridad</h2>
                    <p className="legal-paragraph">
                        La cookie de sesión está configurada como httpOnly (no accesible desde JavaScript) y con el atributo sameSite para reducir el riesgo de ataques CSRF. Todas las comunicaciones entre tu navegador y nuestros servidores se realizan a través de HTTPS.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">7/ Cambios en esta política</h2>
                    <p className="legal-paragraph">
                        Podemos actualizar esta política para reflejar cambios técnicos o legales. Los cambios significativos se notificarán a los usuarios registrados. La fecha de última actualización siempre estará visible al inicio de este documento.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">8/ Contacto</h2>
                    <p className="legal-paragraph">
                        Si tienes preguntas sobre cómo usamos las cookies, puedes contactarnos en:
                    </p>
                    <ul className="legal-list">
                        <li><strong>Email:</strong> <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a></li>
                        <li><strong>Web:</strong> <a href="https://thefolder.es" target="_blank" rel="noopener noreferrer">https://thefolder.es ↗</a></li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">9/ Historial de versiones</h2>
                    <ul className="legal-list">
                        <li><strong>Versión 1.0</strong> — Publicada el 20 de mayo de 2025. Versión original.</li>
                        <li><strong>Versión 2.0</strong> — Publicada en abril de 2026. Revisión general: actualización de nombre comercial a THEFOLDER, detalle exacto de cookies y localStorage según auditoría técnica, eliminación de referencias a medidas de seguridad no verificadas (firewalls, IDS/IPS, backups), incorporación de sección sobre lo que no hacemos.</li>
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default Cookies;