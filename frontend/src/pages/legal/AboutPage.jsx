import React from 'react';
import '../../components/landing/css/landing-styles.css';
import '../../components/landing/css/landing-about.css';

// Contenido en lorem ipsum a propósito — placeholder mientras se redacta el
// texto real (ver conversación: página rediseñada con el look del landing,
// mismo /about de siempre, contenido pendiente).
const About = () => {
    return (
        <div className="tf-about">
            <div className="tf-about__inner">
                <h1 className="tf-h1 tf-about__title">ABOUT US</h1>
                <p className="tf-sub tf-about__lead">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua.
                </p>

                <img
                    className="tf-about__photo"
                    src="/multimedia/landing/index/about.jpg"
                    alt=""
                />

                <div className="tf-about__body">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                        accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab
                        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
                        explicabo.
                    </p>
                    <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
                        fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
                        sequi nesciunt.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
