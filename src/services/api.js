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
    await delay(800);
    return [
      {
        id: 1,
        userId: 'u1',
        username: 'Anna Smith',
        userAvatar: '',
        content: 'Just launched my new portfolio! Extremely excited to share this with everyone. 🚀✨',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 42,
        comments: 5
      },
      {
        id: 2,
        userId: 'u2',
        username: 'Devon Miles',
        userAvatar: '',
        content: 'Learning React has been quite the journey. Loving the component-based architecture and exactly how easy it is to manage state with hooks.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        likes: 128,
        comments: 14
      }
    ];
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
    await delay(600);
    return {
      id: userId,
      username: userId === 'me' ? 'Current User' : 'Other User',
      handle: userId === 'me' ? '@currentuser' : `@${userId}`,
      bio: 'Frontend Developer | React Enthusiast',
      followers: 1205,
      following: 342,
      joinDate: 'March 2026',
      avatar: '',
      cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'
    };
  }
};
