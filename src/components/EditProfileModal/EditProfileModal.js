import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './EditProfileModal.css';

const EditProfileModal = ({ profile, onClose, onSave, usernameError }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || profile.username || '',
        username: profile.username || '',
        bio: profile.bio || ''
      });
      setAvatarPreview(profile.userAvatar || '');
      setCoverPreview(profile.coverImage || '');
      setAvatarFile(null);
      setCoverFile(null);
    }
  }, [profile]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(reader.result);
        } else if (type === 'cover') {
          setCoverFile(file);
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Create FormData with text fields and file objects
    const apiFormData = new FormData();
    apiFormData.append('name', formData.name);
    apiFormData.append('username', formData.username);
    apiFormData.append('bio', formData.bio);
    
    // Append file objects if they were selected
    if (avatarFile) {
      apiFormData.append('userAvatar', avatarFile);
    }
    if (coverFile) {
      apiFormData.append('coverImage', coverFile);
    }
    
    onSave(apiFormData);
  };

  if (!profile) return null;

  const modal = (
    <div className="edit-profile-modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </label>
          {usernameError && <p className="error-message">{usernameError}</p>}

          <label>
            Bio
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Avatar
            <div className="preview-section">
              {avatarPreview && (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "avatar")}
                className="file-input"
              />
            </div>
          </label>

          <label>
            Cover Image
            <div className="preview-section">
              {coverPreview && (
                <div className="cover-preview">
                  <img src={coverPreview} alt="Cover preview" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "cover")}
                className="file-input"
              />
            </div>
          </label>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default EditProfileModal;
