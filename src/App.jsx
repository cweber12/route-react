import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadVideo from "./pages/UploadVideo";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import ViewRouteData from "./pages/ViewRouteData";

const App = () => {
  const [videoPath, setVideoPath] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const parallax = document.querySelector('.parallax-bg');
      if (parallax) {
        parallax.style.transform = `translateY(${scrollTop * 0.1}px)`; // Slower scroll
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const user = sessionStorage.getItem("userName");
    if (user) setIsLoggedIn(true);
    setLoginChecked(true);
  }, []);

  useEffect(() => {
    const clearTempOnUnload = () => {
      if (sessionStorage.getItem("video_uploaded")) {
        fetch(`${API}/api/clear-temp`, {
          method: "DELETE",
          keepalive: true  // so it works during page unload
        });
      }
    };
  
    window.addEventListener("beforeunload", clearTempOnUnload);
    return () => {
      window.removeEventListener("beforeunload", clearTempOnUnload);
    };
  }, []);

  if (!loginChecked) return null; // or a loading spinner

  return (
    <>
      <Router>
        <Navbar isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)} />
        <Routes>
          <Route
            path="/"
            element={
              <Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            }
          />

          {isLoggedIn && (
            <>
              <Route
                path="/upload-video"
                element={<UploadVideo setVideoPath={setVideoPath} />}
              />
              <Route
                path="/route-data"
                element={<ViewRouteData onFinalFolderSelect={setVideoPath} />}
              />
              <Route
                path="/map"
                element={<Map />}
              />
            </>
          )}
        </Routes>
      </Router>
    </>
  );
};

export default App;
