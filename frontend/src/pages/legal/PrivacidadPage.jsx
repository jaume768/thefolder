import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../components/controlPanel/css/Legal.css';

const Privacidad = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1 className="legal-title">Política de Privacidad</h1>
                <p className="legal-version">Actualizado: Abril de 2026 · Versión: 2.0</p>

                <p className="legal-paragraph">
                    En THEFOLDER nos tomamos tu privacidad en serio. Esta política explica qué datos personales recogemos, para qué los usamos, con quién los compartimos y cuáles son tus derechos. Está redactada conforme al Reglamento (UE) 2016/679, Reglamento General de Protección de Datos (RGPD), y la Ley Orgánica 3/2018, de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD).
                </p>

                <section>
                    <h2 className="legal-subtitle">1/ Responsable del tratamiento</h2>
                    <p className="legal-paragraph">
                        El responsable del tratamiento de tus datos personales es:
                    </p>
                    <ul className="legal-list">
                        <li><strong>Nombre comercial:</strong> THEFOLDER</li>
                        <li><strong>Titular:</strong> Miriam Reina Bolaños</li>
                        <li><strong>Domicilio:</strong> Málaga, 29670, España</li>
                        <li><strong>Email:</strong> <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a></li>
                        <li><strong>Web:</strong> <a href="https://thefolder.es" target="_blank" rel="noopener noreferrer">https://thefolder.es ↗</a></li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">2/ Qué datos recogemos y por qué</h2>
                    <p className="legal-paragraph">
                        Recogemos únicamente los datos necesarios para prestarte el servicio. A continuación te detallamos qué datos tratamos, con qué finalidad y bajo qué base legal.
                    </p>

                    <h3 className="legal-subtitle-small">Datos de registro — Cuenta Creativa</h3>
                    <p className="legal-paragraph">Al registrarte como creativo, recogemos:</p>
                    <ul className="legal-list">
                        <li>Nombre completo, nombre de usuario, correo electrónico y contraseña (almacenada encriptada, nunca en texto plano).</li>
                        <li>Fecha de nacimiento, ciudad y país de residencia.</li>
                        <li>Nivel creativo, etiquetas profesionales, titulares de perfil, idiomas.</li>
                        <li>Redes sociales (Instagram, LinkedIn) si decides proporcionarlas.</li>
                        <li>Foto de perfil (almacenada en Cloudinary).</li>
                        <li>Fuente de referencia: cómo conociste la plataforma.</li>
                        <li>Fecha y registro de aceptación de estos términos.</li>
                    </ul>
                    <p className="legal-paragraph"><em>Base legal: ejecución de un contrato (art. 6.1.b RGPD).</em></p>

                    <h3 className="legal-subtitle-small">Datos de registro — Cuenta Industria</h3>
                    <p className="legal-paragraph">Al registrarte como empresa, marca o institución, recogemos:</p>
                    <ul className="legal-list">
                        <li>Nombre completo, nombre de usuario, correo electrónico y contraseña encriptada.</li>
                        <li>Nombre de la empresa y tipo (marca, showroom, agencia, media, producción u otro).</li>
                        <li>Ciudad, país, descripción breve, sitio web y redes sociales.</li>
                        <li>Logo o imagen de perfil (almacenado en Cloudinary).</li>
                    </ul>
                    <p className="legal-paragraph"><em>Base legal: ejecución de un contrato (art. 6.1.b RGPD).</em></p>

                    <h3 className="legal-subtitle-small">Datos del perfil (voluntarios)</h3>
                    <p className="legal-paragraph">Tras el registro, puedes completar tu perfil con información adicional de carácter voluntario:</p>
                    <ul className="legal-list">
                        <li>Biografía profesional y título profesional.</li>
                        <li>Formación académica, habilidades y software.</li>
                        <li>Preferencias laborales: tipo de contrato, modalidad, disponibilidad, estado de búsqueda activa.</li>
                        <li>Redes sociales adicionales: Behance, TikTok, Tumblr, YouTube, Pinterest, Substack.</li>
                        <li>CV y portfolio en formato PDF o imagen (almacenados en Cloudinary).</li>
                        <li>Imagen de cabecera del perfil.</li>
                    </ul>
                    <p className="legal-paragraph"><em>Base legal: consentimiento (art. 6.1.a RGPD). Puedes modificar o eliminar estos datos en cualquier momento desde tu perfil.</em></p>

                    <h3 className="legal-subtitle-small">Contenido publicado</h3>
                    <p className="legal-paragraph">Cuando publicas proyectos, almacenamos el título, descripción, imágenes, etiquetas, rol del autor y menciones a otras personas. Todo el contenido publicado es público y visible para cualquier visitante, registrado o no.</p>
                    <p className="legal-paragraph"><em>Base legal: ejecución del contrato (art. 6.1.b RGPD).</em></p>

                    <h3 className="legal-subtitle-small">Candidaturas a ofertas</h3>
                    <p className="legal-paragraph">Si te postulas a una oferta de trabajo o formativa, almacenamos tu candidatura, las respuestas que hayas proporcionado y el estado del proceso.</p>
                    <p className="legal-paragraph"><em>Base legal: ejecución del contrato y consentimiento (art. 6.1.a y 6.1.b RGPD).</em></p>

                    <h3 className="legal-subtitle-small">Inicio de sesión con Google</h3>
                    <p className="legal-paragraph">Si eliges iniciar sesión con Google, recibimos de Google únicamente tu nombre y dirección de correo electrónico. No recibimos tu contraseña de Google ni acceso a ningún otro dato de tu cuenta.</p>
                    <p className="legal-paragraph"><em>Base legal: consentimiento (art. 6.1.a RGPD).</em></p>

                    <h3 className="legal-subtitle-small">Comunicaciones por email</h3>
                    <p className="legal-paragraph">Tu correo electrónico se utiliza únicamente para enviarte:</p>
                    <ul className="legal-list">
                        <li>Código de verificación al registrarte.</li>
                        <li>Código de restablecimiento de contraseña si lo solicitas.</li>
                        <li>Confirmación de cambios en tu cuenta.</li>
                        <li>Notificaciones sobre el estado de tus candidaturas a ofertas.</li>
                    </ul>
                    <p className="legal-paragraph">No enviamos newsletters ni comunicaciones comerciales.</p>
                    <p className="legal-paragraph"><em>Base legal: ejecución del contrato (art. 6.1.b RGPD).</em></p>
                </section>

                <section>
                    <h2 className="legal-subtitle">3/ Con quién compartimos tus datos</h2>
                    <p className="legal-paragraph">
                        No vendemos tus datos a terceros. Los compartimos únicamente con los siguientes proveedores que actúan como encargados del tratamiento:
                    </p>
                    <ul className="legal-list">
                        <li><strong>Cloudinary (Cloudinary Ltd.):</strong> Almacenamiento y entrega de imágenes y archivos. Tus fotos de perfil, proyectos, CVs y portfolios se alojan en sus servidores.</li>
                        <li><strong>Brevo (Sendinblue SAS):</strong> Envío de emails transaccionales. Recibe tu nombre y correo electrónico para gestionar los envíos descritos en el punto anterior. Brevo está establecida en Francia (UE).</li>
                        <li><strong>Google LLC (OAuth 2.0):</strong> Si usas el inicio de sesión con Google, Google actúa como proveedor de identidad. Consulta la política de privacidad de Google para más información.</li>
                        <li><strong>Amazon Web Services (AWS):</strong> Infraestructura de servidor. Ver sección 4 sobre transferencias internacionales.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">4/ Transferencias internacionales de datos</h2>
                    <p className="legal-paragraph">
                        THEFOLDER aloja su infraestructura en Amazon Web Services (AWS) en la región US East (Norte de Virginia, Estados Unidos). Esto implica una transferencia internacional de datos fuera del Espacio Económico Europeo (EEE), amparada por las Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea, que AWS incorpora en sus acuerdos de tratamiento de datos. Más información en: <a href="https://aws.amazon.com/compliance/gdpr-center/" target="_blank" rel="noopener noreferrer">aws.amazon.com/compliance/gdpr-center ↗</a>
                    </p>
                    <p className="legal-paragraph">
                        Cloudinary puede procesar datos fuera del EEE a través de su red CDN global y cuenta con mecanismos de transferencia adecuados conforme al RGPD.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">5/ Durante cuánto tiempo conservamos tus datos</h2>
                    <ul className="legal-list">
                        <li><strong>Datos de cuenta:</strong> mientras tu cuenta esté activa. Si la eliminas, borraremos tus datos en un plazo de 30 días, salvo obligación legal de conservarlos.</li>
                        <li><strong>Candidaturas:</strong> mientras la oferta esté activa y durante el tiempo necesario para resolver posibles reclamaciones.</li>
                        <li><strong>Emails transaccionales:</strong> según la política de retención de Brevo.</li>
                        <li><strong>Copias de seguridad:</strong> pueden conservarse hasta 90 días adicionales en copias del sistema.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">6/ Tus derechos</h2>
                    <p className="legal-paragraph">Como interesado, tienes los siguientes derechos reconocidos por el RGPD:</p>
                    <ul className="legal-list">
                        <li><strong>Acceso:</strong> puedes solicitarnos información sobre qué datos tuyos tratamos.</li>
                        <li><strong>Rectificación:</strong> puedes corregir datos inexactos. Muchos puedes modificarlos directamente desde tu perfil.</li>
                        <li><strong>Supresión:</strong> puedes solicitar que eliminemos tus datos cuando ya no sean necesarios.</li>
                        <li><strong>Oposición:</strong> puedes oponerte al tratamiento en determinadas circunstancias.</li>
                        <li><strong>Limitación:</strong> puedes solicitar que restrinjamos el uso de tus datos.</li>
                        <li><strong>Portabilidad:</strong> puedes solicitar una copia de tus datos en formato estructurado.</li>
                        <li><strong>Retirada del consentimiento:</strong> cuando el tratamiento se base en tu consentimiento, puedes retirarlo en cualquier momento sin que afecte a la licitud del tratamiento previo.</li>
                    </ul>
                    <p className="legal-paragraph">
                        Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a> indicando el derecho que deseas ejercer y tu nombre de usuario. Responderemos en el plazo máximo de un mes.
                    </p>
                    <p className="legal-paragraph">
                        Si consideras que el tratamiento de tus datos vulnera la normativa, puedes presentar una reclamación ante la Agencia Española de Protección de Datos: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es ↗</a>
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">7/ Menores de edad</h2>
                    <p className="legal-paragraph">
                        THEFOLDER está dirigido a profesionales y estudiantes del sector de la moda. Si eres menor de 16 años, necesitas la autorización de tus padres o tutores legales para registrarte.
                    </p>
                    <p className="legal-paragraph">
                        Si eres padre, madre o tutor y crees que tu hijo/a se ha registrado sin tu consentimiento, contáctanos en <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a> y eliminaremos su cuenta y datos asociados.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">8/ Responsabilidad sobre el contenido publicado</h2>
                    <p className="legal-paragraph">
                        Eres el único responsable de la legalidad, veracidad y autenticidad del contenido que publicas: imágenes, CVs, portfolios, ofertas y cualquier otro material. Debes garantizar que dicho contenido no infringe derechos de propiedad intelectual, derechos de privacidad de terceras personas ni ninguna otra normativa aplicable.
                    </p>
                    <p className="legal-paragraph">
                        THEFOLDER no interviene en los acuerdos, negociaciones o transacciones que puedan producirse entre usuarios a través de la plataforma, y no asume responsabilidad alguna sobre sus consecuencias.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">9/ Seguridad</h2>
                    <p className="legal-paragraph">Aplicamos medidas técnicas y organizativas para proteger tus datos:</p>
                    <ul className="legal-list">
                        <li>Las contraseñas se almacenan encriptadas con bcrypt, nunca en texto plano.</li>
                        <li>La cookie de sesión está configurada como httpOnly y con atributo sameSite para reducir el riesgo de ataques CSRF.</li>
                        <li>Las comunicaciones entre tu navegador y nuestros servidores se realizan a través de HTTPS.</li>
                        <li>El acceso a los sistemas de producción está restringido.</li>
                    </ul>
                    <p className="legal-paragraph">
                        Si detectas alguna vulnerabilidad de seguridad, te agradeceríamos que nos lo comuniques a <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a>
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">10/ Uso de cookies</h2>
                    <p className="legal-paragraph">
                        THEFOLDER utiliza una cookie de sesión estrictamente necesaria para el funcionamiento de la plataforma, junto con datos almacenados en el localStorage de tu navegador para mantener tu sesión activa. No utilizamos cookies de seguimiento, analíticas ni publicidad de terceros. Consulta nuestra <a href="/cookies">Política de Cookies ↗</a> para más información.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">11/ Cambios en esta política</h2>
                    <p className="legal-paragraph">
                        Podemos actualizar esta política cuando sea necesario. En caso de cambios significativos, te lo notificaremos por correo electrónico. La próxima vez que accedas a tu cuenta deberás aceptar las nuevas condiciones para seguir utilizando el servicio. La fecha de última actualización siempre estará visible al inicio de este documento.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">12/ Historial de versiones</h2>
                    <ul className="legal-list">
                        <li><strong>Versión 1.0</strong> — Publicada el 20 de mayo de 2025. Versión original.</li>
                        <li><strong>Versión 2.0</strong> — Publicada en abril de 2026. Revisión general: actualización de nombre comercial a THEFOLDER, eliminación de datos personales innecesarios (DNI, dirección completa), unificación de edad mínima a 16 años, incorporación de información sobre transferencias internacionales de datos (AWS US East), proveedores externos (Cloudinary, Brevo, Google OAuth), bases legales por tipo de tratamiento y adecuación al dominio thefolder.es.</li>
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default Privacidad;