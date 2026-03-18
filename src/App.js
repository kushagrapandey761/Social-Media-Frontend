import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Toaster, toast } from 'react-hot-toast';

// Components
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Feed from "./pages/Feed/Feed";
import Users from "./pages/Users/Users";
import Profile from "./pages/Profile/Profile";
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoutes";
import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage/LandingPage";
import PostCard from "./components/PostCard/PostCard";
import socket from "./socket";
import Chat from "./components/Chat/Chat";
import { api } from "./services/api";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingData, setTypingData] = useState({
    senderId: ""
  });
  const [messageSeenData, setMessageSeenData] = useState({
    receiverId: ""
  });
  useEffect(() => {
    // Check if user is logged in on app load
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    setLoggedIn(isLoggedIn === "true");
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, []);

  useEffect(() => {
    socket.on("typing", (data) => {
      setTypingData(data);
    });

    socket.on("stopTyping", (data) => {
      setTypingData(data);
    });

    socket.on("messageSeen", (data) => {
      setMessageSeenData(data);
    });

    socket.on("receiveMessage", (message) => {
      // Don't show toast if user is already in chat and actively reading this message
      
      // if (window.location.pathname !== '/chat') {
        api.getUserProfile(message.senderId)
          .then((user) => {
            toast(
              (t) => (
                <div 
                  style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", cursor: "pointer" }} 
                  onClick={() => toast.dismiss(t.id)}
                >
                  <img 
                    src={user?.profilePicture || user?.userAvatar || 'https://via.placeholder.com/44'} 
                    alt="Avatar" 
                    style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} 
                  />
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", textAlign: "left" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px", color: "#fff", marginBottom: "2px" }}>
                      {user?.username || "Someone"}
                    </span>
                    <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                      {message.text}
                    </span>
                  </div>
                </div>
              ),
              {
                duration: 4000,
                position: "bottom-right",
                style: {
                  background: 'rgba(30, 30, 30, 0.95)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: "12px 14px",
                  borderRadius: "14px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  minWidth: "280px",
                },
              }
            );
          })
          .catch(() => {
            console.error("Failed to load user for notification");
          });
      // }
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageSeen");
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      <Routes>
        {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes - Wrapped with ProtectedRoutes */}
      <Route
        path="/"
        element={
          loggedIn ? (
            <ProtectedRoutes>
              <Layout>
                <Feed />
              </Layout>
            </ProtectedRoutes>
          ) : (
            <div className="home-split-container">
              <LandingPage />
              <Login />
            </div>
          )
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoutes>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoutes>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoutes>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoutes>
        }
      />
      <Route
      path="/post/:id"
      element={
        <ProtectedRoutes>
          <Layout>
            <PostCard />
          </Layout>
        </ProtectedRoutes>
      }
      />
      <Route
      path="/chat"
      element={
        <ProtectedRoutes>
          <Layout>
            <Chat onlineUsers={onlineUsers} typingData={typingData} messageSeenData={messageSeenData}/>
          </Layout>
        </ProtectedRoutes>
      }
      />
      </Routes>
    </>
  );
}

export default App;
