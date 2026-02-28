import React from 'react';
import Navbar from '../Navbar/Navbar';
import './Layout.css';
import {useState, useEffect} from 'react';

const Layout = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);
  return (
    <div className="app-container">
      {/* Background Orbs */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      {isLoggedIn && <Navbar />}
      
      
      {/* Main Content Area */}
      <main style={{paddingTop: isLoggedIn ? "calc(80px + var(--space-xl))" : "var(--space-xl)"}} className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
