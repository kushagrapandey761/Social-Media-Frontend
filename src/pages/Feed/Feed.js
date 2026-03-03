import React, { useState, useEffect } from "react";
import PostForm from "../../components/PostForm/PostForm";
import PostCard from "../../components/PostCard/PostCard";
import "./Feed.css";
import { api } from "../../services/api";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postCreatingLoader, setPostCreatingLoader] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const fetchPosts = async () => {
      const response = await api.getFeed();
      if (response.message === "Not logged in") {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("LoggedInuserDetails");
        window.location.href = "/login";
        return;
      }
      // Reverse posts to show newest first (assuming API returns oldest first)
      response.reverse();
      setPosts(response);
      setLoading(false);
    };
    fetchPosts();
    const userDetails = async () => {
      const response = await api.getLoggedInUser();
      localStorage.setItem("LoggedInuserDetails", JSON.stringify(response));
    }
    userDetails();
  }, []);

  const handleCreatePost = ({ content, files }) => {
    setPostCreatingLoader(true);
    api.createPost(content, files || null).then(
      (newPost) => {
        // Prepend new post to feed
        setPosts((prevPosts) => [newPost.post, ...prevPosts]);
        setPostCreatingLoader(false);
      },
      (error) => {
        console.error("Error creating post:", error);
        setPostCreatingLoader(false);
      }
    );
  };

  return (
    <div className="feed-container">
      <div className="feed-main">
        <PostForm onPostCreate={handleCreatePost} />

        <div className="feed-content">
          {postCreatingLoader && (
            <div className="feed-loading">
              <div className="spinner"></div>
              <p>Creating your post...</p>
            </div>
          )}
          {loading ? (
            <div className="feed-loading">
              <div className="spinner"></div>
              <p>Loading your feed...</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="feed-sidebar">
        <div className="sidebar-widget glass-panel">
          <h3>Trending Topics</h3>
          <ul className="trending-list">
            <li>#ReactJS</li>
            <li>#WebDevelopment</li>
            <li>#UIUX</li>
            <li>#Frontend</li>
          </ul>
        </div>
        
        <div className="sidebar-widget glass-panel">
          <h3>Suggested Users</h3>
          <div className="suggested-users">
            <div className="suggested-user">
              <div className="suggested-avatar">M</div>
              <div className="suggested-info">
                <span className="name">Max Design</span>
                <span className="handle">@maxdesign</span>
              </div>
              <button className="btn-secondary follow-btn">Follow</button>
            </div>
            <div className="suggested-user">
              <div className="suggested-avatar">S</div>
              <div className="suggested-info">
                <span className="name">Sarah Code</span>
                <span className="handle">@sarahcode</span>
              </div>
              <button className="btn-secondary follow-btn">Follow</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
