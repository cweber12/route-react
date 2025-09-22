import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadVideo from "./pages/UploadVideo";
import Home from "./pages/Home";
import Map from "./pages/Map";
import ExampleVideos from "./pages/ExampleVideos";
import Navbar from "./components/navbar/Navbar.jsx";
import "./App.css";
import ViewRouteData from "./pages/ViewRouteData";

const App = () => {

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
          <Route
            path="/example-videos"
            element={<ExampleVideos />}
          />

          {isLoggedIn && (
            <>
              <Route
                path="/upload-video"
                element={<UploadVideo />}
              />
              <Route
                path="/route-data"
                element={<ViewRouteData />}
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
