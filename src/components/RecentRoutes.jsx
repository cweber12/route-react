import React, { useEffect, useState } from "react";

const RecentRoutes = ({ onSelectAttempts, selectedAttempts = [], showCompare = false }) => {
  const userName = sessionStorage.getItem("userName");
  const bucketName = "route-keypoints";

  const [recentAttempts, setRecentAttempts] = useState([]);

  const API = import.meta.env.VITE_API_BASE_URL_M;
  
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${API}/api/recent-attempts?user=${userName}`);
        const data = await res.json();
        setRecentAttempts(data);
      } catch (err) {
        console.error("Error fetching recent attempts:", err);
      }
    };

    if (userName) fetchRecent();
  }, [userName]);

  // Only allow one checked attempt at a time
  const toggleAttempt = (fullPath) => {
    const newSelectedAttempts = selectedAttempts.includes(fullPath) ? [] : [fullPath];
    onSelectAttempts(newSelectedAttempts);
  };

  // Remove expanded state, use local state for press/expand effect
  const [pressed, setPressed] = useState(null);
  const [highlighted, setHighlighted] = useState(null);

  // Helper to detect mobile (max-width: 480px)
  const isMobile = () => window.matchMedia && window.matchMedia("(max-width: 480px)").matches;

  // On mouse down, trigger highlight animation (desktop only)
  const handleMouseDown = (fullPath) => {
    if (!isMobile()) setPressed(fullPath);
  };
  // On mouse up, toggle selection and trigger highlight
  const handleMouseUp = (fullPath) => {
    if (!isMobile()) setPressed(null);
    setHighlighted(fullPath);
    toggleAttempt(fullPath);
    setTimeout(() => setHighlighted(null), 400); // duration matches animation
  };
  // On mouse leave, remove expand effect
  const handleMouseLeave = () => {
    setPressed(null);
  };

  return (
    <>
      <div className="parent-container parent-container-column">
        <div className="page-header">
          <h2>RECENT ROUTES</h2>
        </div>
        <div
          className="parent-container parent-container-row"
          style={{
            justifyContent: "center",
            width: "fit-content", 
            marginBottom: "24px",
          }}
        >
        {recentAttempts.map((attempt) => {
          const rawPath = `${attempt.basePath}/${attempt.timestamp}/route_image.jpg`;
          const encodedPath = encodeURIComponent(rawPath).replace(/%2F/g, "/");
          const imageUrl = `https://${bucketName}.s3.amazonaws.com/${encodedPath}`;
          const fullPath = `s3://${bucketName}/${attempt.basePath}/${attempt.timestamp}/`;

          const isChecked = selectedAttempts.includes(fullPath);
          const isPressed = pressed === fullPath;

          return (
            <div
              key={fullPath}
              className={`child-container thumbnail recent-route-thumbnail${isChecked ? " thumbnail--selected thumbnail--highlight" : ""}`}
              onMouseDown={() => handleMouseDown(fullPath)}
              onMouseUp={() => handleMouseUp(fullPath)}
              onMouseLeave={handleMouseLeave}
              tabIndex={0}
              role="button"
              aria-pressed={isChecked}
              style={{ position: "relative" }}
            >
              {/* Text section - fixed height at top */}
              <div className="recent-route-text">
                <p className="recent-route-title">
                  {attempt.route_name}
                </p>
                <p className="recent-route-date">
                  {attempt.timestamp.replace(
                    /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/,
                    "$1/$2/$3 at $4:$5:$6"
                  )}
                </p>
              </div>
              {/* Image container - fills remaining space */}
              <div className="thumbnail-image-container">
                <img
                  src={imageUrl}
                  alt={`Thumbnail for ${attempt.timestamp}`}
                  className="thumbnail-image"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = "/assets/mountain_cutout.PNG";
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
};

export default RecentRoutes;