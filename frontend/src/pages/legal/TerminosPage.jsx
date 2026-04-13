import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../components/controlPanel/css/Legal.css';

const Terminos = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1 className="legal-title">Términos y Condiciones de Uso</h1>
                <p className="legal-version">Actualizado: Abril de 2026 · Versión: 1.0</p>

                <p className="legal-paragraph">
                    Por favor, lee estos Términos y Condiciones con atención antes de utilizar THEFOLDER. Al registrarte o acceder a la plataforma, aceptas quedar vinculado por ellos. Si no estás de acuerdo con alguno de estos términos, no utilices el servicio.
                </p>

                <section>
                    <h2 className="legal-subtitle">1/ Información general</h2>
                    <p className="legal-paragraph">
                        THEFOLDER (en adelante, "la plataforma" o "el servicio") es una plataforma digital de portfolios y directorio profesional para creativos del sector de la moda, accesible en <a href="https://thefolder.es" target="_blank" rel="noopener noreferrer">https://thefolder.es ↗</a>
                    </p>
                    <ul className="legal-list">
                        <li><strong>Nombre comercial:</strong> THEFOLDER</li>
                        <li><strong>Titular:</strong> Miriam Reina Bolaños</li>
                        <li><strong>Domicilio:</strong> Málaga, 29670, España</li>
                        <li><strong>Email:</strong> <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a></li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">2/ Aceptación de los términos</h2>
                    <p className="legal-paragraph">
                        El acceso y uso de THEFOLDER implica la aceptación plena de estos Términos y Condiciones, así como de la Política de Privacidad y la Política de Cookies, que forman parte integrante de este documento.
                    </p>
                    <p className="legal-paragraph">
                        Nos reservamos el derecho a modificar estos términos en cualquier momento por razones justificadas, como cambios normativos, mejoras técnicas o modificaciones en el servicio. Los cambios entrarán en vigor en el momento de su publicación y serán notificados a los usuarios registrados por correo electrónico. Si continúas usando la plataforma tras la publicación de cambios, se entenderá que los aceptas.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">3/ Descripción del servicio</h2>
                    <p className="legal-paragraph">THEFOLDER permite a los profesionales creativos del sector de la moda:</p>
                    <ul className="legal-list">
                        <li>Crear y publicar un portfolio profesional accesible mediante una URL personal.</li>
                        <li>Publicar y gestionar proyectos con imágenes, descripciones y etiquetas.</li>
                        <li>Aparecer en un directorio profesional filtrable por especialidad, ubicación y nivel de experiencia.</li>
                        <li>Subir su CV y documentos de portfolio.</li>
                        <li>Postularse a ofertas de trabajo y oportunidades formativas publicadas por empresas del sector.</li>
                    </ul>
                    <p className="legal-paragraph">Las empresas, agencias, marcas e instituciones pueden:</p>
                    <ul className="legal-list">
                        <li>Crear una cuenta de empresa y acceder al directorio de creativos.</li>
                        <li>Publicar ofertas de trabajo y oportunidades formativas.</li>
                    </ul>
                    <p className="legal-paragraph">
                        Todos los servicios disponibles actualmente son gratuitos. Cualquier futura incorporación de servicios de pago será comunicada con antelación y requerirá aceptación expresa.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">4/ Registro y cuentas</h2>

                    <h3 className="legal-subtitle-small">Requisitos</h3>
                    <p className="legal-paragraph">Para registrarte en THEFOLDER debes:</p>
                    <ul className="legal-list">
                        <li>Tener al menos 16 años. Si eres menor de 16, necesitas autorización de tus padres o tutores legales.</li>
                        <li>Proporcionar información veraz y actualizada.</li>
                        <li>Disponer de una dirección de correo electrónico válida y verificarla mediante el código enviado al registrarte.</li>
                        <li>Desarrollar una actividad vinculada al sector de la moda, el diseño, la fotografía, la dirección de arte u otras disciplinas creativas afines.</li>
                    </ul>

                    <h3 className="legal-subtitle-small">Seguridad de la cuenta</h3>
                    <p className="legal-paragraph">
                        Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta. Si detectas un acceso no autorizado, notifícanoslo inmediatamente en <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a>
                    </p>

                    <h3 className="legal-subtitle-small">Una cuenta por persona</h3>
                    <p className="legal-paragraph">
                        Cada persona física puede tener una única cuenta creativa. Las empresas pueden tener una cuenta de empresa. No está permitido crear cuentas en nombre de terceros sin su consentimiento.
                    </p>

                    <h3 className="legal-subtitle-small">Cancelación de cuenta</h3>
                    <p className="legal-paragraph">
                        Puedes cancelar tu cuenta en cualquier momento escribiéndonos a <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a> Tras la cancelación, eliminaremos tus datos conforme a lo descrito en la Política de Privacidad.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">5/ Normas de uso y contenido</h2>

                    <h3 className="legal-subtitle-small">Contenido permitido</h3>
                    <p className="legal-paragraph">
                        Puedes publicar contenido relacionado con tu actividad profesional en el sector de la moda: fotografías editoriales, proyectos de estilismo, diseño, dirección de arte, producción y disciplinas creativas afines.
                    </p>

                    <h3 className="legal-subtitle-small">Contenido prohibido</h3>
                    <p className="legal-paragraph">Queda estrictamente prohibido publicar contenido que:</p>
                    <ul className="legal-list">
                        <li>Sea falso, engañoso o suplante la identidad de otra persona.</li>
                        <li>Infrinja derechos de propiedad intelectual o industrial de terceros.</li>
                        <li>Contenga material sexual explícito o pornográfico.</li>
                        <li>Incite al odio, la discriminación o la violencia por cualquier razón.</li>
                        <li>Constituya spam o publicidad no solicitada.</li>
                        <li>Vulnere la privacidad de terceras personas, por ejemplo publicando imágenes sin su consentimiento.</li>
                        <li>Contenga malware, virus u otro código malicioso.</li>
                    </ul>
                    <p className="legal-paragraph">
                        El incumplimiento podrá dar lugar a la retirada del contenido y a la cancelación de la cuenta sin previo aviso.
                    </p>

                    <h3 className="legal-subtitle-small">Responsabilidad sobre el contenido</h3>
                    <p className="legal-paragraph">
                        Eres el único responsable del contenido que publiques. THEFOLDER actúa como prestador de servicios de alojamiento conforme al artículo 16 de la LSSI-CE y no tiene obligación general de supervisar el contenido publicado. Nos reservamos el derecho a retirar contenido que infrinja estos términos o la ley cuando tengamos conocimiento efectivo de ello.
                    </p>
                    <p className="legal-paragraph">
                        Si detectas contenido inapropiado o un uso indebido de la plataforma, puedes reportarlo a <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a>
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">6/ Propiedad intelectual</h2>

                    <h3 className="legal-subtitle-small">Tu contenido</h3>
                    <p className="legal-paragraph">
                        Mantienes la titularidad de los derechos sobre el contenido que publicas. Al publicarlo en THEFOLDER, nos concedes una licencia no exclusiva, gratuita y mundial para mostrarlo, reproducirlo y distribuirlo dentro de la plataforma con el único fin de prestar el servicio. Esta licencia no autoriza ningún otro uso sin tu consentimiento expreso.
                    </p>

                    <h3 className="legal-subtitle-small">La plataforma</h3>
                    <p className="legal-paragraph">
                        El diseño, código, marca, logotipo y demás elementos de THEFOLDER son propiedad de Miriam Reina Bolaños y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o explotación sin autorización escrita previa.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">7/ Suspensión y cancelación de cuentas</h2>
                    <p className="legal-paragraph">Podemos suspender o cancelar tu cuenta sin previo aviso si:</p>
                    <ul className="legal-list">
                        <li>Incumples estos Términos y Condiciones.</li>
                        <li>Realizas actividades que puedan dañar a la plataforma, a otros usuarios o a terceros.</li>
                        <li>Proporcionas información falsa durante el registro.</li>
                        <li>Tu perfil no se ajusta a los propósitos de la comunidad.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">8/ Disponibilidad del servicio</h2>
                    <p className="legal-paragraph">
                        Nos esforzamos por mantener THEFOLDER disponible de forma continua, pero no garantizamos una disponibilidad ininterrumpida. Pueden producirse interrupciones por mantenimiento, actualizaciones técnicas o causas ajenas a nuestra voluntad. No seremos responsables por pérdidas o perjuicios derivados de la falta de disponibilidad temporal del servicio.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">9/ Limitación de responsabilidad</h2>
                    <p className="legal-paragraph">THEFOLDER no será responsable de:</p>
                    <ul className="legal-list">
                        <li>El contenido publicado por los usuarios.</li>
                        <li>Las relaciones, acuerdos o transacciones que se produzcan entre usuarios a través de la plataforma.</li>
                        <li>La veracidad, licitud o calidad de las ofertas de trabajo o formativas publicadas.</li>
                        <li>Daños indirectos, pérdida de beneficios o pérdida de datos derivados del uso o imposibilidad de uso del servicio.</li>
                        <li>El contenido de sitios web enlazados desde la plataforma.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">10/ Privacidad y cookies</h2>
                    <p className="legal-paragraph">
                        El tratamiento de tus datos personales se rige por nuestra <a href="/privacidad">Política de Privacidad ↗</a> y nuestra <a href="/cookies">Política de Cookies ↗</a>, que forman parte integrante de estos Términos y Condiciones. Te recomendamos leerlas detenidamente.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">11/ Legislación aplicable y jurisdicción</h2>
                    <p className="legal-paragraph">
                        Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia derivada de su interpretación o cumplimiento, las partes se someten a los Juzgados y Tribunales de Málaga, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
                    </p>
                    <p className="legal-paragraph">
                        Si eres consumidor residente en la Unión Europea, puedes acudir a la plataforma de resolución de litigios en línea de la Comisión Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr ↗</a>
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">12/ Contacto</h2>
                    <p className="legal-paragraph">Para cualquier consulta sobre estos términos:</p>
                    <ul className="legal-list">
                        <li><strong>Email:</strong> <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a></li>
                        <li><strong>Web:</strong> <a href="https://thefolder.es" target="_blank" rel="noopener noreferrer">https://thefolder.es ↗</a></li>
                    </ul>
                </section>

                <section>
                    <h2 className="legal-subtitle">13/ Historial de versiones</h2>
                    <ul className="legal-list">
                        <li><strong>Versión 1.0</strong> — Publicada en abril de 2026. Primera versión de los Términos y Condiciones de THEFOLDER.</li>
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default Terminos;