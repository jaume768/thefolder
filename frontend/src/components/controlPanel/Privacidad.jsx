import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './css/Privacidad.css';

const Privacidad = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="privacidad-container">
            <div className="privacidad-header">
                <button className="privacidad-back-button" onClick={goBack}>
                    <FaArrowLeft /> Volver
                </button>
            </div>
            
            <div className="privacidad-content">
                <h1 className="privacidad-title">Política de Privacidad y Protección de Datos</h1>
                <p className="privacidad-version">Actualizado: 20 de Mayo de 2025 Versión: 1.0</p>
                
                <section>
                    <h2 className="privacidad-subtitle">Lo primero: La información</h2>
                    <p className="privacidad-paragraph">
                        En cumplimiento con el Reglamento (UE) 2016/679, General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), TheFolderWorld informa al Usuario que todos los datos introducidos por el Usuario en sus Contenidos de Usuario, incluyendo el perfil profesional, la información destinada a formar parte del CV (currículum), fotografías publicadas en el portfolio, ofertas de trabajo publicadas por profesionales y ofertas educativas publicadas por instituciones, pasan a formar parte de la base de datos gestionada por el Responsable del Tratamiento. Dichos datos estarán sujetos a los fines y condiciones establecidos en la presente Política de Privacidad.
                    </p>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">¿Quién es el responsable del tratamiento de tus datos?</h2>
                    <p className="privacidad-paragraph">El Responsable del Tratamiento de tus datos personales es:</p>
                    <ul className="privacidad-list">
                        <li><strong>Nombre completo:</strong> Miriam Reina Bolaños</li>
                        <li><strong>DNI/NIF:</strong> 79042033A</li>
                        <li><strong>Dirección:</strong> Pasaje Robledano, nº3, San Pedro de Alcántara (Marbella), Málaga.</li>
                        <li><strong>Email de contacto:</strong> <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com</a></li>
                    </ul>
                    <p className="privacidad-paragraph">
                        Puedes ponerte en contacto con nosotros para cualquier duda relacionada con el tratamiento de tus datos a través del correo electrónico indicado.
                    </p>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">La finalidad del tratamiento</h2>
                    <p className="privacidad-paragraph">
                        TheFolderWorld es una plataforma profesional diseñada para conectar creativos con otros creativos, profesionales de la industria e instituciones educativas dentro del campo de la moda. La finalidad del tratamiento de los datos personales proporcionados por los usuarios incluye, pero no se limita a:
                    </p>
                    <ul className="privacidad-list">
                        <li><strong>Creación de perfiles profesionales:</strong> Los usuarios pueden crear perfiles profesionales para mostrar su portfolio y CV. Estos perfiles permiten a los usuarios acceder a ofertas de empleo publicadas por perfiles profesionales o acceder a ofertas educativas publicadas por instituciones educativas. Los usuarios también pueden compartir su CV con reclutadores a través de un enlace, facilitando la conexión con oportunidades profesionales o laborales. Esta información es abierta y libre para todos los usuarios dentro o fuera de la web.</li>
                        <li><strong>Conexión entre usuarios:</strong> Facilitar colaboraciones o contactos en proyectos de interés común, promoviendo la interacción profesional y creativa.</li>
                        <li><strong>Publicación de ofertas de trabajo y educativas:</strong> Profesionales e instituciones pueden publicar ofertas de trabajo y educativas para consulta de los usuarios registrados en la plataforma.</li>
                        <li><strong>Notificaciones informativas:</strong> TheFolder enviará notificaciones por email sobre el estado de las publicaciones, ofertas, cambios de contraseña y eventos relevantes, excluyendo interacciones sociales como nuevos seguidores.</li>
                        <li><strong>Interacciones sociales:</strong> Los usuarios pueden guardar publicaciones, ofertas de empleo o educativas de interés y organizar el contenido fotográfico en carpetas de acceso privado.</li>
                        <li><strong>Mejoras futuras:</strong> Podrían implementarse suscripciones de pago o verificación de identidad; actualmente, todas las funciones son gratuitas.</li>
                        <li><strong>Funciones premium futuras:</strong> En caso de implementarse, estarán disponibles bajo modalidad de pago.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">Responsabilidad de TheFolderWorld</h2>
                    <p className="privacidad-paragraph">
                        TheFolderWorld no se hace responsable de la contratación de personas ni actúa como intermediario en los acuerdos comerciales que los usuarios puedan formalizar entre sí tras el contacto a través de la plataforma. TheFolderWorld proporciona el espacio para la publicación de ofertas, pero no asume responsabilidad alguna respecto a la veracidad de las ofertas o la legalidad de los acuerdos alcanzados entre los usuarios.
                    </p>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">Responsabilidad del usuario sobre los contenidos publicados</h2>
                    <p className="privacidad-paragraph">
                        Los usuarios son plenamente responsables de la legalidad, veracidad y autenticidad del contenido que suben (imágenes, CVs, portfolios, etc.). TheFolderWorld ofrece el espacio para la publicación del contenido, pero no asume ninguna responsabilidad sobre los datos, imágenes o cualquier otro material que los usuarios suban. Los usuarios deberán garantizar que los contenidos publicados no infringen derechos de propiedad intelectual, derechos de privacidad, ni ninguna otra normativa aplicable. TheFolderWorld no se responsabiliza de las consecuencias derivadas de la publicación de contenido no autorizado o falso.
                        En caso de que un usuario publique contenido inapropiado o que infrinja las políticas de la plataforma, la responsabilidad recae directamente sobre dicho usuario. <br /> TheFolderWorld se reserva el derecho de suspender o eliminar el perfil infractor, sin que esto implique una exoneración de la responsabilidad del usuario respecto al contenido publicado. TheFolderWorld actúa exclusivamente como un medio para que los usuarios puedan contactar entre sí, conocer oportunidades y colaborar en proyectos. En ningún caso TheFolderWorld asume la responsabilidad de las negociaciones, acuerdos comerciales o pagos que los usuarios puedan realizar entre ellos como resultado del uso de la plataforma. TheFolderWorld no es responsable de los acuerdos que los usuarios lleguen a realizar ni de las consecuencias derivadas de estos acuerdos, ya que el único papel de la plataforma es ofrecer las herramientas necesarias para facilitar el contacto entre los usuarios.
                    </p>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">Verificación de identidad y perfil</h2>
                    <p className="privacidad-paragraph">
                        Aunque TheFolderWorld se reserva el derecho de verificar la identidad de los perfiles profesionales y de las instituciones en la plataforma, es importante señalar que esta verificación no implica una validación de las ofertas de empleo, colaboraciones u otros servicios profesionales publicados por los usuarios. La verificación tiene como única finalidad garantizar que las personas o instituciones registradas son quienes dicen ser. TheFolderWorld no se responsabiliza de la veracidad, fiabilidad ni la calidad de las ofertas de empleo, colaboraciones o cualquier otro tipo de contenido publicado en la plataforma.
                    </p>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">No intervención en acuerdos comerciales</h2>
                    <p className="privacidad-paragraph">
                        TheFolderWorld actúa como un puente para facilitar que los usuarios encuentren oportunidades de trabajo, colaboraciones o intercambios de servicios, pero no interviene en los acuerdos comerciales ni se hace responsable de los pagos, negociaciones o contratos entre los usuarios. TheFolderWorld proporciona las herramientas necesarias para el contacto y la visualización de ofertas, pero no es parte de las negociaciones ni de los acuerdos que puedan surgir entre los usuarios. TheFolderWorld no asume ninguna responsabilidad sobre los acuerdos comerciales o las consecuencias derivadas de ellos.
                    </p>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">¿Qué nos permite recoger estos datos? La base legitimadora</h2>
                    <p className="privacidad-paragraph"> El tratamiento de los datos personales se lleva a cabo con base en las siguientes bases legales que legitiman su recopilación y uso:</p>
                    <ul className="privacidad-list">
                        <li><strong>Consentimiento del Usuario:</strong> Al registrarse, el Usuario da su consentimiento expreso para el tratamiento de sus datos. Artículo 6.1 a) del Reglamento (UE) 2016/679 (RGPD).</li>
                        <li><strong>Ejecución de un contrato:</strong> El registro formaliza un contrato para el uso de los servicios. Artículo 6.1 b) del Reglamento (UE) 2016/679 (RGPD).</li>
                        <li><strong>Intereses legítimos de TheFolder:</strong> garantizar el funcionamiento de la plataforma, asegurando que se cumplan las normas internas, moderando el contenido y proporcionando una experiencia de usuario óptima y segura. Artículo 6.1 f) del Reglamento (UE) 2016/679 (RGPD).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="privacidad-subtitle">¿Qué información almacenamos sobre ti?</h2>
                    <h3 className="privacidad-subtitle-small">Información general de los usuarios</h3>
                    <p className="privacidad-paragraph">La siguiente es una lista de la información que TheFolderWorld puede almacenar sobre sus usuarios, dependiendo del tipo de perfil (personal, profesional o institucional) y de los datos que cada usuario haya decidido proporcionar:</p>
                    <ul className="privacidad-list">
                        <li>Nombre y apellidos (si se proporcionan).</li>
                        <li>Fecha de nacimiento.</li>
                        <li>Correo electrónico.</li>
                        <li>Nombre de usuario.</li>
                        <li>País, región y ciudad.</li>
                        <li>Versión cifrada de la contraseña.</li>
                        <li>Biografía personal (texto que introduces en tu perfil) y enlaces que decidas compartir, como tu página web personal.</li>
                        <li>Tu posición o rol profesional, como "estudiante", "freelance", "fotógrafo", "maquillador", etc.</li>
                        <li>Enlaces a redes sociales como Facebook, Instagram, X (Twitter), LinkedIn, entre otras, si los proporcionas.</li>
                        <li>Preferencias de perfil específicas según el tipo de usuario. Por ejemplo, un fotógrafo puede indicar si trabaja en moda, retrato, publicidad, etc., o si está disponible para viajar.</li>
                        <li>Preferencias de perfil según tipo de usuario (teléfono de contacto, geolocalización, etc.).</li>
                        <li>Archivos del portfolio (imágenes, vídeos, títulos, descripciones, etiquetas, carpetas).</li>
                        <li>Datos técnicos (fecha creación de cuenta, última conexión, etc.).</li>
                    </ul>

                    <h3 className="privacidad-subtitle-small">Información sobre el CV del usuario</h3>
                    <p className="privacidad-paragraph">
                        Si decides compartirlo, TheFolderWorld almacena tu CV completo:</p>
                    <ul className="privacidad-list">
                        <li>Texto escrito por el usuario que puede incluir su descripción profesional, conocimientos, habilidades, idiomas hablados, y cualquier otro detalle relevante que decidan agregar.</li>
                        <li>Estudios académicos que hayan completado, junto con las fechas y las instituciones correspondientes.</li>
                        <li>Recorrido profesional que describe su experiencia laboral, incluyendo los empleos previos, los roles desempeñados y las fechas correspondientes.</li>
                        <li>Proyectos, colaboraciones o trabajos realizados, si el usuario decide incluirlos en su Portfolio como material fotográfico.</li>
                    </ul>

                    <h3 className="privacidad-subtitle-small">Información técnica y de seguridad</h3>
                    <ul className="privacidad-list">
                        <li>Dirección IP de acceso.</li>
                        <li>Tipo y versión de navegador.</li>
                    </ul>
                    
                    <h3 className="privacidad-subtitle-small">Verificación de perfiles profesionales o institucionales</h3>
                    <p className="privacidad-paragraph">
                        Cuando un usuario desea obtener un perfil profesional o institucional verificado, TheFolderWorld solicita el envío de cierta documentación al correo electrónico oficial. No se utilizan servicios externos ni se recopilan documentos de identidad personales. La información que solicitamos, y que almacenamos con el único propósito de verificar la autenticidad del perfil, incluye:
                    </p>
                    <ul className="privacidad-list">
                        <li>Nombre legal de la empresa o institución.</li>
                        <li>Número de identificación fiscal.</li>
                        <li>Documento oficial que acredite la existencia de la empresa o institución.</li>
                        <li>Nombre completo de la persona que envía la solicitud.</li>
                        <li>Enlace al sitio web oficial y/o redes sociales activas.</li>
                    </ul>
                    <p className="privacidad-paragraph">Estos datos son revisados por el equipo de administración para comprobar la veracidad del perfil antes de permitir la publicación de ofertas laborales o educativas.</p>
                    
                    <h3 className="privacidad-subtitle-small">Actividades dentro de la plataforma</h3>
                    <p className="privacidad-paragraph">Para ofrecer una experiencia personalizada y funcional, TheFolderWorld almacena información sobre las acciones que realizas, como:</p>
                    <ul className="privacidad-list">
                        <li>Guardado de fotos o publicaciones.</li>
                        <li>Creación de carpetas o colecciones privadas.</li>
                        <li>Menciones y etiquetado de usuarios.</li>
                        <li>Historial de interacciones.</li>
                    </ul>
                </section>
                
                <section>
                    <h2 className="privacidad-subtitle">Usuarios menores de edad</h2>
                    <p className="privacidad-paragraph">
                        Los menores de 18 años deben enviar autorización firmada por padres o tutores legales; TheFolderWorld almacena este documento como medida de cumplimiento.
                        En cumplimiento con la regulación europea del GDPR, los usuarios menores de 16 años deben obtener el consentimiento expreso de sus padres o tutores legales para poder utilizar TheFolderWorld. Sin embargo, en TheFolderWorld, el límite de edad para requerir la autorización de un tutor es de 18 años.
                        Si eres menor de 18 años, es obligatorio presentar la autorización por escrito de uno de tus padres o de tu tutor legal para poder registrarte y utilizar los servicios de TheFolderWorld. Esta autorización será almacenada en nuestra base de datos como parte del proceso de verificación.
                    </p>
                </section>
                
                <section>
                    <h2 className="privacidad-subtitle">Reportes y reclamaciones</h2>
                    <p className="privacidad-paragraph">
                        Cuando se reporta contenido o se reclama publicación sin consentimiento, TheFolderWorld almacena detalles del reporte, explicaciones, lista de contenidos y pruebas adjuntas.
                    </p>
                </section>
                
                <section>
                    <h2 className="privacidad-subtitle">Publicación y gestión de ofertas</h2>
                    <p className="privacidad-paragraph">
                        Los perfiles profesionales o institucionales pueden publicar ofertas de empleo o educativas; se almacena toda la información, así como las imágenes adjuntas.
                    </p>
                </section>
                
                <section>
                    <h2 className="privacidad-subtitle">Uso de cookies</h2>
                    <p className="privacidad-paragraph">
                        TheFolderWorld utiliza cookies con fines técnicos y de seguridad. Las cookies nos permiten:
                    </p>
                    <ul className="privacidad-list">
                        <li>Identificar al usuario de forma segura cuando se conecta.</li>
                        <li>Garantizar que solo el titular de la cuenta pueda acceder a ella.</li>
                        <li>Almacenar el identificador de sesión, manteniéndote logueado mientras navegas.</li>
                    </ul>
                </section>
                
                <section>
                    <h2 className="privacidad-subtitle">Tus derechos</h2>
                    <p className="privacidad-paragraph">
                        Tienes el derecho de gestionar y controlar los datos que almacenamos sobre ti de acuerdo con la legislación vigente. A continuación, te detallamos tus derechos relacionados con el tratamiento de tus datos personales:
                    </p>
                    <p className="privacidad-paragraph">
                        Puedes ejercer todos estos derechos de forma sencilla, accediendo a tu cuenta o contactandonos a través del correo electrónico <a href="mailto:thefolderworld@gmail.com">thefolderworld@gmail.com</a>.
                        En caso de que consideres que no hemos tratado tus datos de acuerdo con la normativa, tienes el derecho a presentar una reclamación ante la Agencia Española de Protección de Datos o ante la autoridad competente en materia de protección de datos.
                    </p>
                </section>
                
                <section>
                    <h2 className="privacidad-subtitle">Aceptación de esta política</h2>
                    <p className="privacidad-paragraph">
                        Al registrarte en TheFolderWorld, deberás marcar la casilla de aceptación de esta Política de Privacidad para poder completar tu alta en la plataforma.
                        Al continuar utilizando TheFolderWorld, aceptas expresamente las condiciones establecidas en esta Política de Privacidad.
                        En caso de que realicemos cambios significativos en esta política, te notificaremos por correo electrónico. Además, la próxima vez que accedas a tu cuenta, serás informado de las actualizaciones y deberás leer, comprender y aceptar las nuevas condiciones para poder seguir utilizando los servicios de TheFolderWorld.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacidad;
