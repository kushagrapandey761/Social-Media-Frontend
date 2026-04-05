import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import "./PostCard.css";
import { api } from "../../services/api";
import Modal from "../Modal/Modal";
import toast from "react-hot-toast";

const PostCard = ({ post: initialPost, isUsersPost, onPostDeleted, mediaIndex, isChat = false }) => {
  const {id, urlMediaIndex} = useParams();
  const [post, setPost] = useState(initialPost || null);
  const [loadingPost, setLoadingPost] = useState(!initialPost && !!id);
  const [postError, setPostError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialPost?.likes || 0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(mediaIndex || 0);
  const [isPostOptionsOpen, setIsPostOptionsOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null); // Tracks the comment _id being replied to
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [selectedShareUsers, setSelectedShareUsers] = useState([]);
  const [sharingPost, setSharingPost] = useState(false);

  useEffect(() => {
    if (id && !initialPost) {
      setCurrentMediaIndex(parseInt(urlMediaIndex, 10) || 0);
      const fetchPost = async () => {
        try {
          setLoadingPost(true);
          const data = await api.getPost(id);
          const fetchedPost = data.post || data;
          setPost(fetchedPost);
          setLikeCount(fetchedPost.likes || 0);
        } catch (error) {
          console.error("Error fetching post by id:", error);
          setPostError("Failed to load post.");
        } finally {
          setLoadingPost(false);
        }
      };
      fetchPost();
    } else if (initialPost) {
      setPost(initialPost);
      setLikeCount(initialPost.likes || 0);
    }
  }, [id, initialPost, urlMediaIndex]);

  const toggleReplies = async (commentId) => {
    if (!expandedReplies[commentId]) {
      try {
        const fetchedRepliesData = await api.getReplies(commentId);
        const fetchedReplies = Array.isArray(fetchedRepliesData) 
          ? fetchedRepliesData 
          : (fetchedRepliesData.replies || []);
          
        setComments((prevComments) => {
          // Filter out replies we already have to prevent duplicates
          const newReplies = fetchedReplies.filter(
            (newReply) => !prevComments.some((c) => c._id === newReply._id)
          );
          return [...prevComments, ...newReplies];
        });
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    }

    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  useEffect(() => {
    if (!post) return;
    // Check if user has liked the post
    const loggedInUser = JSON.parse(
      localStorage.getItem("LoggedInuserDetails"),
    );
    if (
      loggedInUser &&
      post.likedBy &&
      post.likedBy.includes(loggedInUser._id)
    ) {
      setLiked(true);
    } else {
      setLiked(false);
    }
    setLikeCount(post.likes || 0);
  }, [post, post?._id, post?.likedBy, post?.likes]);

  // close the options menu when clicking anywhere outside of it
  const optionsRef = React.useRef(null);
  const buttonRef = React.useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // if menu is open and click target is not inside the menu or the button that toggles it
      if (
        isPostOptionsOpen &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsPostOptionsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isPostOptionsOpen]);

  const handlePostDelete = async (postId) => {
    setIsPostOptionsOpen(false);
    // Implement post deletion logic here
    setLoader(true);
    await api.deletePost(postId);

    setLoader(false);
    onPostDeleted(postId);
    // Simulate delay for better UX

    // Optionally, you can trigger a refresh of the post list in the parent component
    // by calling a prop function passed down from the parent (e.g., onPostDeleted(postId))
  };

  const handleCommentClick = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await api.getComments(post._id);
        const fetchedComments = Array.isArray(data) ? data : (data.comments || []);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setAddingComment(true);
    try {
      if (replyingTo) {
        // Add a reply
        const data = await api.addReply(replyingTo, newComment);
        const addedReply = data.reply || data;
        setComments((prev) => {
          return prev.map((c) => {
            if (c._id === replyingTo) {
              // Calculate the current reply count properly
              const currentReplyCount = c.replyCount !== undefined 
                ? c.replyCount 
                : prev.filter((r) => r.parentCommentId === c._id).length;
              return { ...c, replyCount: currentReplyCount + 1 };
            }
            return c;
          }).concat(addedReply);
        });
        
        // Ensure the parent thread is expanded so the user sees their new reply
        if (!expandedReplies[replyingTo]) {
           setExpandedReplies(prev => ({ ...prev, [replyingTo]: true }));
        }
      } else {
        // Add a top-level comment
        const data = await api.addComment(post._id, newComment);
        const added = data.comment || data;
        setComments((prev) => [added, ...prev]);
      }
      
      // Optimistically update the post's comment count in local state
      setPost((prev) => ({
        ...prev,
        commentsCount: (prev?.commentsCount || 0) + 1
      }));
      
      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding comment/reply:", error);
    } finally {
      setAddingComment(false);
    }
  };

  const likeClicksRef = React.useRef(0);
  const likeTimeoutRef = React.useRef(null);

  const handleLike = () => {
    // Optimistic UI update
    if (liked) {
      setLikeCount((prev) => prev - 1);
      setLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setLiked(true);
    }

    // Increment click counter
    likeClicksRef.current += 1;

    // Clear previous timeout
    if (likeTimeoutRef.current) {
      clearTimeout(likeTimeoutRef.current);
    }

    // Set new debounce timeout
    likeTimeoutRef.current = setTimeout(async () => {
      // Only send request if the net change is a toggle (odd number of clicks)
      // This prevents the backend and frontend from desyncing if user clicks rapidly
      if (likeClicksRef.current % 2 !== 0) {
        try {
          await api.toggleLike(post._id);
        } catch (error) {
          console.error("Error toggling like:", error);
        }
      }
      // Reset the counter after the window ends
      likeClicksRef.current = 0;
    }, 500); // 500ms debounce window
  };

  // Format date helper (mocked implementation)
  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loadingPost || loader) {
    return (
      <div className="delete-post-loader">
        <div className="spinner"></div>
        <p>{loader ? "Deleting post..." : "Loading post..."}</p>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="post-card glass-panel" style={{ textAlign: "center", padding: "2rem" }}>
        <p>{postError || "Post not found."}</p>
      </div>
    );
  }

  const hasMedia = post.media && post.media.length > 0;
  const isCarousel = hasMedia && post.media.length > 1 && !isChat;

  const nextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === post.media.length - 1 ? 0 : prev + 1,
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? post.media.length - 1 : prev - 1,
    );
  };

  const handleShareClick = async () => {
    setIsShareModalOpen(true);
    if (shareUsers.length === 0) {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("LoggedInuserDetails"));
        const allUsers = await api.getAllUsers();
        setShareUsers(allUsers.filter(u => u._id !== loggedInUser._id && u.isFollowing));
      } catch (err) {
        console.error("Failed to fetch users for sharing", err);
      }
    }
  };

  const handleSendShare = async () => {
    if (selectedShareUsers.length === 0) return;
    setSharingPost(true);
    
    try {
      for (const userId of selectedShareUsers) {
         await api.sendMessage({
           receiverId: userId,
           type: "post",
           postId: post._id,
           currentMediaIndex
         });
      }
      toast.success("Post shared successfully!")
      setIsShareModalOpen(false);
      setSelectedShareUsers([]);
    } catch (err) {
      console.error("Failed to share post", err);
      toast.error("Failed to share post");
    } finally {
      setSharingPost(false);
    }
  };

  return (
    <div className="post-card glass-panel animate-fade-in">
      <div className="post-header">
        <Link to={`/profile/${post.authorId}`} className="post-author-info">
          <div
            className="author-avatar"
            style={{ backgroundImage: `url(${post.userAvatar})` }}
          >
            {!post.userAvatar && (post.userName || "U").charAt(0).toUpperCase()}
          </div>
          <div className="author-meta">
            <h4 className="author-name">{post.userName || "Unknown User"}</h4>
            <span className="post-time">
              {formatDate(post.createdAt || new Date())}
            </span>
          </div>
        </Link>
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsPostOptionsOpen(true);
          }}
          className="post-options-btn"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
        {isPostOptionsOpen && (
          <div className="post-options-menu" ref={optionsRef}>
            {isUsersPost ? (
              <ul>
                <div>
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsPostOptionsOpen(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </ul>
            ) : null}
          </div>
        )}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setIsPostOptionsOpen(false);
          }}
        >
          <div className="delete-confirmation">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this post?</p>
            <div className="confirmation-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setIsPostOptionsOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  handlePostDelete(post._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedShareUsers([]);
          }}
        >
          <div className="share-modal-container">
            <h3>Share this Post</h3>
            <div className="share-users-list">
              {shareUsers.length === 0 ? (
                <p>Follow users to share posts</p>
              ) : (
                shareUsers.map(user => (
                  <label key={user._id} className="share-user-item">
                    <input 
                      type="checkbox" 
                      className="share-checkbox"
                      checked={selectedShareUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedShareUsers(prev => [...prev, user._id]);
                        } else {
                          setSelectedShareUsers(prev => prev.filter(id => id !== user._id));
                        }
                      }}
                    />
                    <div className="share-user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="share-user-name">{user.username}</span>
                  </label>
                ))
              )}
            </div>
            <div className="share-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setSelectedShareUsers([]);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSendShare} 
                disabled={selectedShareUsers.length === 0 || sharingPost}
              >
                {sharingPost ? "Sharing..." : "Send"}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {hasMedia && (
          <div className="carousel-container">
            <div className="post-image-container">
              {post.media[currentMediaIndex].type === "image" && (
                <img
                  src={post.media[currentMediaIndex].url}
                  alt={`Post media ${currentMediaIndex + 1}`}
                  className="post-image"
                />
              )}
              {post.media[currentMediaIndex].type === "video" && (
                <video controls={!isChat} className="post-video">
                  <source
                    src={post.media[currentMediaIndex].url}
                    type="video/mp4"
                  />
                </video>
              )}
            </div>

            {isCarousel && (
              <>
                <button
                  className="carousel-btn prev-btn"
                  onClick={prevMedia}
                  aria-label="Previous media"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  className="carousel-btn next-btn"
                  onClick={nextMedia}
                  aria-label="Next media"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <div className="carousel-indicators">
                  {post.media.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentMediaIndex ? "active" : ""}`}
                      onClick={() => setCurrentMediaIndex(index)}
                      aria-label={`Go to media ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {!isChat && (
        <>
      <div className="post-actions-bar">
        <button
          className={`interaction-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{likeCount}</span>
        </button>

        <button className="interaction-btn" onClick={handleCommentClick}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span>{post.commentsCount || 0}</span>
        </button>

        <button className="interaction-btn" onClick={handleShareClick}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section animate-fade-in">
          {loadingComments ? (
            <div className="comments-loader">Loading comments...</div>
          ) : (
            <div className="comments-list">
              {topLevelComments.length > 0 ? (
                topLevelComments.map((comment, index) => {
                  const replies = comments.filter((c) => c.parentCommentId === comment._id);
                  const replyCount = comment.replyCount || replies.length;
                  const isExpanded = expandedReplies[comment._id];

                  return (
                    <div key={comment._id || index} className="comment-thread">
                      <div className="comment-item">
                        <div
                          className="comment-author-avatar"
                          style={{ backgroundImage: `url(${comment.authorId?.userAvatar})` }}
                        >
                          {!comment.authorId?.userAvatar &&
                            (comment.authorId?.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-content-wrap">
                          <span className="comment-author-name">
                            {comment.authorId?.username || "User"}
                          </span>
                          <p className="comment-text">{comment.text}</p>
                          <button 
                            className="reply-action-btn"
                            onClick={() => {
                              setReplyingTo(comment._id);
                              // Optional: document.querySelector('.comment-input-form input')?.focus();
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {(replyCount > 0) && (
                        <div className="comment-actions">
                          <button
                            className="toggle-replies-btn"
                            onClick={() => toggleReplies(comment._id)}
                          >
                            {isExpanded
                              ? "Hide replies"
                              : `Show replies (${replyCount})`}
                          </button>
                        </div>
                      )}

                      {isExpanded && replies.length > 0 && (
                        <div className="replies-list-container">
                          {replies.map((reply, rIndex) => (
                            <div key={reply._id || `reply-${rIndex}`} className="comment-item reply-item">
                              <div
                                className="comment-author-avatar reply-avatar"
                                style={{ backgroundImage: `url(${reply.authorId?.userAvatar})` }}
                              >
                                {!reply.authorId?.userAvatar &&
                                  (reply.authorId?.username || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="comment-content-wrap reply-content">
                                <span className="comment-author-name">
                                  {reply.authorId?.username || "User"}
                                </span>
                                <p className="comment-text">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyingTo === comment._id && (
                        <div className="reply-input-container" style={{ margin: "10px 0 0 40px" }}>
                          <form className="comment-input-form" onSubmit={handleAddComment} style={{ marginTop: 0 }}>
                            <div className="replying-indicator" style={{ marginBottom: "8px" }}>
                              Replying to {comment.authorId?.username || "user"}... 
                              <button type="button" onClick={() => { setReplyingTo(null); setNewComment(""); }} style={{ marginLeft: "10px", background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer", fontSize: "0.85rem" }}>Cancel</button>
                            </div>
                            <div className="input-group">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Write a reply..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={addingComment}
                              />
                              <button type="submit" disabled={!newComment.trim() || addingComment}>
                                {addingComment ? "..." : "Post"}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="no-comments-msg">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
          
          {!replyingTo && (
            <form className="comment-input-form" onSubmit={handleAddComment}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={addingComment}
                />
                <button type="submit" disabled={!newComment.trim() || addingComment}>
                  {addingComment ? "..." : "Post"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default PostCard;
