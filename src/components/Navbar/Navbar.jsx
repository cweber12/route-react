import { useState, useEffect, useRef } from "react";
import { Nav, NavLink, UserIconContainer, MenuIcon } from "./NavbarElements";
// import styled from "styled-components";
import { useNavigate, useLocation } from 'react-router-dom'; 

const Navbar = ({ isLoggedIn, onLogout }) => {
  const userName = sessionStorage.getItem("userName");
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadApiAvailable, setIsUploadApiAvailable] = useState(true);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);
  const [displayOptions, setDisplayOptions] = useState(false);
  
  const API = import.meta.env.VITE_API_BASE_URL_M;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          userIconRef.current && 
          !userIconRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Check connection to VITE_API_BASE_URL_P
    const uploadApiUrl = import.meta.env.VITE_API_BASE_URL_P;
    if (!uploadApiUrl) {
      setIsUploadApiAvailable(false);
      return;
    }
    fetch(`${uploadApiUrl}/api/health`, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error('No connection');
        setIsUploadApiAvailable(true);
      })
      .catch(() => setIsUploadApiAvailable(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/clear-temp`, { method: "DELETE" });
      sessionStorage.clear();
      if (onLogout) onLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePageChange = async () => {
    try {
      await fetch(`${API}/api/clear-temp`, { method: "DELETE" });
      window.location.reload(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
     
  return (
    <>
      {isLoggedIn && (
        <Nav>
          {/* Top section - User icon in upper right */}

            {/* Use a regular <img> tag for troubleshooting */}
              <MenuIcon
                src="/assets/menu.png"
                alt="Menu Icon"
                onClick={() => setDisplayOptions(!displayOptions)}
              />
              {/* Dropdown menu for navigation links */}
              {displayOptions && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    background: "rgba(9, 22, 29, 0.98)",
                    borderRadius: "0 0 4px 4px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 1002,
                    minWidth: "180px"
                  }}
                >
                  <NavLink 
                    to="/scan-video" 
                    className={location.pathname === "/scan-video" ? "active-link" : ""}
                    onClick={handlePageChange}
                    style={!isUploadApiAvailable ? { pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed' } : {}}
                    disabled={!isUploadApiAvailable}
                  >
                    SCAN A VIDEO
                  </NavLink>
                  <NavLink 
                    to="/route-data" 
                    className={location.pathname === "/route-data" ? "active-link" : ""}
                    onClick={handlePageChange}
                  >
                    AREAS & ROUTES
                  </NavLink>
                  <NavLink 
                    to="/map" 
                    className={location.pathname === "/map" ? "active-link" : ""}
                    onClick={handlePageChange}
                  >
                    MAP
                  </NavLink>
                </div>
              )}
            <UserIconContainer>
              <div 
                ref={userIconRef}
                className="user-icon"
                onClick={toggleDropdown}
                style={{ cursor: "pointer" }}
              >
              </div>

              {/* Dropdown Menu - positioned from right edge */}
              {isDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minWidth: "140px",
                    zIndex: 1001,
                    marginTop: "5px",
                    transformOrigin: "top right",
                    animation: "dropdownExpand 0.2s ease-out",
                    opacity: 1,
                    transform: "scale(1)",
                  }}
                >
                  <div 
                    style={{
                      padding: "8px 16px",
                      borderBottom: "1px solid #eee",
                      fontSize: "14px",
                      color: "#666",
                      fontWeight: "500"
                    }}
                  >
                    <h4 style={{margin: "0"}}>{userName}</h4>  
                  </div>
                  <div 
                    style={{
                      padding: "8px 16px",
                      fontSize: "14px",
                      color: "#333",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    <span
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      Logout
                    </span>
                  </div>
                </div>
              )}
            </UserIconContainer>
          
        </Nav>
      )}
    </>
  );
};

export default Navbar;
