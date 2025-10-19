import { useState } from "react";
import { createContext } from "react";

export const Authcontext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [selecteduser, setSelectedUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [messages, setmessages] = useState([]);
  const [notifications,setnotifications] = useState([])
  const [onlineusers, setonlineusers] = useState([]);
  const [socket, setsocket] = useState();
  const [curruser, setcurruser] = useState([]);
  const [typing, settyping] = useState(false);
  const [istyping, setistyping] = useState(false);
  const [id, setid] = useState();
  const token=localStorage.getItem("auth-token")
  const endpoint = "https://quickchat-2-vzve.onrender.com"
  const value = {
    users,
    setUsers,
    selecteduser,
    setSelectedUser,
    showProfile,
    setShowProfile,
    messages,
    setmessages,
    onlineusers,
    setonlineusers,
    socket,
    setsocket,
    curruser,
    setcurruser,
    typing,
    settyping,
    istyping,
    setistyping,
    id,
    setid,
    notifications,
    setnotifications,
    token,
    endpoint
  };
  return <Authcontext.Provider value={value}>{children}</Authcontext.Provider>;
};
