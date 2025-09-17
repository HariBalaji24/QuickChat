import React, { useContext, useState } from "react";
import Leftsidebar from "../components/Leftsidebar";
import Middlesidbar from "../components/Middlesidbar";
import Rightsidebar from "../components/Rightsidebar";
import { Authcontext } from "../context/Authcontext";

const Home = () => {
  const {
    selectedUser,
    setSelectedUser,
    showProfile,
    setShowProfile,
    messages,
    setmessages,
  } = useContext(Authcontext);
  return (
    <div
      className={`backdrop-blur-xl bg-violet-300/20 border-gray-600 rounded-[5px] overflow-hidden h-screen grid grid-cols-1 relative ${
        showProfile
            ? "xl:grid-cols-[1fr_1.5fr_1fr] md:grid-cols-[1fr_1.2fr_1fr]"
            : "xl:grid-cols-[1fr_2.5fr] sm:grid-cols-[1fr_2.2fr]"
        
      }`}
    >
      <Leftsidebar />
      <Middlesidbar />
      {showProfile && <Rightsidebar />}
    </div>
  );
};

export default Home;
