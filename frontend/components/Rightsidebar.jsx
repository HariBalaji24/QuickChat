import React, { useContext, useEffect, useState } from "react";
import assets, { imagesDummyData } from "../Assets/assets";
import { Authcontext } from "../context/Authcontext";
import axios from "axios";

const Rightsidebar = () => {
  const { selecteduser, id, setShowProfile, messages, setmessages } =
    useContext(Authcontext);

  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
  };

  const deletemessage = async () => {
    setmessages([])
  };
  
  

  return (
    <div className="overflow-y-auto max-w-screen ">
      <div className="mx-2 mt-2 cursor-pointer">
        <img
          src="https://w7.pngwing.com/pngs/57/62/png-transparent-computer-icons-button-closed-angle-rectangle-logo.png"
          onClick={toggleProfile}
          className="h-8 w-8 rounded-full"
          alt=""
        />
      </div>
      <div className="flex flex-col text-center items-center mt-1 gap-1 text-white">
        <img
          className="h-20 w-20 rounded-full"
          src={selecteduser.profilepic || assets.avatar_icon}
          alt=""
        />
        <p className="text-[17px] font-bold animate__bounce">
          {selecteduser.name}
        </p>
        <p className="text-[14px] max-w-[90%] flex items-center text-gray-300">
          {selecteduser.bio}
        </p>
      </div>

      <hr className="border-gray-500 mt-5 border" />

      <div className="my-4 mx-4">
        <p className="text-white text-lg mb-2">Media</p>
        <div className="grid grid-cols-2 gap-3 cursor-pointer">
          {Array.isArray(messages) && messages.map(
            (message, index) =>
              message.image && (
                <img
                  key={index}
                  src={message.image}
                  className="rounded-md object-cover h-30 w-60 transition-transform duration-200 shadow-md"
                />
              )
          )}
        </div>
      </div>
      <div className="flex w-full justify-center my-8">
        <button
          onClick={deletemessage}
          className="text-white px-7 py-3 rounded-full bg-violet-500 cursor-pointer"
        >
          Delete messages
        </button>
      </div>
    </div>
  );
};

export default Rightsidebar;
