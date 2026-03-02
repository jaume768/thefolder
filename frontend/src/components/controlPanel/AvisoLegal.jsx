import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './css/AvisoLegal.css';

const AvisoLegal = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="avisolegal-container">
            <div className="avisolegal-header">
                <button className="avisolegal-back-button" onClick={goBack}>
                    <FaArrowLeft /> Volver
                </button>
            </div>
            
            <div className="avisolegal-content">
                <h1 className="avisolegal-title">Aviso Legal</h1>
                <p className="avisolegal-version">Actualizado: 20 de Mayo de 2025 Versión: 1.0</p>
                
                <p className="avisolegal-paragraph">
                    El presente documento constituye el Aviso Legal y las Condiciones de Uso de TheFolderWorld, y regula la relación entre esta plataforma y las personas usuarias del servicio. TheFolderWorld pone a disposición de sus usuarios las presentes Condiciones de Uso, cumpliendo con lo establecido en la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), así como con las obligaciones previstas en el Reglamento (UE) 2016/679, Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
                    Estas condiciones estarán vigentes y serán aplicables en tanto permanezcan accesibles desde la presente página web. La versión actual del Aviso Legal ha sido actualizada con fecha 20 de mayo de 2025. Las versiones anteriores, en su caso, pueden consultarse en el apartado correspondiente al final del documento.
                </p>

                <section>
                    <h2 className="avisolegal-subtitle">Titularidad de thefolder.world y datos en cumplimiento de la Ley LSSI</h2>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld es un servicio web prestado por Miriam Reina Bolaños, con DNI 79042033A, cuya dirección fiscal y de contacto se encuentra en Pasaje Robledano, nº3, San Pedro de Alcántara (Marbella), Málaga.
                        Puedes contactar con la titular del servicio a través del correo electrónico: thefolderworld@gmail.com
                        TheFolderWorld es un proyecto personal y no representa a una entidad mercantil con personalidad jurídica propia. No se ofrece ningún servicio de pago ni se realizan transacciones económicas a través de la plataforma.
                    </p>
                </section>

                <section>
                    <h2 className="avisolegal-subtitle">Aceptación y modificación de las Condiciones de Uso</h2>
                    <p className="avisolegal-paragraph">
                        La condición de Usuario se adquiere mediante el mero acceso a cualquiera de los servicios disponibles en thefolder.world; la condición de Usuario Registrado se adquiere necesariamente mediante el proceso de registro. Ambas condiciones implican la aceptación expresa de este Aviso Legal. La aceptación del presente Aviso Legal implica que el Usuario ha leído, comprendido y aceptado su contenido en su totalidad. Las condiciones recogidas en este documento serán de aplicación desde el momento en que el Usuario acceda al sitio web o complete el proceso de registro, y su cumplimiento será exigible incluso después de que cese la condición de Usuario o Usuario Registrado, cuando así lo determine la normativa vigente o se establezca expresamente en el presente documento. TheFolderWorld se reserva el derecho a modificar este Aviso Legal en cualquier momento, por razones justificadas como la adaptación a cambios normativos, mejoras técnicas o modificaciones en el servicio ofrecido. Cualquier cambio relevante será comunicado a los Usuarios Registrados a la mayor brevedad posible. El Usuario puede solicitar en cualquier momento la cancelación de su cuenta y la baja como Usuario Registrado, enviando un correo electrónico a la dirección: thefolderworld@gmail.com. Actualmente no existe un sistema automatizado de baja directa desde la plataforma, aunque este podrá implementarse en futuras versiones del servicio. En caso de modificación del presente Aviso Legal, su nueva versión será publicada en la página web. Los Usuarios Registrados recibirán una notificación por correo electrónico y deberán aceptar las nuevas condiciones en su siguiente acceso. En caso de no aceptarlas, se procederá a la cancelación de su cuenta como Usuario Registrado.
                    </p>
                </section>
                
                <section>
                    <h2 className="avisolegal-subtitle">Servicios</h2>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld es una plataforma digital que facilita la creación, publicación y descubrimiento de creativos y entusiastas del campo del diseño y la moda. A través de su sitio web, los Usuarios pueden compartir contenido, crear perfiles públicos, interactuar entre ellos y acceder a oportunidades relacionadas con empleo y formación, con el objetivo de fomentar la colaboración y la visibilidad profesional.
                    </p>
                
                    <h3 className="avisolegal-subtitle-small">Publicación de contenido</h3>
                    <p className="avisolegal-paragraph">
                        Los Usuarios Registrados pueden crear sus perfiles profesionales, añadir información relevante en su CV, publicar fotos en el apartado de portofolio, incluir enlaces, imágenes, materiales descargables u otro contenido útil, respetando siempre lo establecido en las Condiciones de Uso y en la Política de Privacidad.
                        Cada información o material compartido por el usuario se realiza de forma pública y puede ser visualizada por otros Usuarios y por visitantes no registrados. TheFolderWorld proporciona herramientas para facilitar la difusión del contenido y su descubrimiento, sin intervenir en la autoría ni editar el contenido aportado por los usuarios, a menos de previo aviso.
                        TheFolderWorld no se hace responsable de los contenidos publicados, pero se reserva el derecho a eliminar cualquier material que infrinja derechos de autor, sea inapropiado o contravenga las condiciones de uso de la plataforma.
                    </p>

                    <h3 className="avisolegal-subtitle-small">Publicación de ofertas de empleo y formaciones</h3>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld permite a ciertos usuarios profesionales publicar en la plataforma oportunidades laborales, colaborativas o de formación, incluyendo talleres, cursos, convocatorias, eventos y similares.
                        Estas publicaciones están hechas por los propios usuarios y son de su exclusiva responsabilidad. TheFolderWorld no obtiene ningún beneficio económico por su publicación ni actúa como intermediario, y por tanto no garantiza ni puede verificar la veracidad, licitud, calidad ni actualidad de dichas ofertas.
                        Recomendamos a los usuarios interesados que realicen sus propias verificaciones antes de comprometerse con cualquier oferta publicada a través de la plataforma.
                    </p>

                    <h3 className="avisolegal-subtitle-small">Servicios gratuitos</h3>
                    <p className="avisolegal-paragraph">
                        Todos los servicios ofrecidos actualmente en TheFolderWorld son totalmente gratuitos para los Usuarios, tanto en su versión básica como en las funcionalidades actuales avanzadas. No existen, en el momento de redacción de este documento, suscripciones de pago ni servicios adicionales con coste económico.
                        Cualquier futura incorporación de servicios de pago será debidamente comunicada a los usuarios, junto con sus condiciones específicas, y siempre requerirá aceptación expresa.
                    </p>
                </section>

                <section>
                    <h2 className="avisolegal-subtitle">Limitación de responsabilidad</h2>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld no se hace responsable del contenido que publican los usuarios en sus perfiles. En particular, no se garantiza la veracidad, legalidad, utilidad o adecuación de las ofertas de trabajo o formación, ni se asume ninguna obligación de verificar o moderar dicho contenido más allá de lo legalmente exigible.
                        En caso de detectar un uso indebido o fraudulento, cualquier usuario puede informar al equipo de TheFolderWorld, que se reserva el derecho de eliminar el contenido o cancelar la cuenta implicada.
                        TheFolderWorld no asume responsabilidad alguna sobre los contenidos generados o compartidos por los usuarios. Sin embargo, la plataforma podrá actuar si se detectan comportamientos ilegales, fraudulentos o inapropiados, conforme a la legislación vigente.
                    </p>
                </section>

                <section>
                    <h2 className="avisolegal-subtitle">Tipologías de Usuario admitidas</h2>
                    <p className="avisolegal-paragraph">
                        En TheFolder, sólo pueden registrarse personas físicas o jurídicas cuya actividad esté relacionada con el diseño, la moda, la creatividad, la producción o la gestión cultural, tanto a nivel profesional como formativo.
                        Las tipologías de usuario admitidas incluyen, entre otras:
                    </p>
                    <ul className="avisolegal-list">
                        <li>Estudiantes o graduados, así como futuros estudiantes menores de edad con previa autorización paternal.</li>
                        <li>Diseñadores/as de moda, estilistas y creativos/as multidisciplinares relacionados con el ámbito de la moda.</li>
                        <li>Marcas y estudios de diseño.</li>
                        <li>Instituciones educativas vinculadas al diseño y la moda.</li>
                        <li>Productoras y promotores culturales.</li>
                        <li>Profesionales de la comunicación especializada.</li>
                        <li>Tiendas, showrooms y plataformas de difusión cultural.</li>
                        <li>Fotógrafos/as, estilistas, modelos y otros perfiles técnicos únicamente cuando su actividad esté vinculada a proyectos editoriales, de diseño o moda y guarde coherencia con la finalidad de la plataforma.</li>
                    </ul>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld se reserva el derecho de revisar, aceptar o rechazar cualquier solicitud de registro si el perfil no se ajusta a los propósitos de la comunidad.
                    </p>
                </section>

                <section>
                    <h2 className="avisolegal-subtitle">Condiciones comunes para los usuarios registrados</h2>
                    <p className="avisolegal-paragraph">
                        Para formar parte de TheFolderWorld como usuario registrado, es imprescindible cumplir con las siguientes condiciones:
                    </p>
                    <ul className="avisolegal-list">
                        <li>Leer, comprender y aceptar el Aviso legal y la Política de privacidad, así como cumplir sus condiciones en todo momento.</li>
                        <li>Pertenecer a una o varias de las tipologías de usuario admitidas.</li>
                        <li>Actuar de forma ética, profesional y conforme a la ley, respetando las normas básicas de convivencia, diversidad y respeto propias del entorno cultural y creativo.</li>
                        <li>Ser mayor de edad según la legislación del país de residencia (mínimo 18 años), o contar con autorización expresa y documentada por parte del tutor legal en caso contrario, siguiendo el procedimiento que TheFolderWorld indique.</li>
                        <li>No estar vinculado a actividades que contradigan los fines de la plataforma, como por ejemplo:
                            <ul className="avisolegal-sublist">
                                <li>Producción o promoción de contenidos de carácter erótico, sexual o explícito.</li>
                                <li>Servicios relacionados con la captación, representación o difusión de perfiles fuera del ámbito del diseño, la moda o la cultura.</li>
                                <li>Actividades ilícitas, discriminatorias o contrarias a los derechos fundamentales de las personas.</li>
                            </ul>
                        </li>
                    </ul>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld podrá verificar la identidad o trayectoria profesional de los usuarios registrados, así como la veracidad de la información compartida, para garantizar la fiabilidad de la comunidad.
                    </p>
                </section>

                <section>
                    <h2 className="avisolegal-subtitle">Legislación aplicable y jurisdicción</h2>
                    <p className="avisolegal-paragraph">
                        Las condiciones de uso de TheFolderWorld y cualquier relación que pudiera derivarse del acceso o uso de nuestros servicios están regidas por la legislación española.
                        En caso de conflicto, desacuerdo o controversia entre un usuario y TheFolderWorld, ambas partes acuerdan someterse a los Juzgados y Tribunales de Barcelona capital, renunciando expresamente a cualquier otro fuero que pudiera corresponder.
                    </p>
                </section>

                <section>
                    <h2 className="avisolegal-subtitle">Histórico de versiones, actualizaciones y modificaciones</h2>
                    <p className="avisolegal-paragraph">
                        TheFolderWorld se reserva el derecho de modificar el contenido del presente Aviso Legal en cualquier momento, con el fin de adaptarlo a cambios legislativos, mejoras en la plataforma o decisiones internas que afecten al funcionamiento de nuestros servicios.
                        Las actualizaciones del texto se harán efectivas desde el momento de su publicación en esta misma página, y se informará de cualquier cambio significativo a través de los medios que se consideren adecuados.
                        Recomendamos revisar este Aviso Legal de forma periódica para mantenerse al tanto de posibles modificaciones.
                        A continuación, se recoge un histórico de versiones aplicadas:
                    </p>
                    <ul className="avisolegal-list">
                        <li><strong>Versión 1.0</strong> - Publicada el 20 de Mayo de 2025, versión original del Aviso Legal.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default AvisoLegal;
