import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostCard from "../../components/PostCard/PostCard";
import EditProfileModal from "../../components/EditProfileModal/EditProfileModal";
import "./Profile.css";
import { api } from "../../services/api";
import Modal from "../../components/Modal/Modal";

const Profile = () => {
  const {id} = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // controls modal visibility
  const [tab, setTab] = useState("posts"); // 'posts', 'media', 'likes'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const navigate = useNavigate();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("LoggedInuserDetails");
    setProfile(null);
    navigate("/login");
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleOpenMediaModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsMediaModalOpen(true);
  };

  const handleCloseMediaModal = () => {
    setSelectedMedia(null);
    setIsMediaModalOpen(false);
  };

  const handleSaveProfile = async (apiFormData) => {
    try {
      setLoading(true);
      const updatedProfile = await api.updateUserProfile(apiFormData);
      if(updatedProfile.error === "Username already in use") {
        setUsernameError("Username already in use. Please choose another.");
        setLoading(false);
        return;
      }
      setProfile(updatedProfile);
      localStorage.setItem(
        "LoggedInuserDetails",
        JSON.stringify(updatedProfile),
      );
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const res = await api.getUserPosts(userId);
      setPosts(res);
      const allMedia = [];
      res.forEach((post) => {
        if (post.media && post.media.length > 0) {
          allMedia.push(...post.media);
        }
      });
      setMedia(allMedia);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
      setPosts([]);
    }
  };

  const onPostDeleted = (postId) => {
    // Remove the deleted post from the posts state
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  }

  useEffect(() => {
    if(id) {
      api.getUserProfile(id)
        .then((res) => {
          setProfile(res);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile:", err);
          alert("Failed to load profile. Please try again.");
          navigate("/");
        });
        fetchUserPosts(id);
        setLoading(false);
    } else {
      const userDetails = JSON.parse(localStorage.getItem("LoggedInuserDetails"));
      setProfile(userDetails);
      fetchUserPosts(userDetails?._id);
      setLoading(false);
  }}, [id, profile?.userAvatar,profile?.name, profile?.username]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      {isEditing && (
        <EditProfileModal
          profile={profile}
          onClose={handleCloseModal}
          onSave={handleSaveProfile}
          usernameError={usernameError}
        />
      )}

      <Modal isOpen={isMediaModalOpen} onClose={handleCloseMediaModal}>
        <button className="media-modal-close" onClick={handleCloseMediaModal}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {selectedMedia && (
          <div>
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Full size media"
                className="media-modal-image"
              />
            ) : (
              <video controls autoPlay className="media-modal-video">
                <source src={selectedMedia.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </Modal>

      <div className="profile-header glass-panel">
        <div
          className="profile-cover"
          style={{
            backgroundImage: `url(${profile?.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"})`,
          }}
        ></div>

        <div className="profile-info-section">
          <div className="profile-avatar">
            {profile?.userAvatar ? (
              <img src={profile.userAvatar} alt={profile?.username || ""} />
            ) : (
              <span>{(profile?.username || "").charAt(0)}</span>
            )}
          </div>

          <div className="profile-actions">
            {id ? (null) : (
              <button className="btn-secondary" onClick={handleEditClick}>
                Edit Profile
              </button>
            )}
            <button className="btn-secondary logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="profile-details">
            <h1 className="profile-name">
              {profile?.name || profile?.username || "Unknown"}
            </h1>
            <span className="profile-handle">{`@${profile?.username || ""}`}</span>
            <p className="profile-bio">{profile?.bio || ""}</p>

            <div className="profile-stats">
              <span className="stat">
                <strong className="stat-value">
                  {profile?.followingCount ?? 0}
                </strong>{" "}
                Following
              </span>
              <span className="stat">
                <strong className="stat-value">
                  {profile?.followersCount ?? 0}
                </strong>{" "}
                Followers
              </span>
              <span className="stat-muted">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Joined{" "}
                {profile?.createdAt ? profile.createdAt.split("T")[0] : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          onClick={() => setTab("posts")}
          className={`tab-btn ${tab === "posts" ? "active" : ""}`}
        >
          Posts
        </button>
        <button
          onClick={() => setTab("media")}
          className={`tab-btn ${tab === "media" ? "active" : ""}`}
        >
          Media
        </button>
      </div>

      <div className="profile-content">
        {tab === "posts" && (
          <>
            <div className="posts-list">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isUsersPost={id ? false : true}
                    onPostDeleted={() => onPostDeleted(post._id)}
                    isChat={false}
                  />
                ))
              ) : (
                <div className="empty-state">No posts yet.</div>
              )}
            </div>
          </>
        )}
        {tab === "media" && (
          <>
            <div className="media-list">
              {media.length > 0 ? (
                media.map((item) => {
                  const isImage = item.type === "image";
                  return (
                    <div
                      key={item.id}
                      className="media-item"
                      onClick={() => handleOpenMediaModal(item)}
                    >
                      {isImage ? (
                        <img
                          src={item.url}
                          alt="Post media"
                          className="media-image"
                        />
                      ) : (
                        <video className="media-video">
                          <source src={item.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">No media yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
