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
  
  createPost: async (content, image = null) => {
    await delay(500);
    console.log('API: Creating post', { content, image });
    return {
      id: Date.now(),
      userId: 'me',
      username: 'Current User',
      content,
      image,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
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
  }
};
