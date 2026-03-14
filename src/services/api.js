/**
 * Social Media Mock API Layer
 * 
 * This module exports asynchronous functions that currently return mock data 
 * after a small delay. To connect this to a real backend, simply replace the 
 * body of each function with a real fetch() or axios.get/post() call.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Authentication
  login: async (credentials) => {
    await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    }).then((res) => res.json());
  },
  
  register: async (userData) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },
  
  // Posts
  getFeed: async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/posts`,{
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch feed');
    }
    return await res.json();
  },

  getPost: async (postId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${postId}`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch post');
    }
    return await res.json();
  },
  
  createPost: async (content, files) => {
    const formData = new FormData();
    formData.append('content', content);
    if (files) {
      files.forEach((file, index) => formData.append(`files`, file));
    }
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/post`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to create post');
    }
    return await res.json();
  },
  
  // Users
  getUsers: async () => {
    await delay(600);
    return [
      {
        id: 'u1', username: 'Anna Smith', handle: '@annasmith',
        bio: 'Digital nomad and photographer.', isFollowing: false
      },
      {
        id: 'u2', username: 'Devon Miles', handle: '@devonm',
        bio: 'Software engineer building web things.', isFollowing: true
      }
    ];
  },
  
  getUserProfile: async (userId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/user/${userId}`,{
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await res.json();
  },

  getLoggedInUser: async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/me`,{
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch logged in user');
    }
    return await res.json();
  },

  toggleLike: async (postId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${postId}/toggleLike`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to like post');
    }
    return await res.json();
  },

  updateUserProfile: async (profileData) => {
    // FormData: Do NOT set Content-Type header; browser will set it with boundary
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/me`, {
      method: "PATCH",
      body: profileData,
      credentials: "include"
    });
    if (!res.ok) {
      const data = await res.json();
      if (data.message === "Username already in use") {
        return { error: "Username already in use" };
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    }
    return await res.json();
  },

  logout: async () => {
    await fetch(`${process.env.REACT_APP_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include"
    });
  },
  
  getUserPosts: async (userId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/posts/user/${userId}`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user posts');
    }
    return await res.json();
  },

  deletePost: async (postId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${postId}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to delete post');
    }
    return await res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/users`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }
    return await res.json();
  },

  toggleFollow: async (userId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/toggleFollow/${userId}`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to toggle follow');
    }
    return await res.json();
  },

  getComments: async (postId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/comments/${postId}`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch comments');
    }
    return await res.json();
  },

  addComment: async (postId, text) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/comment/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to add comment');
    }
    return await res.json();
  },

  getReplies: async (commentId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/replies/${commentId}`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch replies');
    }
    return await res.json();
  },

  addReply: async (commentId, text) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/reply/${commentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to add reply');
    }
    return await res.json();
  },

  getChats: async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/chats`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch chats');
    }
    return await res.json();
  },

  getMessages: async (userId) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/messages/${userId}`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await res.json();
  },

  sendMessage: async (messageData) => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error('Failed to send message');
    }
    return await res.json();
  },
};
