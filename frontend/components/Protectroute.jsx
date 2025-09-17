import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("auth-token");

  if (!token) {
    return <Navigate to="/login"  />;
  }

  return <Outlet />; 
};

export default ProtectedRoute;
