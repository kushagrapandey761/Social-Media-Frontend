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
      // Reverse posts to show newest first (assuming API returns oldest first)
      response.reverse();
      setPosts(response);
      setLoading(false);
    };
    fetchPosts();
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
                <PostCard key={post.id} post={post} isUsersPost={false} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      
    </div>
  );
};

export default Feed;
