import React from 'react';
import { FaUserPlus, FaUserCheck, FaBell, FaBellSlash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserProfileHeader = ({ 
    profile, 
    activeTab, 
    setActiveTab, 
    isFollowing, 
    handleFollow, 
    handleUnfollow,
    isNotificationActive,
    toggleNotification
}) => {
    const navigate = useNavigate();

    return (
        <>
            <header className="user-profile-navigation">
                <button className="user-profile-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft size={20} />
                    <span>Volver</span>
                </button>
            </header>
            <div className="user-profile-header-container">
                <header className="user-profile-header">
                    <img
                        src={profile?.profile?.profilePicture || "/multimedia/usuarioDefault.jpg"}
                        alt="Perfil"
                        className="user-profile-photo"
                    />
                    <div className="user-profile-personal-info">
                        <h1 className="user-profile-name">
                            {profile?.fullName || "Nombre Apellido"}
                        </h1>
                        <p className="user-profile-occupations">
                            {profile?.professionalTitle || "Título profesional no especificado"}
                        </p>
                        <p className="user-profile-location">
                            {profile?.city && profile?.country
                                ? `${profile.city}, ${profile.country}`
                                : "Ubicación no especificada"}
                        </p>
                        <div className="user-profile-stats">
                            <span className="user-profile-stat">
                                <strong>{profile?.followers?.length || 0}</strong> seguidores
                            </span>
                            <span className="user-profile-stat">
                                <strong>{profile?.following?.length || 0}</strong> seguidos
                            </span>
                        </div>
                        <div className="user-profile-actions">
                            {isFollowing ? (
                                <>
                                    <button
                                        className="follow-button following"
                                        onClick={handleUnfollow}
                                    >
                                        <FaUserCheck /> Dejar de seguir
                                    </button>
                                    <button
                                        className="notification-button"
                                        onClick={toggleNotification}
                                    >
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="follow-button"
                                    onClick={handleFollow}
                                >
                                    <FaUserPlus /> Seguir
                                </button>
                            )}
                        </div>
                    </div>
                </header>
                <div className="user-profile-mobile-tabs">
                    <button
                        className={activeTab === 'perfil' ? 'active' : ''}
                        onClick={() => setActiveTab('perfil')}
                    >
                        Perfil
                    </button>
                    <button
                        className={activeTab === 'publicaciones' ? 'active' : ''}
                        onClick={() => setActiveTab('publicaciones')}
                    >
                        Publicaciones
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserProfileHeader;
