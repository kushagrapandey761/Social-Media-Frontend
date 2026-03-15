import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";

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

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageSeen");
    };
  }, []);
  return (
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
  );
}

export default App;
