import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Feed from "./pages/Feed/Feed";
import Users from "./pages/Users/Users";
import Profile from "./pages/Profile/Profile";
import LandingPage from "./components/LandingPage/LandingPage";

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if(!localStorage.getItem("isLoggedIn")){
      localStorage.setItem("isLoggedIn", "false");
      navigate("/login");
    }

    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);
  return (
    
      <Routes>
        {/* Auth Routes w/o Main Layout Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main App Routes w/ Layout Navbar */}
        <Route path="/" element={
          <Layout>
            {isLoggedIn ? <Feed /> : (
              <div className="home-split-container">
                <LandingPage />
                <Login />
              </div>
            )}
          </Layout>
        } />
        <Route path="/users" element={<Layout><Users /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/profile/:id" element={<Layout><Profile /></Layout>} />
      </Routes>
    
  );
}

export default App;
