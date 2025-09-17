import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image_icon from "../Assets/logo_icon.svg";
import axios from "axios";
import toast from "react-hot-toast"

const Login = () => {
  const [data, setdata] = useState({ name: "", email: "", password: "" });
  const [islogin, setislogin] = useState(false);
  const [state,setstate] = useState("Sign Up")
  const navigate = useNavigate();

  const togglestate = () => {
    setislogin(!islogin);
    if (!islogin) {
      setstate("Login In")
    }
    else{
      setstate("Sign Up")
    }
    setdata({ name: "", email: "", password: "" }); 
  };

  const handlechange = (e) => {
    setdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    const url = `http://localhost:3000/${islogin ? "login" : "signin"}`;
    const payload = {
      email: data.email,
      password: data.password,
      ...(islogin ? {} : { name: data.name }), // only include name on signup
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" }
      });

      const resData = response.data;

      if ( resData.token) {
        sessionStorage.setItem("auth-token", resData.token);
        toast.success(`${state} successful`)
        navigate("/");
        window.location.reload();
      } else {
        toast.error(`${state} failed`);
      }
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-black-100">
      <div className="flex flex-col items-center bg-gray-900 w-full max-w-md p-8 rounded-2xl shadow-lg">
        <img src={image_icon} className="h-20 mb-4" alt="logo" />

        <h2 className="text-white text-2xl font-bold mb-6">
          {islogin ? "Log In" : "Sign Up"}
        </h2>

        <form onSubmit={handlesubmit} className="flex flex-col gap-4 w-full">
          {!islogin && (
            <input
              className="py-3 px-4 rounded-md bg-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              type="text"
              name="name"
              value={data.name}
              onChange={handlechange}
              placeholder="Username"
              required
            />
          )}
          <input
            className="py-3 px-4 rounded-md bg-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            type="email"
            name="email"
            value={data.email}
            onChange={handlechange}
            placeholder="Email Address"
            required
          />
          <input
            className="py-3 px-4 rounded-md bg-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            type="password"
            name="password"
            value={data.password}
            onChange={handlechange}
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="bg-violet-500 hover:bg-violet-600 text-white py-3 rounded-md font-semibold transition duration-200 cursor-pointer"
          >
            {islogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-sm text-white font-semibold">
          {islogin ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={togglestate}
                className="text-violet-500 font-medium cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={togglestate}
                className="text-violet-500 font-medium cursor-pointer hover:underline"
              >
                Log In
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
