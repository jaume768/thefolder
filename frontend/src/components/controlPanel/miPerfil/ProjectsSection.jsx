import React from 'react';
import { FaTh, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProjectsSection = ({ isGalleryView, toggleView, userPosts = [] }) => {
    const navigate = useNavigate();
    
    const minGridItems = 15; // Minimum number of grid items (including placeholders)
    
    const renderProjectsGrid = () => {
        // Asegurarse de que userPosts sea un array
        const posts = Array.isArray(userPosts) ? userPosts : [];
        
        // If we have more than 15 posts, show all of them without placeholders
        if (posts.length >= minGridItems) {
            return posts.map((post, index) => (
                <div
                    key={index}
                    className="miPerfil-project-placeholder"
                    onClick={() => navigate(`/post/${post._id}`)}
                >
                    <img
                        src={post.mainImage}
                        alt={`Publicación ${index + 1}`}
                    />
                </div>
            ));
        }
        
        // If we have fewer than 15 posts, show posts + placeholders to reach 15 total
        return [...Array(minGridItems)].map((_, index) => {
            if (index < posts.length) {
                const post = posts[index];
                return (
                    <div
                        key={index}
                        className="miPerfil-project-placeholder"
                        onClick={() => navigate(`/post/${post._id}`)}
                    >
                        <img
                            src={post.mainImage}
                            alt={`Publicación ${index + 1}`}
                        />
                    </div>
                );
            } else {
                return (
                    <div key={index} className="miPerfil-project-placeholder">
                        {/* Placeholder sin imagen */}
                    </div>
                );
            }
        });
    };

    return (
        <div className="miPerfil-right">
            {/* <div className="user-extern-view-options">
                <div className="miPerfil-view-container">
                    <button
                        className={`user-extern-view-button ${isGalleryView ? 'active' : ''}`}
                        onClick={() => !isGalleryView && toggleView()}
                        title="Vista de galería"
                    >
                        <span>Galería</span>
                        <FaTh />
                    </button>
                    <button
                        className={`user-extern-view-button ${!isGalleryView ? 'active' : ''}`}
                        onClick={() => isGalleryView && toggleView()}
                        title="Vista individual"
                    >
                        <span>Individual</span>
                        <FaList />
                    </button>
                </div>
            </div> */}
            <div
                className={`miPerfil-projects-grid ${isGalleryView ? 'gallery' : 'individual'}`}
            >
                {renderProjectsGrid()}
            </div>
        </div>
    );
};

export default ProjectsSection;
