import React, { useState, useEffect, useRef } from "react";
import { Nav, NavTop, NavBottom, NavLink, NavMenu, UserIconContainer } from "./NavbarElements";
import { useNavigate } from 'react-router-dom'; 

const Navbar = ({ isLoggedIn, onLogout }) => {
  const userName = sessionStorage.getItem("userName");
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);
  
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
          <NavTop>
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
                    
                    // Animation properties
                    transformOrigin: "top right",
                    animation: "dropdownExpand 0.2s ease-out",
                    
                    // Initial state for animation
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
          </NavTop>

          {/* Bottom section - Navigation links */}
          <NavBottom>
            <NavMenu>
              <NavLink 
                to="/upload-video" 
                className={({ isActive }) => (isActive ? "active-link" : "")}
                onClick={handlePageChange}
              >
                Upload
              </NavLink>
              <NavLink 
                to="/route-data" 
                className={({ isActive }) => (isActive ? "active-link" : "")}
                onClick={handlePageChange}
              >
                Routes
              </NavLink>
             
            </NavMenu>
          </NavBottom>
        </Nav>
      )}
    </>
  );
};

export default Navbar;
