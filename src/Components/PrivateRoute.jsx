import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logOut } from '../services/authService';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  console.log('PrivateRoute: currentUser =', currentUser);

  if (loading) return <div>Loading...</div>;

  return currentUser ? children : <Navigate to="/register" replace />;
};

export default PrivateRoute; 