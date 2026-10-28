// portfolioTemplates/DaisyFilm/components/PortfolioGallery.jsx
import React from "react";
import { clImg } from "../../../../../utils/optimizeImage";
import { Skel } from "../../../../../components/skeleton/PageSkeleton";
import Footer from "./Footer";

export default function PortfolioGallery({ slides, slidePosts, postsLoading, onOpenPost, displayName }) {
  return (
    <div className="df-individual">
      {slides.map((src, i) => (
        <button
          key={slidePosts[i]._id}
          type="button"
          className="df-gallery-item"
          onClick={() => onOpenPost(slidePosts[i])}
        >
          <img src={clImg.post(src)} alt="" className="df-gallery-item__img" />
          {slidePosts[i].title && (
            <span className="df-gallery-item__title">{slidePosts[i].title}</span>
          )}
        </button>
      ))}
      {/* Cargando: fotos grises a la altura real (350px) de la columna */}
      {postsLoading && slides.length === 0 &&
        [262, 467, 262].map((w, i) => (
          <div key={i} className="df-gallery-item sk-static" aria-hidden="true">
            <Skel w={w} h={350} />
          </div>
        ))}
      {!postsLoading && slides.length === 0 && <div className="df-main-empty" />}

      <Footer name={displayName} />
    </div>
  );
}
