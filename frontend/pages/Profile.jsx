import React, { useState, useEffect } from "react";
import assets from "../Assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import uploadToCloudinary from "../../backend/models/cloudinary";
const Profile = () => {
  const [selectedimage, setselectedimage] = useState(null);
  const [name, setname] = useState("");
  const [bio, setbio] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("auth-token");

  useEffect(() => {
    async function fetchdetails() {
      try {
        const response = await axios.get(
          "https://quickchat-vykk.onrender.com/getuserdetails",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setname(response.data.user.name || "");
        setbio(response.data.user.bio || "");
        setselectedimage(response.data.user.profilepic || null);
      } catch (error) {
        console.error("Fetch details error:", error);
      }
    }
    fetchdetails();
  }, [token]);

  const updatedetails = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = selectedimage;

      if (selectedimage instanceof File) {
        imageUrl = await uploadToCloudinary(selectedimage);
      }

      const data = { profilepic: imageUrl, name, bio };

      const response = await axios.patch(
        "https://quickchat-vykk.onrender.com/update-profile",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile updated:", response.data.user.profilepic);
      toast.success("Profile updated successfully!");
      setselectedimage(response.data.user.profilepic);
      navigate("/");
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const previewSrc =
    selectedimage instanceof File
      ? URL.createObjectURL(selectedimage)
      : selectedimage || assets.avatar_icon;

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-gray-500 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Profile Details
        </h2>
        <form
          onSubmit={updatedetails}
          className="flex flex-col gap-4 text-white"
        >
          <input
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setselectedimage(file);
            }}
            accept=".png,.jpg,.jpeg"
            type="file"
            id="input"
            hidden
          />
          <label htmlFor="input" className="flex justify-center cursor-pointer">
            <img
              className="h-28 w-28 object-cover rounded-full border-3 border-violet-400 shadow-lg"
              src={previewSrc}
              alt="Profile Preview"
            />
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setname(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Enter your name"
          />
          <textarea
            value={bio}
            onChange={(e) => setbio(e.target.value)}
            rows={4}
            className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            placeholder="Write something about yourself..."
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-violet-500 hover:bg-violet-600 text-white py-2 rounded-lg font-semibold cursor-pointer shadow-md transition duration-200"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
