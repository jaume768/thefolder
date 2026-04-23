import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../components/controlPanel/css/Legal.css';

const AvisoLegal = () => {
    const { t } = useTranslation('legal');
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1 className="legal-title">{t('avisoLegal.title')}</h1>
                <p className="legal-version">{t('avisoLegal.version')}</p>

                <p className="legal-paragraph">
                    El presente documento constituye el Aviso Legal de THEFOLDER y regula la relación entre la plataforma y las personas usuarias del servicio. THEFOLDER cumple con lo establecido en la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), el Reglamento (UE) 2016/679, Reglamento General de Protección de Datos (RGPD), y la Ley Orgánica 3/2018, de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD).
                </p>

                <section>
                    <h2 className="legal-subtitle">1/ Titularidad del servicio</h2>
                    <p className="legal-paragraph">
                        THEFOLDER es un servicio web prestado por Miriam Reina Bolaños, con domicilio en Málaga, 29670, España.
                    </p>
                    <p className="legal-paragraph">
                        Correo electrónico de contacto: <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a><br />
                        Sitio web: <a href="https://thefolder.es" target="_blank" rel="noopener noreferrer">https://thefolder.es ↗</a>
                    </p>
                    <p className="legal-paragraph">
                        THEFOLDER es un proyecto personal y no representa a una entidad mercantil con personalidad jurídica propia. Actualmente no se ofrece ningún servicio de pago ni se realizan transacciones económicas a través de la plataforma.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">2/ Aceptación de las condiciones de uso</h2>
                    <p className="legal-paragraph">
                        El acceso a THEFOLDER implica la aceptación de este Aviso Legal. El registro como usuario registrado implica además la aceptación expresa de la Política de Privacidad y la Política de Cookies.
                    </p>
                    <p className="legal-paragraph">
                        THEFOLDER se reserva el derecho a modificar este Aviso Legal en cualquier momento, por razones justificadas como la adaptación a cambios normativos, mejoras técnicas o modificaciones en el servicio. Los cambios relevantes serán comunicados a los usuarios registrados por correo electrónico. Si no aceptas las nuevas condiciones, puedes cancelar tu cuenta escribiéndonos a <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a>.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">3/ Descripción del servicio</h2>
                    <p className="legal-paragraph">
                        THEFOLDER es una plataforma digital de portfolios y directorio profesional para creativos del sector de la moda. A través de la plataforma, los usuarios pueden crear perfiles públicos, publicar proyectos, acceder a un directorio de profesionales y consultar ofertas de trabajo y formación.
                    </p>

                    <h3 className="legal-subtitle-small">Publicación de contenido</h3>
                    <p className="legal-paragraph">
                        Los usuarios registrados pueden crear su perfil profesional, publicar proyectos con imágenes y descripciones, subir su CV y portfolio, e incluir enlaces a sus redes sociales y trabajos externos. Todo el contenido publicado es de carácter público y puede ser visualizado por cualquier persona, registrada o no.
                    </p>
                    <p className="legal-paragraph">
                        THEFOLDER no interviene en la autoría ni edita el contenido publicado por los usuarios, pero se reserva el derecho a retirar cualquier material que infrinja derechos de terceros, sea ilegal o contravenga estas condiciones de uso.
                    </p>

                    <h3 className="legal-subtitle-small">Publicación de ofertas de empleo y formación</h3>
                    <p className="legal-paragraph">
                        Las cuentas de empresa pueden publicar ofertas de trabajo y oportunidades formativas. Estas publicaciones son responsabilidad exclusiva de quien las publica. THEFOLDER no verifica la veracidad, licitud ni actualidad de dichas ofertas y no actúa como intermediario laboral. Recomendamos a los usuarios interesados que realicen sus propias verificaciones antes de comprometerse con cualquier oferta.
                    </p>

                    <h3 className="legal-subtitle-small">Servicios gratuitos</h3>
                    <p className="legal-paragraph">
                        Todos los servicios disponibles actualmente en THEFOLDER son gratuitos. No existen suscripciones de pago ni servicios con coste económico. Cualquier futura incorporación de servicios de pago será comunicada con antelación y requerirá aceptación expresa.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">4/ Requisitos para el registro</h2>
                    <p className="legal-paragraph">
                        Para registrarse en THEFOLDER es necesario:
                    </p>
                    <ul className="legal-list">
                        <li>Tener al menos 16 años. Si eres menor de 16, necesitas autorización de tus padres o tutores legales.</li>
                        <li>Proporcionar información veraz y actualizada.</li>
                        <li>Verificar tu dirección de correo electrónico mediante el código enviado al registrarte.</li>
                        <li>Leer y aceptar este Aviso Legal, la Política de Privacidad y la Política de Cookies.</li>
                        <li>Desarrollar una actividad vinculada al sector de la moda, el diseño, la fotografía, la dirección de arte, la comunicación de moda u otras disciplinas creativas afines.</li>
                    </ul>
                    <p className="legal-paragraph">
                        THEFOLDER se reserva el derecho a rechazar solicitudes de registro que no se ajusten a los propósitos de la plataforma.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">5/ Normas de uso y contenido prohibido</h2>
                    <p className="legal-paragraph">
                        Los usuarios se comprometen a hacer un uso lícito, ético y responsable de la plataforma. Queda estrictamente prohibido:
                    </p>
                    <ul className="legal-list">
                        <li>Publicar contenido falso, engañoso o que suplante la identidad de otra persona.</li>
                        <li>Infringir derechos de propiedad intelectual o industrial de terceros.</li>
                        <li>Publicar material sexual explícito o pornográfico.</li>
                        <li>Incitar al odio, la discriminación o la violencia por cualquier razón.</li>
                        <li>Realizar spam o publicidad no solicitada.</li>
                        <li>Publicar imágenes de terceras personas sin su consentimiento.</li>
                        <li>Introducir malware, virus u otro código malicioso.</li>
                    </ul>
                    <p className="legal-paragraph">
                        El incumplimiento de estas normas podrá dar lugar a la retirada del contenido y a la cancelación de la cuenta sin previo aviso.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">6/ Propiedad intelectual</h2>
                    <p className="legal-paragraph">
                        El usuario mantiene la titularidad de los derechos sobre el contenido que publica. Al publicarlo en THEFOLDER, concede a la plataforma una licencia no exclusiva y gratuita para mostrarlo y distribuirlo dentro del servicio con el único fin de su correcto funcionamiento. Esta licencia no autoriza ningún otro uso sin consentimiento expreso del autor.
                    </p>
                    <p className="legal-paragraph">
                        El diseño, código, marca, logotipo y demás elementos de THEFOLDER son propiedad de Miriam Reina Bolaños y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial. Queda prohibida su reproducción o explotación sin autorización escrita previa.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">7/ Limitación de responsabilidad</h2>
                    <p className="legal-paragraph">
                        THEFOLDER actúa como prestador de servicios de alojamiento conforme al artículo 16 de la LSSI-CE y no tiene obligación general de supervisar el contenido publicado por los usuarios. Sin embargo, actuará con diligencia ante contenidos ilegales o que vulneren derechos de terceros cuando tenga conocimiento efectivo de ello.
                    </p>
                    <p className="legal-paragraph">
                        THEFOLDER no será responsable de los daños derivados del uso o imposibilidad de uso del servicio, del contenido publicado por usuarios, ni de las relaciones o acuerdos que se produzcan entre usuarios a través de la plataforma.
                    </p>
                    <p className="legal-paragraph">
                        Si detectas un uso indebido o contenido inapropiado, puedes reportarlo a <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com ↗</a>.
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">8/ Legislación aplicable y jurisdicción</h2>
                    <p className="legal-paragraph">
                        Este Aviso Legal se rige por la legislación española. Para cualquier controversia derivada de su interpretación o cumplimiento, las partes se someten a los Juzgados y Tribunales de Málaga, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
                    </p>
                    <p className="legal-paragraph">
                        Si eres consumidor residente en la Unión Europea, puedes acudir a la plataforma de resolución de litigios en línea de la Comisión Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr ↗</a>
                    </p>
                </section>

                <section>
                    <h2 className="legal-subtitle">9/ Historial de versiones</h2>
                    <ul className="legal-list">
                        <li><strong>Versión 1.0</strong> — Publicada el 20 de mayo de 2025. Versión original.</li>
                        <li><strong>Versión 2.0</strong> — Publicada en abril de 2026. Revisión general: actualización de nombre comercial a THEFOLDER, corrección de jurisdicción, eliminación de datos personales innecesarios, unificación de edad mínima a 16 años, adecuación al dominio thefolder.es.</li>
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default AvisoLegal;
