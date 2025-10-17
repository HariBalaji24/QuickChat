import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../Assets/assets";
import axios from "axios";
import { Authcontext } from "../context/Authcontext";
import uploadToCloudinary from "../../backend/models/cloudinary";
import io from "socket.io-client";
import typinganimation from "../animations/Typing Indicator.json";
import loadinganimation from "../animations/Loading.json";
import Lottie from "react-lottie";

// 📌 custom hook inside file
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const Middlesidebar = () => {
  const {
    selecteduser,
    setShowProfile,
    messages,
    setmessages,
    typing,
    settyping,
    istyping,
    setistyping,
    id,
    setid,
    setsocket,
    token,
    endpoint
  } = useContext(Authcontext);

  const scrollEnd = useRef();
  const [clicked, setclicked] = useState(false);
  const [sendmessage, setsendmessage] = useState("");
  const [image, setimage] = useState(null);
  const [loading, setloading] = useState(false);
  const socketRef = useRef();
  const [previewSrc, setpreviewsrc] = useState();
  const prevUserRef = useRef(null);

  //animations
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: typinganimation,
  };
  const defaultOptions1 = {
    loop: true,
    autoplay: true,
    animationData: loadinganimation,
  };

  // 📌 handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setimage(file);
      setclicked(true);
    }
  };

  // typing animation
  const handleTyping = (e) => {
    setsendmessage(e.target.value);
    if (!typing) {
      settyping(true);
      socketRef.current.emit("typing", { room: selecteduser._id });
    }
    var typingtime = new Date().getTime();
    var length = 3000;
    setTimeout(() => {
      var timenow = new Date().getTime();
      var timediff = timenow - typingtime;
      if (timediff > length && typing) {
        socketRef.current.emit("stop typing", { room: selecteduser._id });
        settyping(false);
      }
    }, length);
  };

  // textarea height
  const changingsize = (e) => {
    const textarea = e.target;
    if (textarea.value.trim() === "" && !previewSrc) {
      textarea.style.height = "auto";
    }
    textarea.style.height = "auto";
    let height = e.target.scrollHeight;
    textarea.style.height = `${height}px`;
  };

  // posting messages
  const postmessage = async () => {
    try {
      let imageurl = null;
      if (image instanceof File) {
        imageurl = await uploadToCloudinary(image);
      }
      const trimmedmessage = sendmessage.trimEnd();
      const data = { text: trimmedmessage, image: imageurl || "" };
      if (sendmessage.trim() === "" && !previewSrc) {
        return null;
      }

      const response = await axios.post(
        `${endpoint}/postnewmessage`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            receiverid: selecteduser._id,
          },
        }
      );
      setistyping(false);
      const newMsg = response.data.message;
      setmessages((prev) => [...prev, newMsg]);
      setimage(null);
      setclicked(false);
      setsendmessage("");
      socketRef.current.emit("send message", {
        ...newMsg,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  //finding previous user
  useEffect(() => {
    if (prevUserRef.current && prevUserRef.current._id !== selecteduser?._id) {
      setsendmessage("");
      setimage(null);
    }
    prevUserRef.current = selecteduser;
  }, [selecteduser]);

  // establishing socket
  useEffect(() => {
    socketRef.current = io(endpoint);
    socketRef.current.emit("setup", { _id: id });
    socketRef.current.on("connected", () => {
      setsocket(true);
    });
    socketRef.current.on("new message", (newMessage) => {
      setmessages((prev) => [...prev, newMessage]);
    });
    socketRef.current.on("typing", () => setistyping(true));
    socketRef.current.on("stop typing", () => {
      setistyping(false);
    });
  }, [id]);

  // 📌 scroll to bottom
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView();
    }
  }, [messages]);

  // 📌 get logged-in user id
  useEffect(() => {
    async function fetchid() {
      try {
        const response = await axios.get(`${endpoint}/getid`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setid(response.data.id);
      } catch (error) {
        console.log(error);
      }
    }
    fetchid();
  }, [token]);

  // 📌 fetch messages + reset input when user changes
  useEffect(() => {
    async function gettingMessages() {
      try {
        if (!selecteduser) return;
        setloading(true);
        if (setsendmessage) {
          const response = await axios.get(
            `${endpoint}/getmessages`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                senderid: selecteduser._id,
              },
            }
          );

          setmessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    }

    gettingMessages();
  }, [selecteduser, token, setmessages]);

  useEffect(() => {
    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setpreviewsrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setpreviewsrc(image || "");
    }
  }, [image]); // ✅ Only runs when image changes

  const toggleProfile = () => {
    if (previewSrc) {
      setShowProfile(false);
    } else {
      setShowProfile((prev) => !prev);
    }
  };
  return selecteduser ? (
    <div className="relative inset-0 border-1 h-full overflow-y-auto flex flex-col">
      <div
        className="absolute inset-0 bg-center opacity-10 z-0"
        style={{ backgroundImage: `url(${assets.background_icon})` }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="bg-gray-900/60 flex h-16 justify-between items-center ">
          <div className="flex items-center gap-1">
            <img
              className="ml-2 h-12 w-13 rounded-full cursor-pointer"
              src={selecteduser.profilepic || assets.avatar_icon}
              alt=""
              onClick={toggleProfile}
            />
            <p className="text-white cursor-pointer xl:ml-1">
              {selecteduser.name}
            </p>
          </div>
          <img src={assets.menu_icon} className="h-7 cursor-pointer" alt="" />
        </div>

        {/* Image Preview */}
        {clicked && image ? (
          <div className="flex flex-col justify-center items-center p-3 bg-gray-900/60 gap-[30px]">
            <div className="flex gap-[90%] justify-center  w-full">
              <img
                className="h-[30px] w-[30px] rounded-3xl cursor-pointer"
                src="https://www.freeiconspng.com/thumbs/close-button-png/black-circle-close-button-png-5.png"
                alt=""
                onClick={() => {
                  setclicked(false);
                  setpreviewsrc("");
                }}
              />
              <img
                className="h-[30px] w-[30px] rounded-3xl cursor-pointer"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgGMdI42JIBfHY3J24vKX0qQjk4izQeEtPb1BZb1uLjQEee8GuZCzLPlnHnBwqHHU_g7s&usqp=CAU"
                alt=""
              />
            </div>
            <div className="lg:max-h-[425px] md:h-full flex justify-center items-center  aspect-auto">
              <img
                src={previewSrc}
                alt="preview"
                className="w-full h-full rounded-lg shadow-lg border-white border-1"
              />
            </div>
            <div className="flex px-2 mb-3 gap-2 w-full justify-between max-w-[90%]">
              <div className="bg-black opacity-50 w-full px-5 flex justify-between items-center rounded-[10px]">
                <textarea
                  value={sendmessage}
                  onChange={handleTyping}
                  rows={1}
                  placeholder="Add a caption"
                  className="w-full resize-none overflow-hidden rounded-lg outline-none text-[15px] text-white bg-transparent"
                />

                <input
                  type="file"
                  id="input"
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                  hidden
                />
                <label htmlFor="input">
                  <img
                    src={assets.gallery_icon}
                    className="cursor-pointer h-[30px] px-1"
                    alt=""
                  />
                </label>
              </div>
              <img
                onClick={() => {
                  setclicked(false);
                  postmessage();
                }}
                src={assets.send_button}
                className="cursor-pointer"
                alt=""
              />
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-violet-900 scrollbar-track-transparent">
            {messages && messages.length > 0 ? (
              messages.map((msg, index) => {
                const isSender = msg.senderId === id;
                return (
                  <div
                    key={index}
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex flex-col max-w-[65%]">
                      <div
                        className={`px-3 py-2 text-[14px] rounded-2xl break-words whitespace-pre-wrap ${
                          isSender
                            ? "bg-violet-500 text-white rounded-br-none"
                            : "bg-blue-400 text-white rounded-bl-none"
                        }`}
                      >
                        {msg.image ? (
                          <div>
                            <img
                              src={msg.image}
                              alt="sent media"
                              className="rounded-md h-[200px] max-w-full cursor-pointer object-cover"
                            />
                            {msg.text !== "" && (
                              <p className="mt-1 break-words">{msg.text}</p>
                            )}
                          </div>
                        ) : (
                          <p className="break-words whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-300 mt-1 self-end">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div ref={scrollEnd}></div>
                  </div>
              )
              })
            ) : (
              <p className="text-gray-400 text-center">No messages yet</p>
            )}
          </div>
        ) : (
          <span className="mb-2 mt-1 ml-3 ">
            <Lottie
              options={defaultOptions1}
              height={30} // adjust size
              width={80} // adjust size
              isClickToPauseDisabled={true}
              style={{
                display: "flex",
                justifyItems: "start",
                alignItems: "self-start",
                marginLeft: 0,
              }}
            />
          </span>
        )}
        {istyping && (
          <span className="mb-2 mt-1 ml-3 ">
            <Lottie
              options={defaultOptions}
              height={30} // adjust size
              width={80} // adjust size
              isClickToPauseDisabled={true}
              style={{
                display: "flex",
                justifyItems: "start",
                alignItems: "self-start",
                marginLeft: 0,
              }}
            />
          </span>
        )}
        {/* Input Area */}
        {!clicked && (
          <div className="flex  px-2 mb-3 gap-2 w-full justify-between items-center">
            <div className="bg-gray-500 w-full py-1 px-4 flex justify-between items-center rounded-[10px]">
              <input
                type="file"
                id="input"
                accept="image/png, image/jpeg "
                onChange={handleFileUpload}
                hidden
              />
              <label htmlFor="input">
                <img
                  src={assets.gallery_icon}
                  className="cursor-pointer h-[30px]  p-0.5 mr-2 "
                  alt=""
                />
              </label>
              <textarea
                value={sendmessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim() !== null) {
                    e.preventDefault();
                  }
                  changingsize(e);
                }}
                rows={1}
                placeholder="Type a message..."
                className="w-full resize-none  outline-none max-h-[230px] text-[15px] m-1 text-white bg-transparent overflow-auto"
              />

              <img
                onClick={() => {
                  setclicked(false);
                  postmessage();
                }}
                src={assets.send_button}
                className="p-1 cursor-pointer h-[40px]"
                alt=""
              />
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-white gap-4">
      <img src={assets.logo_big} alt="Logo" className="w-1/2 max-w-[250px]" />
      <p className="text-lg font-medium">Connect instantly, from anywhere</p>
    </div>
  );
};

export default Middlesidebar;
