import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const ProtectedRoutes = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // validate session by calling protected endpoint
    api.getLoggedInUser()
      .then((res) => {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('LoggedInuserDetails', JSON.stringify(res));
      })
      .catch(() => {
        // failed to validate, clear state and send to login
        localStorage.setItem('isLoggedIn', 'false');
        navigate('/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return children;
};

export default ProtectedRoutes;
