import React from 'react';
import './MediaModal.css';

const MediaModal = ({ media, isOpen, onClose }) => {
  if (!isOpen || !media) return null;

  const isImage = media.type === 'image';

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="media-modal-backdrop" onClick={handleBackdropClick}>
      <div className="media-modal-container">
        <button className="media-modal-close" onClick={onClose}>
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

        <div className="media-modal-content">
          {isImage ? (
            <img src={media.url} alt="Full size media" className="media-modal-image" />
          ) : (
            <video controls autoPlay className="media-modal-video">
              <source src={media.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
