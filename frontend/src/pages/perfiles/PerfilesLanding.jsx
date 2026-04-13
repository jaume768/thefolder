import React, { useEffect, useState } from 'react';
import './PerfilesLanding.css';

// ─── PLACEHOLDER IMAGES ───────────────────────────────────────────────────────
// Sustituye estas URLs por las imágenes reales de cada sección.
// profesionales: 4 imágenes en fila
// emergente: 3 imágenes en fila (más grandes)
// estudiantes: 1 imagen destacada a la derecha

const IMAGES = {
  profesionales: [
    '/multimedia/perfiles-landing/perfiles-1.jpg',
    '/multimedia/perfiles-landing/perfiles-2.jpg',
    '/multimedia/perfiles-landing/perfiles-3.jpg',
    '/multimedia/perfiles-landing/perfiles-4.jpg',
  ],
  emergente: [
    '/multimedia/perfiles-landing/perfiles-5.png',
    '/multimedia/perfiles-landing/perfiles-6.jpg',
    '/multimedia/perfiles-landing/perfiles-7.png',
  ],
  estudiantes: [
    '/multimedia/perfiles-landing/perfiles-10.jpg',
    '/multimedia/perfiles-landing/perfiles-9.jpg',
  ],
};

// ─── CONTADOR PLACEHOLDER ─────────────────────────────────────────────────────
// Cuando tengas los datos reales, pasa el count como prop o desde tu API.
const COUNT_PLACEHOLDER = 16;

// ─── SECCIONES ────────────────────────────────────────────────────────────────
const SECCIONES = [
  {
    id: 'profesionales',
    titulo: 'PROFESIONALES',
    subtitulo: 'Identidad definida, trayectoria consolidada, criterio propio.',
    descripcion: 'Haz que todo lo que ya has construido conviva en un mismo perfil recorrido profesional, redes, portfolio, colaboraciones. Aparece en el directorio donde la industria busca talento y úsalo como punto de referencia para encontrar equipo, ampliar tu red y ser visible para las nuevas generaciones que buscan referentes en la industria.',
    images: IMAGES.profesionales,
    imageLayout: 'row-4',
    countKey: 'professional',
  },
  {
    id: 'emergente',
    titulo: 'EMERGENTE',
    subtitulo: 'Proyectos propios, dirección creativa en construcción.',
    descripcion: 'El directorio donde la industria descubre talento nuevo. Haz que tus primeros proyectos convivan en un mismo perfil portfolio, recorrido, redes, colaboraciones y deja que te encuentren. Conecta con otros creativos, amplía tu red y llega a las agencias y marcas que necesitas para dar el siguiente paso.',
    images: IMAGES.emergente,
    imageLayout: 'row-3',
    countKey: 'emerging',
  },
  {
    id: 'estudiantes',
    titulo: 'ESTUDIANTES Y GRADUADOS',
    subtitulo: 'En formación o recién graduado, buscando tu lugar en la industria.',
    descripcion: 'Publica tus primeros proyectos y déjate descubrir por la industria. Observa cómo se presentan los creativos que ya están donde tú quieres estar, inspírate y construye tu propio perfil con lo que tienes ahora. Tu perfil en THEFOLDER es todo lo que necesitas para profesionalizar tu portfolio y tu CV — y presentarte ante la industria sin distracciones.',
    images: IMAGES.estudiantes,
    imageLayout: 'row-1',
    countKey: 'students',
  },
];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

const PerfilesLanding = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/counts-by-level`)
      .then((r) => r.json())
      .then((data) => setCounts(data))
      .catch(() => {});
  }, []);

  return (
    <div className="paraquien-page">
      {SECCIONES.map((seccion) => (
        <section key={seccion.id} className={`paraquien-seccion paraquien-seccion--${seccion.id}`}>

          {/* COLUMNA IZQUIERDA: texto */}
          <div className="paraquien-texto">
            <div className="paraquien-main">
              <div className="paraquien-titulo-wrapper">
                <h2 className="paraquien-titulo">{seccion.titulo}</h2>
                {counts[seccion.countKey] != null && (
                  <span className="paraquien-contador">[{counts[seccion.countKey]}]</span>
                )}
              </div>
              <p className="paraquien-descripcion">{seccion.descripcion}</p>
            </div>
            <div className="paraquien-subtitulo-wrapper">
              <p className="paraquien-subtitulo">{seccion.subtitulo}</p>
            </div>
          </div>

          {/* COLUMNA DERECHA: imágenes */}
          <div className={`paraquien-imagenes paraquien-imagenes--${seccion.imageLayout}`}>
            {seccion.images.map((src, i) => (
              <div key={i} className="paraquien-imagen-wrapper">
                <img
                  src={src}
                  alt={`${seccion.titulo} ${i + 1}`}
                  className="paraquien-imagen"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

        </section>
      ))}
    </div>
  );
};

export default PerfilesLanding;