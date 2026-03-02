import React from 'react';
import './css/About.css';

const About = () => {
    return (
        <div className="about-container">
            
            <div className="about-content">
                <div className="about-section">
                    <div className="about-text">
                        <h1>Sobre TheFolder</h1>
                        TheFolder nace como respuesta a la <b>falta de visibilidad que enfrentan los creativos al terminar sus estudios.</b>
                        <br />Cada año se generan proyectos con un enorme valor creativo que, por falta de difusión o conexiones, nunca llegan a ser descubiertos, impulsados o reconocidos por la industria. Muchos se quedan relegados a un perfil con pocos seguidores, a un proyecto final que no sale de las aulas o a un desfile con cobertura limitada a familiares.
                    </div>
                    <div className="about-image">
                        <img src="/multimedia/about-polas-ManelAbella-2.png" alt="Creativos trabajando" />
                    </div>
                </div>

                <div className="about-section">
                    <div className="about-text">
                        Aquí, <b>tu perfil se convierte en tu carpeta profesional.</b> Una plataforma conectada directamente con la industria, donde subir una imagen significa presentarla ante el mundo profesional, sin intermediarios ni algoritmos que limiten tu alcance.<br /><br />
                        En TheFolder, <b>el talento se celebra, se proyecta y se conecta con el sector profesional, en un entorno diseñado especialmente para la moda y el diseño emergente.</b>
                    </div>
                    <div className="about-image">
                        <img src="/multimedia/about-polas-ManelAbella.png" alt="Diseño y moda" />
                    </div>
                </div>

                <div className="about-section">
                    <div className="about-text">
                        <strong>¿Cómo?</strong><br />
                        Un espacio único que <b>reúne portfolios, CVs, ofertas laborales y educativas, con herramientas avanzadas para filtrar talento y oportunidades.</b><br /><br />
                        <strong>¿Por qué?</strong><br />
                        Porque el talento emergente en moda y diseño merece una <b>oportunidad real para proyectarse hacia la industria,</b> sin depender de algoritmos, contactos o ubicación.<br /><br />
                        <strong>Contacto</strong><br />
                        <a href="mailto:thefolderworld@gmail.com" className="about-contact">thefolderworld@gmail.com</a>
                    </div>
                    <div className="about-image">
                        <img src="/multimedia/about-polas-ManelAbella-3.png" alt="Portafolio y trabajo" />
                    </div>
                </div>

                <p className="about-photo-autor">
                    Fotografías de <a href="https://instagram.com/manel.png" target="_blank" rel="noopener noreferrer">@manel.png</a>
                </p>
            </div>
        </div>
    );
};

export default About;
