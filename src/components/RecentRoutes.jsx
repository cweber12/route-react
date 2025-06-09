import React, { useEffect, useState } from "react";
import CompareImageProcessor from "./CompareImageProcessor";

const RecentRoutes = () => {
  const userName = sessionStorage.getItem("userName");
  const bucketName = "route-keypoints";

  const [recentAttempts, setRecentAttempts] = useState([]);
  const [checkedAttempts, setCheckedAttempts] = useState([]);

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

  const toggleAttempt = (fullPath) => {
    setCheckedAttempts((prev) =>
      prev.includes(fullPath) ? prev.filter((p) => p !== fullPath) : [...prev, fullPath]
    );
  };

  // Extract coordinates from recent attempts for map pins
  const getCoordinatesFromAttempts = () => {
    return recentAttempts
      .filter(attempt => attempt.latitude && attempt.longitude) // Only attempts with coordinates
      .map(attempt => ({
        latitude: attempt.latitude,
        longitude: attempt.longitude,
        name: attempt.route_name,
        path: `${attempt.basePath}`, // Use basePath for routing
      }));
  };

  const handlePinClick = (routePath) => {
    // Optional: Navigate to that route or highlight attempts for that route
    console.log("Pin clicked for route:", routePath);
  };

  // Remove expanded state, use local state for press/expand effect
  const [pressed, setPressed] = useState(null);

  // Helper to detect mobile (max-width: 480px)
  const isMobile = () => window.matchMedia && window.matchMedia("(max-width: 480px)").matches;

  // On mouse down, expand the card visually (desktop only)
  const handleMouseDown = (fullPath) => {
    if (!isMobile()) setPressed(fullPath);
  };
  // On mouse up, toggle selection and remove expand effect
  const handleMouseUp = (fullPath) => {
    if (!isMobile()) setPressed(null);
    toggleAttempt(fullPath);
  };
  // On mouse leave, remove expand effect
  const handleMouseLeave = () => {
    setPressed(null);
  };

  return (
    <>
      <CompareImageProcessor selectedS3PathArray={checkedAttempts} />

      <div className="parent-container parent-container-row" style={{justifyContent: "flex-start"}}>
        {recentAttempts.map((attempt) => {
          const rawPath = `${attempt.basePath}/${attempt.timestamp}/route_image.jpg`;
          const encodedPath = encodeURIComponent(rawPath).replace(/%2F/g, "/");
          const imageUrl = `https://${bucketName}.s3.amazonaws.com/${encodedPath}`;
          const fullPath = `s3://${bucketName}/${attempt.basePath}/${attempt.timestamp}/`;

          const isChecked = checkedAttempts.includes(fullPath);
          const isPressed = pressed === fullPath;

          return (
            <div
              key={fullPath}
              className={`child-container thumbnail recent-route-thumbnail${isChecked ? " thumbnail--selected" : ""}${isPressed ? " thumbnail--expand" : ""}`}
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
              {/* Checkbox positioned absolutely */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={e => { e.stopPropagation(); toggleAttempt(fullPath); }}
                className="recent-route-checkbox"
              />
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
    </>
  );
};

export default RecentRoutes;