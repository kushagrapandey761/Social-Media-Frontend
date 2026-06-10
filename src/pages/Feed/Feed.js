import React, { useState, useEffect, useRef, useCallback } from "react";
import PostForm from "../../components/PostForm/PostForm";
import PostCard from "../../components/PostCard/PostCard";
import "./Feed.css";
import { api } from "../../services/api";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postCreatingLoader, setPostCreatingLoader] = useState(false);
  const observerRef = useRef();
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const data = await api.getFeed(pageRef.current);

      setPosts((prev) => [...prev, ...data.posts]);
      hasMoreRef.current = data.hasMore;

      if (data.hasMore) {
        pageRef.current += 1;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current) {
          fetchPosts();
        }
      },
      {
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchPosts]);

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

          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                mediaIndex={0}
                post={post}
                isUsersPost={false}
                isChat={false}
              />
            ))}
            <div ref={observerRef} style={{ height: "20px" }} />
          </div>

          {loading && posts.length === 0 && (
            <div className="feed-loading">
              <div className="spinner"></div>
              <p>Loading your feed...</p>
            </div>
          )}

          {loading && posts.length > 0 && (
            <div className="feed-loading">
              <div className="spinner"></div>
              <p>Loading more posts...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
