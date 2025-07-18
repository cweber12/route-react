// TimestampThumbnails.jsx
import React, { useState } from "react";
import CompareImageProcessor from "./CompareImageProcessor";

export default function TimestampThumbnails({
  basePath,            // e.g. "userName/Area/Subarea/Route" or "s3://route-keypoints/userName/..."
  timestamps,          // array of { name: "2025-05-10_14-30-00", type: "timestamp" }
  bucketName,          // e.g. "route-keypoints"
  checkedTimestamps,   // array of checked folder URIs, e.g. ["s3://route-keypoints/user/.../timestamp/"]
  onToggle,            // function(folderUri: string) => void
}) {
  // Normalize base path: strip "s3://bucketName/" if present, then trim slashes
  let prefix = basePath;
  const s3Prefix = `s3://${bucketName}/`;
  if (prefix.startsWith(s3Prefix)) {
    prefix = prefix.slice(s3Prefix.length);
  }
  const cleanBase = prefix.replace(/^\/+|\/+$/g, "");

  // Remove expanded state, use local state for press/expand effect
  const [pressed, setPressed] = useState(null);

  // Helper to detect mobile (max-width: 480px)
  const isMobile = () => window.matchMedia && window.matchMedia("(max-width: 480px)").matches;

  // On mouse down, expand the card visually (desktop only)
  const handleMouseDown = (name) => {
    if (!isMobile()) setPressed(name);
  };
  // On mouse up, toggle selection and remove expand effect
  const handleMouseUp = (name, folderUri) => {
    if (!isMobile()) setPressed(null);
    onToggle(folderUri);
  };
  // On mouse leave, remove expand effect
  const handleMouseLeave = () => {
    setPressed(null);
  };

  return (
    <> 
    <div 
    className="parent-container parent-container-row" 
    style={{ 
      width: "100%", 
      justifyContent: "flex-start", 
      alignItems: "center", 
      }}
      >
      {[...timestamps].slice().reverse().map((t, idx) => {
        const folderUri = `s3://${bucketName}/${cleanBase}/${t.name}/`;
        const key = `${cleanBase}/${t.name}/route_image.jpg`;
        const url =
          `https://${bucketName}.s3.amazonaws.com/` +
          encodeURIComponent(key).replace(/%2F/g, "/");

        // Use a regex with capture groups for date formatting
        const label = t.name.replace(
          /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/,
          "$1/$2/$3 at $4:$5:$6"
        );

        const isChecked = checkedTimestamps.includes(folderUri);
        const isPressed = pressed === t.name;

        return (
          <div
            key={t.name + '_' + idx}
            className={`child-container thumbnail recent-route-thumbnail${isChecked ? " thumbnail--selected thumbnail--highlight" : ""}`}
            onMouseDown={() => handleMouseDown(t.name)}
            onMouseUp={() => handleMouseUp(t.name, folderUri)}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-pressed={isChecked}
            style={{ position: "relative" }}
          >
            {/* Date section - fixed height at top */}
            <div className="recent-route-text">
              <p className="recent-route-date">
                {label}
              </p>
            </div>
            {/* Checkbox positioned absolutely */}
            <input
              type="checkbox"
              checked={isChecked}
              onChange={e => { e.stopPropagation(); onToggle(folderUri); }}
              className="recent-route-checkbox"
              style={{display: "none"}}
            />
            {/* Image container - fills remaining space */}
            <div className="thumbnail-image-container">
              <img
                src={url}
                alt={t.name}
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
}
