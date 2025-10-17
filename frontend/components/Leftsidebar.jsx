import React, { useContext, useEffect, useRef, useState } from "react";
import assests from "../Assets/assets";
import { Link } from "react-router-dom";
import axios from "axios";
import { Authcontext } from "../context/Authcontext";
import io from "socket.io-client";
import close_icon from "../Assets/close_icon.png"
const Leftsidebar = () => {
  const {
    users,
    setUsers,
    setSelectedUser,
    selecteduser,
    id,
    setsocket,
    setistyping,
    notifications,
    setnotifications,
    token,
    endpoint
  } = useContext(Authcontext);

  const [state, setState] = useState(false);
  const socketRef = useRef();
  const [onlineusers, setonlineusers] = useState({});
  const [searchquery,setsearchquery] = useState("")

  const logout = () => {
    localStorage.removeItem("auth-token");
    window.location.reload();
  };

  const searchresults= async(e)=>{
    setsearchquery(e.target.value.toLowerCase())
  }

  useEffect(() => {
    socketRef.current = io(endpoint);
    socketRef.current.emit("setup", { _id: id });

    socketRef.current.on("connected", () => {
      setsocket(true);
    });

    socketRef.current.on("useronline", (activeusers) => {
      setonlineusers(activeusers);
    });

    socketRef.current.on("new notification", (notification) => {
      setnotifications((prev) => [...prev, notification]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, setsocket]);
  
  useEffect(() => {
    async function fetchUsers() {
      const response = await axios.get(`${endpoint}/getallusers`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
    }
    fetchUsers();
  }, [token, setUsers]);

  useEffect(() => {
    if (!selecteduser) return;
    const hasNotifications = notifications.some(
      (n) => n.senderId === selecteduser._id
    );
    if (hasNotifications) {
      setnotifications([]);
    }
  }, [notifications, selecteduser]);
  return (
    <div className="px-4 border-r-4 h-screen">
      <div className="flex justify-between items-center mt-3">
        <img className="max-w-40" src={assests.logo} alt="Logo" />
        <div className="relative">
          <div
            onMouseEnter={() => setState(true)}
            onMouseLeave={() => setState(false)}
            className="cursor-pointer"
          >
            <img className="max-h-5" src={assests.menu_icon} alt="Menu" />
            <div
              className={`absolute xl:w-[120px] md:w-[100px] right-0 bg-gray-400 shadow-lg z-10 ${
                state ? "block" : "hidden"
              }`}
            >
              <Link to={"/profile"}>
                <p className="text-center cursor-pointer text-sm text-white py-2 hover:bg-gray-400 transition duration-200">
                  Edit profile
                </p>
              </Link>
              <hr className="border-gray-600" />
              <p
                onClick={logout}
                className="text-center cursor-pointer text-sm py-2 text-white hover:bg-gray-400 transition duration-200"
              >
                Logout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex p-2 mt-7 rounded-[50px] bg-gray-500 text-[15px] ">
        <img src={assests.search_icon} className="w-6 mx-2" alt="" />
        <input
          type="text"
          className="ml-1 w-[100%] outline-none"
          placeholder="Search a chat"
          value={searchquery}
          onChange={(e)=>{searchresults(e)}}
        />
        {
          searchquery && <img src={close_icon} className="w-6 h-5 mt-0.5 mx-2 cursor-pointer rounded-2xl" onClick={()=>setsearchquery("")} alt="" />
        }
        
      </div>

      <div className="flex flex-col mt-6">
        {users
          .filter(user=> user.name.toLowerCase().includes(searchquery))
          .slice()
          .sort((a, b) => {
            const aonline = onlineusers[a._id] ? 1 : 0;
            const bonline = onlineusers[b._id] ? 1 : 0;
            return bonline - aonline;
          })
          .map((user, index) => {
            const userNotifications = notifications.filter(
              (n) => n.senderId === user._id
            );
            const isonline = onlineusers[user._id] ? (
              <span className="text-green-500 text-[12px]">Online</span>
            ) : (
              <span className=" text-[12px]">Offline</span>
            );
            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedUser(user);
                  setnotifications([]);
                }}
                className="flex items-center text-white cursor-pointer py-2 pl-2 rounded-[10px] hover:bg-gray-500"
              >
                <img
                  src={user.profilepic || assests.avatar_icon}
                  className="h-13 w-13 rounded-full"
                  alt=""
                />
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col justify-between ml-3">
                    <p>{user.name}</p>
                    <span className="text-[12px]">{isonline}</span>
                  </div>
                  {userNotifications.length > 0 && (
                    <p className="bg-green-400 font-bold text-sm rounded-full px-[6px] mr-3">
                      {userNotifications.length}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Leftsidebar;
