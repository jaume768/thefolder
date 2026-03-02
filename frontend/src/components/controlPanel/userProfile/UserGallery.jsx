import React from "react";
import { useNavigate } from "react-router-dom";

const UserGallery = ({ posts = [], loading = false, emptyMessage, galleryStyle = "gap" }) => {
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
      const hasMainInImages = post.images.some(
        (img) => img === post.mainImage
      );
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

  return (
    <div className={`user-extern-projects gallery-view ${galleryStyle === "nogap" ? "gallery--nogap" : ""}`}>
      {posts.length === 0 ? (
        <>
          {emptyMessage && (
            <p className="user-extern-no-content">
              {emptyMessage}
            </p>
          )}

          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="user-extern-project-card user-extern-project-card-placeholder"
            />
          ))}
        </>
      ) : (
        posts.map((post, index) => {
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
        })
      )}
    </div>
  );
};

export default UserGallery;