import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const {token} = useContext(Authcontext);

  if (!token) {
    return <Navigate to="/login"  />;
  }

  return <Outlet />; 
};

export default ProtectedRoute;
