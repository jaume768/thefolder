import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

const PerfilesLanding = () => {
  const { t } = useTranslation('landing');
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/counts-by-level`)
      .then((r) => r.json())
      .then((data) => setCounts(data))
      .catch(() => {});
  }, []);

  const SECCIONES = [
    {
      id: 'profesionales',
      titulo: t('perfiles.profesionales.titulo'),
      subtitulo: t('perfiles.profesionales.subtitulo'),
      descripcion: t('perfiles.profesionales.descripcion'),
      images: IMAGES.profesionales,
      imageLayout: 'row-4',
      countKey: 'professional',
    },
    {
      id: 'emergente',
      titulo: t('perfiles.emergente.titulo'),
      subtitulo: t('perfiles.emergente.subtitulo'),
      descripcion: t('perfiles.emergente.descripcion'),
      images: IMAGES.emergente,
      imageLayout: 'row-3',
      countKey: 'emerging',
    },
    {
      id: 'estudiantes',
      titulo: t('perfiles.estudiantes.titulo'),
      subtitulo: t('perfiles.estudiantes.subtitulo'),
      descripcion: t('perfiles.estudiantes.descripcion'),
      images: IMAGES.estudiantes,
      imageLayout: 'row-1',
      countKey: 'students',
    },
  ];

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