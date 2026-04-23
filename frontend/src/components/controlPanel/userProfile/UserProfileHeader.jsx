import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaUserCheck, FaBell, FaBellSlash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { clImg } from '../../../utils/optimizeImage';

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
    const { t } = useTranslation('profile');
    const navigate = useNavigate();

    return (
        <>
            <header className="user-profile-navigation">
                <button className="user-profile-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft size={20} />
                    <span>{t('header.back')}</span>
                </button>
            </header>
            <div className="user-profile-header-container">
                <header className="user-profile-header">
                    <img
                        src={clImg.avatar(profile?.profile?.profilePicture) || "/multimedia/usuarioDefault.jpg"}
                        alt={t('default.profilePictureAlt')}
                        className="user-profile-photo"
                    />
                    <div className="user-profile-personal-info">
                        <h1 className="user-profile-name">
                            {profile?.fullName || t('sections.defaultFullName')}
                        </h1>
                        <p className="user-profile-occupations">
                            {profile?.professionalTitle || t('sections.defaultTitle')}
                        </p>
                        <p className="user-profile-location">
                            {profile?.city && profile?.country
                                ? `${profile.city}, ${profile.country}`
                                : profile?.city || t('header.locationNotSpecified')}
                            {profile?.city2 ? ` · ${profile.city2}${profile.country2 ? `, ${profile.country2}` : ""}` : ""}
                        </p>
                        <div className="user-profile-stats">
                            <span className="user-profile-stat">
                                <strong>{profile?.followers?.length || 0}</strong> {t('header.followers')}
                            </span>
                            <span className="user-profile-stat">
                                <strong>{profile?.following?.length || 0}</strong> {t('header.following')}
                            </span>
                        </div>
                        <div className="user-profile-actions">
                            {isFollowing ? (
                                <>
                                    <button
                                        className="follow-button following"
                                        onClick={handleUnfollow}
                                    >
                                        <FaUserCheck /> {t('header.unfollow')}
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
                                    <FaUserPlus /> {t('header.follow')}
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
                        {t('header.profile')}
                    </button>
                    <button
                        className={activeTab === 'publicaciones' ? 'active' : ''}
                        onClick={() => setActiveTab('publicaciones')}
                    >
                        {t('header.publications')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserProfileHeader;
