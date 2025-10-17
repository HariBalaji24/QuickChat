import React from "react";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Authcontext } from "../context/Authcontext";

const ProtectedRoute = () => {
  const {token} = useContext(Authcontext);

  if (!token) {
    return <Navigate to="/login"  />;
  }

  return <Outlet />; 
};

export default ProtectedRoute;
