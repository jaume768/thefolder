import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clImg } from "../../../utils/optimizeImage";
import { Skel } from "../../skeleton/PageSkeleton";

const BREAKPOINT_COLS = {
  default: 4,
  1200:    3,
  900:     2,
  600:     1,
};

// Mismas reglas que react-masonry-css (que se usaba antes): el breakpoint
// más pequeño que sea >= al ancho de ventana manda; si no, "default".
const columnsForWidth = (width) => {
  const match = Object.keys(BREAKPOINT_COLS)
    .filter((k) => k !== "default")
    .map(Number)
    .sort((a, b) => a - b)
    .find((bp) => width <= bp);
  return match ? BREAKPOINT_COLS[match] : BREAKPOINT_COLS.default;
};

const useColumnCount = () => {
  const [cols, setCols] = useState(() =>
    typeof window === "undefined" ? BREAKPOINT_COLS.default : columnsForWidth(window.innerWidth)
  );
  useEffect(() => {
    const onResize = () => setCols(columnsForWidth(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
};

const coverOf = (post) => clImg.post((Array.isArray(post.thumbUrls) && post.thumbUrls[0]) || post.mainImage);

// Proporción (alto/ancho) de cada portada, medida en el navegador (los
// posts no guardan dimensiones). Se publica de una vez cuando han cargado
// todas (o a los 2,5 s con las que haya), para recolocar la rejilla una
// sola vez y no a saltos imagen a imagen.
const useImageRatios = (urls) => {
  const [ratios, setRatios] = useState({});
  const key = urls.join("|");
  useEffect(() => {
    let cancelled = false;
    const found = {};
    let pending = urls.length;
    const publish = () => { if (!cancelled) setRatios((prev) => ({ ...prev, ...found })); };
    const timer = setTimeout(publish, 2500);
    urls.forEach((url) => {
      const img = new Image();
      const done = () => {
        if (img.naturalWidth) found[url] = img.naturalHeight / img.naturalWidth;
        pending -= 1;
        if (pending === 0) { clearTimeout(timer); publish(); }
      };
      img.onload = done;
      img.onerror = done;
      img.src = url;
    });
    if (!urls.length) clearTimeout(timer);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return ratios;
};

// Reparto equilibrado: se recorren los proyectos EN ORDEN (primero por
// filas: 1, 2, 3, 4 arriba...) y cada uno va a la columna que en ese
// momento es más baja (empate → la de más a la izquierda). Así las
// columnas acaban a alturas parecidas y el orden se sigue leyendo por
// filas. Sin proporción conocida se cuenta como 4:5; GAP_RATIO es el gap
// de 8px de .masonry-gallery__col en proporción del ancho de columna (aprox.).
const DEFAULT_RATIO = 1.25;
const GAP_RATIO = 0.03;
const balanceColumns = (posts, cols, ratios) => {
  const columns = Array.from({ length: cols }, () => ({ height: 0, items: [] }));
  posts.forEach((post, index) => {
    let target = columns[0];
    for (const col of columns) if (col.height < target.height - 0.0001) target = col;
    target.items.push({ post, index });
    target.height += (ratios[coverOf(post)] ?? DEFAULT_RATIO) + GAP_RATIO;
  });
  return columns;
};

const UserGallery = ({ posts = [], loading = false, emptyMessage, emptyContent, onPostClick }) => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const cols = useColumnCount();
  const coverUrls = useMemo(() => posts.map(coverOf), [posts]);
  const ratios = useImageRatios(coverUrls);
  const columns = useMemo(() => balanceColumns(posts, cols, ratios), [posts, cols, ratios]);
  const handlePostClick = (postId) => {
    if (typeof onPostClick === "function") onPostClick(postId);
    else navigate(`/post/${postId}`);
  };

  const countPostImages = (post) => {
    if (!post) return 0;

    let count = 0;

    if (typeof post.mainImage === "string" && post.mainImage.trim() !== "") {
      count += 1;
    }

    if (Array.isArray(post.images)) {
      count += post.images.filter(
        (img) => typeof img === "string" && img.trim() !== ""
      ).length;
    }

    if (Array.isArray(post.images) && typeof post.mainImage === "string") {
      const hasMainInImages = post.images.some((img) => img === post.mainImage);
      if (hasMainInImages) count -= 1;
    }

    return count;
  };

  if (loading) {
    return (
      <div className="user-extern-projects gallery-view" aria-busy="true">
        {[0, 1, 2].map((col) => (
          <div key={col} className="masonry-gallery__col sk-static" style={{ width: `${100 / 3}%` }}>
            {[0, 1].map((row) => (
              <Skel key={row} w="100%" ratio={(col + row) % 2 ? "3 / 4" : "4 / 5"} style={{ marginBottom: 8 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="user-extern-projects gallery-view">
        {emptyContent
          ? emptyContent
          : emptyMessage && (
              <p className="user-extern-no-content">{emptyMessage}</p>
            )
        }
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="user-extern-project-card user-extern-project-card-placeholder"
          />
        ))}
      </div>
    );
  }

  // Mismo DOM que react-masonry-css (contenedor + .masonry-gallery__col),
  // así el diseño de la rejilla no cambia; solo el reparto (balanceColumns).
  // El picker de "Mosaico" (galleryStyle:"nogap") se retiró de
  // ProfileAppearanceTab.jsx — quien lo tuviera activo antes queda
  // redirigido a la vista con espacio sin migrar nada en la base de
  // datos: aquí es el único sitio que de verdad pintaba .gallery--nogap,
  // así que basta con dejar de aplicarla.
  return (
    <div className="user-extern-projects gallery-view">
      {columns.map((col, colIdx) => (
      <div key={colIdx} className="masonry-gallery__col" style={{ width: `${100 / cols}%` }}>
      {col.items.map(({ post, index }) => {
        const imageCount = countPostImages(post);

        return (
          <div
            key={post._id || index}
            className="user-extern-project-card"
            onClick={() => handlePostClick(post._id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handlePostClick(post._id);
            }}
          >
            <div className="user-extern-project-media">
              <img
                src={coverOf(post)}
                alt={post.title || t("publicationAlt", { number: index + 1 })}
                className="user-extern-project-image"
              />
              <div className="user-extern-project-overlay">
                <p className="user-extern-project-overlay-title">
                  {post.title || t("untitledProject")}
                </p>
                {imageCount > 1 && (
                  <p className="user-extern-project-overlay-count">
                    [+{imageCount - 1}]
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>
      ))}
    </div>
  );
};

export default UserGallery;
