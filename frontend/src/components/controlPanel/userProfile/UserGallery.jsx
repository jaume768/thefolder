import React from "react";
import { useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";

const BREAKPOINT_COLS = {
  default: 4,
  1200:    3,
  900:     2,
  600:     1,
};

const UserGallery = ({ posts = [], loading = false, emptyMessage, emptyContent, galleryStyle = "gap" }) => {
  const navigate = useNavigate();

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
      <div className="loading-indicator">
        Cargando publicaciones...
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

  return (
    <Masonry
      breakpointCols={BREAKPOINT_COLS}
      className={`user-extern-projects gallery-view${galleryStyle === "nogap" ? " gallery--nogap" : ""}`}
      columnClassName="masonry-gallery__col"
    >
      {posts.map((post, index) => {
        const imageCount = countPostImages(post);

        return (
          <div
            key={post._id || index}
            className="user-extern-project-card"
            onClick={() => navigate(`/post/${post._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                navigate(`/post/${post._id}`);
            }}
          >
            <div className="user-extern-project-media">
              <img
                src={post.mainImage}
                alt={post.title || `Publicación ${index + 1}`}
                className="user-extern-project-image"
              />
              <div className="user-extern-project-overlay">
                <p className="user-extern-project-overlay-title">
                  {post.title || "Proyecto sin título"}
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
    </Masonry>
  );
};

export default UserGallery;
